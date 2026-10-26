import { apiClient } from "./client";
import { parseApiError } from "./errors";
import type {
  AgeRating,
  ApiEventDetail,
  ApiEventListItem,
  ApiEventPage,
  ApiEventSummary,
  CategorySummary,
  EventCategory,
  EventDetails,
  EventSearchFilters,
  EventSummary,
  HomeEvents,
} from "./events.types";

export type * from "./events.types";

export const SELLING_OUT_THRESHOLD = 0.8;

const CATEGORY_ORDER: readonly EventCategory[] = [
  "festas",
  "shows",
  "palestras",
  "esportes",
  "academicos",
  "outros",
];

const CATEGORY_TO_API_PARAM: Record<EventCategory, string> = {
  festas: "Festas",
  shows: "Shows",
  palestras: "Palestras",
  esportes: "Esportes",
  academicos: "Acadêmicos",
  outros: "Outros",
};

const AGE_RATINGS: readonly AgeRating[] = ["L", "10", "12", "14", "16", "18"];

const SAO_PAULO_OFFSET_MS = -3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isSoldOut(event: EventSummary): boolean {
  return (
    event.capacity !== null &&
    event.ticketsSold !== null &&
    event.ticketsSold >= event.capacity
  );
}

export function soldRatio(event: EventSummary): number {
  if (event.capacity === null || event.ticketsSold === null) return 0;
  return event.capacity > 0 ? event.ticketsSold / event.capacity : 0;
}

export function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildEventQueryParams(
  filters: EventSearchFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = { limit: 100 };
  const search = filters.search?.trim();
  const city = filters.city?.trim();
  const categories = filters.categories ?? [];

  if (search) {
    params.search = search;
  }
  if (categories.length === 1) {
    params.category = CATEGORY_TO_API_PARAM[categories[0]];
  }
  if (city) {
    params.city = city;
  }
  if (filters.startDate) {
    const startParam = toDateParam(filters.startDate);
    const endParam = filters.endDate
      ? toDateParam(filters.endDate)
      : startParam;
    params.startDate = startParam;
    params.endDate = endParam;
  }

  return params;
}

const normalizeSearch = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Busca eventos publicados filtrados via `GET /events` com query parameters (GOL-135).
 * Suporta busca textual (nome, descrição ou agremiação), categorias, cidade e intervalo de datas.
 */
export async function searchEvents(
  filters: EventSearchFilters,
  fallbackSummaries: readonly EventSummary[] = [],
): Promise<EventSummary[]> {
  const params = buildEventQueryParams(filters);
  const { data } = await apiClient.get<ApiEventPage>("/events", { params });

  const fallbackById = new Map(
    fallbackSummaries.map((summary) => [summary.id, summary]),
  );

  let mapped = (data.data ?? []).map((item) =>
    toListItemSummary(item, fallbackById.get(item.id)),
  );

  const searchTerm = filters.search?.trim()
    ? normalizeSearch(filters.search.trim())
    : "";

  // Caso o usuário tenha pesquisado pelo nome da agremiação/local (que não consta em events.name/description),
  // complementamos com os eventos cujos filtros de data/cidade/categoria batem e cujo organizador/local corresponde.
  if (searchTerm && fallbackSummaries.length > 0) {
    const existingIds = new Set(mapped.map((item) => item.id));
    const extraMatches = fallbackSummaries.filter((event) => {
      if (existingIds.has(event.id)) return false;
      const matchesOrgOrVenue =
        normalizeSearch(event.organizerName).includes(searchTerm) ||
        normalizeSearch(event.venueName).includes(searchTerm);
      if (!matchesOrgOrVenue) return false;
      if (
        filters.city &&
        !normalizeSearch(event.venueName).includes(
          normalizeSearch(filters.city),
        )
      ) {
        return false;
      }
      if (filters.startDate) {
        const startDay = new Date(
          filters.startDate.getFullYear(),
          filters.startDate.getMonth(),
          filters.startDate.getDate(),
        ).getTime();
        const endDateObj = filters.endDate ?? filters.startDate;
        const endDay = new Date(
          endDateObj.getFullYear(),
          endDateObj.getMonth(),
          endDateObj.getDate(),
          23,
          59,
          59,
          999,
        ).getTime();
        const eventStart = new Date(event.startDate).getTime();
        const eventEnd = new Date(event.endDate).getTime();
        if (eventEnd < startDay || eventStart > endDay) return false;
      }
      return true;
    });
    mapped = [...mapped, ...extraMatches];
  }

  if (filters.categories && filters.categories.length > 0) {
    mapped = mapped.filter((event) =>
      filters.categories!.includes(event.category),
    );
  }

  return mapped;
}

export async function getHomeEvents(now = new Date()): Promise<HomeEvents> {
  const { data } = await apiClient.get<ApiEventSummary[]>("/events/summary");

  const upcoming = data.filter((event) => new Date(event.endDate) > now);
  const summaries = upcoming.map(toEventSummary);
  const featuredIds = upcoming
    .filter((event) => event.featured)
    .map((event) => event.id);

  return buildHomeEvents(summaries, featuredIds, now);
}

/**
 * Busca os detalhes completos de um evento publicado via `GET /events/:id`.
 * Retorna `null` quando o evento não existe, não está publicado (404) ou o ID é inválido (400).
 */
export async function getEventById(id: string): Promise<EventDetails | null> {
  const trimmedId = id.trim();
  if (!trimmedId) return null;

  try {
    const { data } = await apiClient.get<ApiEventDetail>(
      `/events/${encodeURIComponent(trimmedId)}`,
    );
    return toEventDetails(data);
  } catch (error) {
    const { status } = parseApiError(error);
    if (status === 404 || status === 400) {
      return null;
    }
    throw error;
  }
}

export function toEventDetails(event: ApiEventDetail): EventDetails {
  return {
    id: event.id,
    title: event.name,
    tagline: event.edition ?? null,
    description: event.description ?? null,
    category: toCategory(event.category),
    ageRating: toAgeRating(event.ageRating),
    startDate: event.startDate,
    endDate: event.endDate,
    photoUrl: event.photoUrl ?? null,
    venue: event.venue
      ? {
          id: event.venue.id,
          name: event.venue.name,
          address: event.venue.address ?? null,
        }
      : null,
    organizer: event.organization
      ? {
          id: event.organization.id,
          name: event.organization.name,
          description: event.organization.description ?? null,
        }
      : null,
    ticketTypes: (event.ticketTypes ?? []).map((ticket) => ({
      id: ticket.id,
      batch: ticket.batch,
      price: Number(ticket.price),
      soldOut: ticket.quantity !== undefined ? Number(ticket.quantity) <= 0 : false,
    })),
  };
}

export function toAgeRating(value: string | null | undefined): AgeRating | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return AGE_RATINGS.includes(normalized as AgeRating)
    ? (normalized as AgeRating)
    : null;
}

function toListItemSummary(
  event: ApiEventListItem,
  fallback?: EventSummary,
): EventSummary {
  const venueName =
    event.venueName && event.venueCity
      ? `${event.venueName} · ${event.venueCity}`
      : (event.venueName || event.venueCity || fallback?.venueName || "");

  return {
    id: event.id,
    title: event.name,
    description: event.description ?? undefined,
    category: toCategory(event.category),
    organizerName: event.organizerName || fallback?.organizerName || "Organização Hubee",
    venueName,
    startDate: event.startDate,
    endDate: event.endDate,
    price:
      event.minPrice !== null && event.minPrice !== undefined
        ? Number(event.minPrice)
        : (fallback?.price ?? null),
    batchLabel: event.minPriceBatch ?? fallback?.batchLabel ?? undefined,
    capacity:
      event.capacity !== undefined
        ? event.capacity !== null
          ? Number(event.capacity)
          : null
        : (fallback?.capacity ?? null),
    ticketsSold:
      event.ticketsSold !== undefined
        ? event.ticketsSold !== null
          ? Number(event.ticketsSold)
          : null
        : (fallback?.ticketsSold ?? null),
  };
}

function toEventSummary(event: ApiEventSummary): EventSummary {
  const venueName =
    event.venueName && event.venueCity
      ? `${event.venueName} · ${event.venueCity}`
      : (event.venueName || event.venueCity || "");

  return {
    id: event.id,
    title: event.name,
    description: event.description ?? undefined,
    category: toCategory(event.category),
    organizerName: event.organizerName,
    venueName,
    startDate: event.startDate,
    endDate: event.endDate,
    price:
      event.minPrice !== null && event.minPrice !== undefined
        ? Number(event.minPrice)
        : null,
    batchLabel: event.minPriceBatch ?? undefined,
    capacity:
      event.capacity !== null && event.capacity !== undefined
        ? Number(event.capacity)
        : null,
    ticketsSold:
      event.ticketsSold !== null && event.ticketsSold !== undefined
        ? Number(event.ticketsSold)
        : null,
  };
}

export function toCategory(value: string | null): EventCategory {
  const text = (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  if (text.startsWith("festa")) return "festas";
  if (text.startsWith("show")) return "shows";
  if (text.startsWith("palestra")) return "palestras";
  if (text.startsWith("esporte")) return "esportes";
  if (text.startsWith("academic")) return "academicos";
  return "outros";
}

function buildHomeEvents(
  events: readonly EventSummary[],
  featuredIds: readonly string[],
  now: Date,
): HomeEvents {
  const upcoming = events.toSorted((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  const { start: weekStart, end: weekEnd } = currentWeek(now);
  const available = upcoming.filter((event) => !isSoldOut(event));

  return {
    featured: featuredIds
      .map((id) => available.find((event) => event.id === id))
      .filter((event) => event !== undefined),
    thisWeek: {
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      events: upcoming.filter((event) => {
        const start = new Date(event.startDate);
        return start >= weekStart && start <= weekEnd;
      }),
    },
    sellingOut: available
      .filter((event) => soldRatio(event) >= SELLING_OUT_THRESHOLD)
      .toSorted((a, b) => soldRatio(b) - soldRatio(a)),
    free: available.filter((event) => event.price === 0),
    categories: CATEGORY_ORDER.map<CategorySummary>((category) => ({
      category,
      count: upcoming.filter((event) => event.category === category).length,
    })),
    upcoming,
  };
}

function currentWeek(now: Date): { start: Date; end: Date } {
  const local = new Date(now.getTime() + SAO_PAULO_OFFSET_MS);
  const todayLocal = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  );
  const start = new Date(todayLocal - SAO_PAULO_OFFSET_MS);
  return { start, end: new Date(start.getTime() + 7 * DAY_MS - 1) };
}

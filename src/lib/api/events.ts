import { apiClient } from "./client";
import { parseApiError } from "./errors";
import type {
  AgeRating,
  ApiEventDetail,
  ApiEventSummary,
  CategorySummary,
  EventCategory,
  EventDetails,
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

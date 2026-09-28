import { apiClient } from "./client";
import type {
  ApiEvent,
  ApiOrganization,
  ApiTicketType,
  ApiVenue,
  CategorySummary,
  EventCategory,
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
  const [events, organizations, venues] = await Promise.all([
    apiClient
      .get<ApiEvent[]>("/eventos", { params: { status: "published" } })
      .then(({ data }) => data),
    apiClient.get<ApiOrganization[]>("/organizacoes").then(({ data }) => data),
    apiClient.get<ApiVenue[]>("/locais").then(({ data }) => data),
  ]);

  const upcoming = events.filter((event) => new Date(event.endDate) > now);
  const ticketTypes = await Promise.all(
    upcoming.map((event) => getTicketTypes(event.id)),
  );

  const organizerNames = new Map(
    organizations.map(({ id, name }) => [id, name]),
  );
  const venueNames = new Map(
    venues.map(({ id, name, address }) => [
      id,
      address ? `${name} · ${address.city}` : name,
    ]),
  );

  const summaries = upcoming.map((event, index) =>
    toEventSummary(event, ticketTypes[index], organizerNames, venueNames),
  );
  const featuredIds = upcoming
    .filter((event) => event.featured)
    .map((event) => event.id);

  return buildHomeEvents(summaries, featuredIds, now);
}

async function getTicketTypes(eventId: string): Promise<ApiTicketType[]> {
  try {
    const { data } = await apiClient.get<ApiTicketType[]>(
      `/eventos/${eventId}/tipos-ingresso`,
    );
    return data;
  } catch {
    return [];
  }
}

function toEventSummary(
  event: ApiEvent,
  ticketTypes: ApiTicketType[],
  organizerNames: Map<string, string>,
  venueNames: Map<string, string>,
): EventSummary {
  const cheapest = ticketTypes
    .map((ticket) => ({ ...ticket, price: Number(ticket.price) }))
    .toSorted((a, b) => a.price - b.price)[0];

  return {
    id: event.id,
    title: event.name,
    description: event.description ?? undefined,
    category: toCategory(event.category),
    organizerName: organizerNames.get(event.organizerId) ?? "",
    venueName: venueNames.get(event.venueId) ?? "",
    startDate: event.startDate,
    endDate: event.endDate,
    price: cheapest?.price ?? null,
    batchLabel: cheapest?.batch,
    capacity: null,
    ticketsSold: null,
  };
}

function toCategory(value: string | null): EventCategory {
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

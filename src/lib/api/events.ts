import { apiClient as authClient } from "./apiClient";
import { apiClient } from "./client";
import type { UserOrganization } from "./auth";
import {
  calculateSoldPercentage,
  deriveOrganizerRole,
  toOrganizacoesVinculadas,
  type EventoOrganizador,
  type OrganizacaoVinculada,
} from "@/types/organizacao";
import type {
  ApiEvent,
  ApiEventListItem,
  ApiEventPage,
  ApiOrganization,
  ApiOrganizationUser,
  ApiTicketType,
  ApiVenue,
  CategorySummary,
  EventCategory,
  EventSummary,
  GetOrganizerEventsParams,
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

export interface OrganizerSessionUser {
  id: string;
  signupIntent?: string;
  organizations?: readonly UserOrganization[];
}

/**
 * Resolve as organizações vinculadas à usuária logada.
 * - Pós-GOL-144: usa `user.organizations` retornado em `GET /auth/me`.
 * - Pré-GOL-144 (fallback em `origin/develop`): consulta `GET /organizations` e tenta
 *   `GET /organizations/:orgId/users`; caso retorne 403 e `signupIntent` seja de organizador
 *   (`"ORGANIZE"`), vincula as organizações existentes com papel `administrador`.
 */
export async function resolveUserOrganizations(
  user: OrganizerSessionUser | null,
): Promise<OrganizacaoVinculada[]> {
  if (!user) return [];

  if (Array.isArray(user.organizations)) {
    return toOrganizacoesVinculadas(user.organizations);
  }

  let organizations: ApiOrganization[] = [];
  try {
    const { data } = await apiClient.get<ApiOrganization[]>("/organizations");
    organizations = data;
  } catch {
    return [];
  }

  if (organizations.length === 0) return [];

  let anyMembersEndpointSucceeded = false;
  const matched: OrganizacaoVinculada[] = [];

  await Promise.all(
    organizations.map(async (org) => {
      try {
        const { data: members } = await authClient.get<ApiOrganizationUser[]>(
          `/organizations/${org.id}/users`,
          { skipAuthRedirect: true },
        );
        anyMembersEndpointSucceeded = true;
        const membership = members.find(
          (member) => member.userId === user.id && member.inviteStatus === "accepted",
        );
        if (membership) {
          matched.push({
            orgId: org.id,
            nome: org.name,
            role: membership.role,
            permission: membership.permission,
            papel: deriveOrganizerRole(membership.role, membership.permission),
          });
        }
      } catch {
        // Quando a rota /organizations/:id/users exigir ADMIN (pré-GOL-144), cai no fallback abaixo.
      }
    }),
  );

  if (anyMembersEndpointSucceeded) {
    return matched;
  }

  if (user.signupIntent === "ORGANIZE" || user.signupIntent === "organizer") {
    return organizations.map((org) => ({
      orgId: org.id,
      nome: org.name,
      role: "admin",
      permission: "full",
      papel: "administrador",
    }));
  }

  return [];
}

/**
 * Busca os eventos de uma organização vinculada à usuária logada.
 * Se `capacity` não vier no item de `/events`, soma `quantity` de `GET /events/:id/ticket-types`.
 */
export async function getOrganizerEvents(
  params: GetOrganizerEventsParams,
): Promise<EventoOrganizador[]> {
  const { data } = await authClient.get<ApiEventPage | ApiEventListItem[]>("/events", {
    params: { limit: 50, ...params },
  });

  const items = Array.isArray(data) ? data : data.data;

  const enriched = await Promise.all(
    items.map(async (item) => {
      if (item.capacity !== undefined && item.capacity !== null) {
        return toEventoOrganizador(item);
      }
      const ticketTypes = await getTicketTypes(item.id);
      return toEventoOrganizador(item, ticketTypes);
    }),
  );

  return enriched;
}

export function toEventoOrganizador(
  item: ApiEventListItem,
  ticketTypes: readonly ApiTicketType[] = [],
): EventoOrganizador {
  const ticketTypesCapacity = ticketTypes.reduce(
    (sum, ticket) => sum + Math.max(0, Number(ticket.quantity ?? 0)),
    0,
  );
  const capacidade =
    item.capacity !== undefined && item.capacity !== null
      ? Math.max(0, Number(item.capacity))
      : ticketTypesCapacity;
  const ingressosVendidos = Math.max(0, Number(item.ticketsSold ?? 0));

  const cheapestTicket = ticketTypes
    .map((ticket) => ({ ...ticket, price: Number(ticket.price) }))
    .toSorted((a, b) => a.price - b.price)[0];

  const precoMinimo =
    item.minPrice !== null && item.minPrice !== undefined
      ? Number(item.minPrice)
      : (cheapestTicket?.price ?? null);
  const loteMinimo = item.minPriceBatch ?? cheapestTicket?.batch ?? null;

  const local =
    item.venueName && item.venueCity
      ? `${item.venueName} · ${item.venueCity}`
      : (item.venueName ?? item.venueCity ?? "Local a definir");

  return {
    id: item.id,
    nome: item.name,
    descricao: item.description ?? "",
    categoria: toCategory(item.category),
    status: item.status ?? "draft",
    dataInicio: item.startDate,
    dataFim: item.endDate,
    local,
    precoMinimo,
    loteMinimo,
    capacidade,
    ingressosVendidos,
    percentualVendido: calculateSoldPercentage(ingressosVendidos, capacidade),
  };
}

export async function getHomeEvents(now = new Date()): Promise<HomeEvents> {
  const [eventsPayload, organizations, venues] = await Promise.all([
    apiClient
      .get<ApiEvent[] | ApiEventPage>("/events", { params: { status: "published" } })
      .then(({ data }) => data),
    apiClient.get<ApiOrganization[]>("/organizations").then(({ data }) => data),
    apiClient.get<ApiVenue[]>("/venues").then(({ data }) => data),
  ]);

  const events = Array.isArray(eventsPayload) ? eventsPayload : eventsPayload.data;
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
      `/events/${eventId}/ticket-types`,
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

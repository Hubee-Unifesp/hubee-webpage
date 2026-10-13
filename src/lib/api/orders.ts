import { apiClient } from "./apiClient";
import { apiClient as publicClient } from "./client";
import { toCategory, type ApiEvent, type ApiTicketType, type ApiVenue } from "./events";
import type { ApiOrder, ApiTicket } from "./orders.types";
import type { EventoPedido, ItemPedido, Pedido } from "@/types/pedido";

/**
 * A API de pedidos é enxuta: o pedido tem só valor, status e data. Evento e itens vêm dos ingressos
 * emitidos (que apontam para o evento e o tipo de ingresso), então um pedido sem ingressos
 * (pendente, cancelado) aparece sem evento e sem itens.
 */

export async function getMyOrders(): Promise<Pedido[]> {
  const [orders, tickets] = await Promise.all([
    apiClient.get<ApiOrder[]>("/users/me/orders").then(({ data }) => data),
    getMyTickets(),
  ]);

  const events = await getEvents(tickets.map((ticket) => ticket.eventId));

  return orders
    .map((order) => toPedido(order, tickets.filter((ticket) => ticket.orderId === order.id), events, []))
    .toSorted((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** Rejeita com 404 quando o pedido não existe ou é de outra pessoa. */
export async function getPedido(id: string): Promise<Pedido> {
  const order = await apiClient.get<ApiOrder>(`/orders/${id}`).then(({ data }) => data);

  const tickets =
    order.status === "pago" ? (await getMyTickets()).filter((ticket) => ticket.orderId === order.id) : [];
  const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];
  const [events, ticketTypes] = await Promise.all([
    getEvents(eventIds),
    Promise.all(eventIds.map(getTicketTypes)).then((lists) => lists.flat()),
  ]);

  return toPedido(order, tickets, events, ticketTypes);
}

async function getMyTickets(): Promise<ApiTicket[]> {
  try {
    const { data } = await apiClient.get<ApiTicket[]>("/users/me/tickets");
    return data;
  } catch {
    // Os ingressos só completam o pedido (evento, itens, QR): sem eles a lista continua útil.
    return [];
  }
}

async function getEvents(eventIds: readonly string[]): Promise<Map<string, EventoPedido>> {
  const found = await Promise.all([...new Set(eventIds)].map(getEvento));
  return new Map(found.filter((evento) => evento !== null).map((evento) => [evento.id, evento]));
}

async function getEvento(eventId: string): Promise<EventoPedido | null> {
  try {
    const event = await publicClient.get<ApiEvent>(`/events/${eventId}`).then(({ data }) => data);
    const venue = await publicClient
      .get<ApiVenue>(`/venues/${event.venueId}`)
      .then(({ data }) => data)
      .catch(() => null);

    return {
      id: event.id,
      nome: event.name,
      descricao: event.description ?? "",
      categoria: toCategory(event.category),
      local: venue ? (venue.address ? `${venue.name} · ${venue.address.city}` : venue.name) : "",
      dataInicio: event.startDate,
      dataFim: event.endDate,
    };
  } catch {
    return null;
  }
}

async function getTicketTypes(eventId: string): Promise<ApiTicketType[]> {
  try {
    const { data } = await publicClient.get<ApiTicketType[]>(`/events/${eventId}/ticket-types`);
    return data;
  } catch {
    return [];
  }
}

function toPedido(
  order: ApiOrder,
  tickets: readonly ApiTicket[],
  events: ReadonlyMap<string, EventoPedido>,
  ticketTypes: readonly ApiTicketType[],
): Pedido {
  return {
    id: order.id,
    numero: order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    criadoEm: order.createdAt,
    eventos: [...new Set(tickets.map((ticket) => events.get(ticket.eventId)).filter((evento) => evento !== undefined))],
    itens: toItens(tickets, ticketTypes, events),
    total: Number(order.totalAmount),
    ingressos: tickets.map((ticket) => ({
      id: ticket.id,
      tipo: ticketTypeLabel(ticketTypes.find((type) => type.id === ticket.ticketTypeId)),
      codigo: ticket.qrCode,
      status: ticket.status,
      evento: events.get(ticket.eventId) ?? null,
    })),
  };
}

function toItens(
  tickets: readonly ApiTicket[],
  ticketTypes: readonly ApiTicketType[],
  events: ReadonlyMap<string, EventoPedido>,
): ItemPedido[] {
  // Sem Map.groupBy: ele só existe a partir do Node 21 e do Safari 17.4, e a CI roda no Node 20.
  // O tipo de ingresso pertence a um evento só, então o evento do item é o do primeiro ingresso do grupo.
  const groups = new Map<string, { quantidade: number; eventId: string }>();
  for (const { ticketTypeId, eventId } of tickets) {
    const group = groups.get(ticketTypeId) ?? { quantidade: 0, eventId };
    groups.set(ticketTypeId, { ...group, quantidade: group.quantidade + 1 });
  }

  return [...groups].map(([ticketTypeId, { quantidade, eventId }]) => {
    const type = ticketTypes.find((candidate) => candidate.id === ticketTypeId);
    return {
      id: ticketTypeId,
      descricao: ticketTypeLabel(type),
      quantidade,
      valorUnitario: type ? Number(type.price) : 0,
      eventoNome: events.get(eventId)?.nome ?? null,
    };
  });
}

function ticketTypeLabel(type: ApiTicketType | undefined): string {
  return type ? `Ingresso ${type.batch}` : "Ingresso";
}

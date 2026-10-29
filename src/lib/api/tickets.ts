import { apiClient } from "./apiClient";
import { getEvents, getTicketTypes, ticketTypeLabel } from "./orders";
import type { ApiOrder, ApiTicket } from "./orders.types";
import type { MeuIngresso, MeusIngressos } from "@/types/ingresso";

/**
 * `GET /users/me/tickets` ainda responde 501 na API, então os ingressos vêm dos pedidos pagos
 * (`GET /orders/:id/tickets`, liberado para o comprador). Quando a rota existir, basta trocar a origem.
 */
export async function getMeusIngressos(now = new Date()): Promise<MeusIngressos> {
  const orders = await apiClient.get<ApiOrder[]>("/users/me/orders").then(({ data }) => data);
  const paid = orders.filter((order) => order.status === "pago");

  const tickets = await Promise.all(
    paid.map((order) =>
      apiClient.get<ApiTicket[]>(`/orders/${order.id}/tickets`).then(({ data }) => data),
    ),
  ).then((lists) => lists.flat());

  const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];
  const [events, ticketTypes] = await Promise.all([
    getEvents(eventIds),
    Promise.all(eventIds.map(getTicketTypes)).then((lists) => lists.flat()),
  ]);

  const ingressos = tickets.map<MeuIngresso>((ticket) => {
    const type = ticketTypes.find((candidate) => candidate.id === ticket.ticketTypeId);
    return {
      id: ticket.id,
      codigo: ticket.qrCode,
      status: ticket.status,
      tipo: ticketTypeLabel(type),
      valor: type ? Number(type.price) : null,
      pedidoId: ticket.orderId,
      pedidoNumero: ticket.orderId.slice(0, 8).toUpperCase(),
      evento: events.get(ticket.eventId) ?? null,
    };
  });

  return agruparIngressos(ingressos, now);
}

/**
 * Próximos: ingressos válidos de eventos que ainda não terminaram, do mais perto ao mais longe.
 * Anteriores: usados, cancelados ou de eventos encerrados, do mais recente ao mais antigo.
 * Sem o evento não dá para saber a data, então o ingresso válido fica no fim dos próximos.
 */
export function agruparIngressos(ingressos: readonly MeuIngresso[], now: Date): MeusIngressos {
  const encerrado = ({ evento }: MeuIngresso) => evento !== null && new Date(evento.dataFim) <= now;
  const inicio = ({ evento }: MeuIngresso) => evento?.dataInicio ?? "\uffff";

  return {
    proximos: ingressos
      .filter((ingresso) => ingresso.status === "emitido" && !encerrado(ingresso))
      .toSorted((a, b) => inicio(a).localeCompare(inicio(b))),
    anteriores: ingressos
      .filter((ingresso) => ingresso.status !== "emitido" || encerrado(ingresso))
      .toSorted((a, b) => inicio(b).localeCompare(inicio(a))),
  };
}

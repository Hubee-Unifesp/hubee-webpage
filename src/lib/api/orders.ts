import { isAxiosError } from "axios";
import { apiClient } from "./apiClient";
import { apiClient as publicClient } from "./client";
import { parseApiError } from "./errors";
import { toCategory, type ApiEvent, type ApiTicketType, type ApiVenue } from "./events";
import type {
  ApiOrder,
  ApiOrderWithItems,
  ApiPaymentMethod,
  ApiPaymentResponse,
  ApiTicket,
} from "./orders.types";
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

  const [events, payments] = await Promise.all([
    getEvents(tickets.map((ticket) => ticket.eventId)),
    Promise.all(orders.map((order) => getPayment(order.id))),
  ]);

  const paymentsByOrderId = new Map(orders.map((order, index) => [order.id, payments[index]]));

  return orders
    .map((order) =>
      toPedido(
        order,
        tickets.filter((ticket) => ticket.orderId === order.id),
        events,
        [],
        paymentsByOrderId.get(order.id) ?? null,
      ),
    )
    .toSorted((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** Rejeita com 404 quando o pedido não existe ou é de outra pessoa. */
interface ApiPayment {
  paymentMethod: string;
  status: string;
  paidAt?: string | null;
}

export async function getPedido(id: string): Promise<Pedido> {
  const [order, payment] = await Promise.all([
    apiClient.get<ApiOrder>(`/orders/${id}`).then(({ data }) => data),
    getPayment(id),
  ]);

  const tickets =
    order.status === "pago" ? (await getMyTickets()).filter((ticket) => ticket.orderId === order.id) : [];
  const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))];
  const [events, ticketTypes] = await Promise.all([
    getEvents(eventIds),
    Promise.all(eventIds.map(getTicketTypes)).then((lists) => lists.flat()),
  ]);

  return toPedido(order, tickets, events, ticketTypes, payment);
}

async function getPayment(orderId: string): Promise<ApiPayment | null> {
  try {
    const { data } = await apiClient.get<ApiPayment>(`/orders/${orderId}/payments`);
    return data;
  } catch {
    return null;
  }
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

export async function getEvents(eventIds: readonly string[]): Promise<Map<string, EventoPedido>> {
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

export async function getTicketTypes(eventId: string): Promise<ApiTicketType[]> {
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
  payment?: ApiPayment | null,
): Pedido {
  return {
    id: order.id,
    numero: order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    criadoEm: order.createdAt,
    eventos: [...new Set(tickets.map((ticket) => events.get(ticket.eventId)).filter((evento) => evento !== undefined))],
    itens: toItens(tickets, ticketTypes, events),
    total: Number(order.totalAmount),
    metodoPagamento: payment?.paymentMethod ?? null,
    pagoEm: payment?.paidAt ?? (order.status === "pago" ? order.createdAt : null),
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

export function ticketTypeLabel(type: ApiTicketType | undefined): string {
  return type ? `Ingresso ${type.batch}` : "Ingresso";
}

/* -------------------------------------------------------------------------- */
/* Compra: criação do pedido e pagamento                                      */
/* -------------------------------------------------------------------------- */

/** Lote escolhido e quantos ingressos dele, como vai para `POST /orders`. */
export interface NovoItemPedido {
  ticketTypeId: string;
  quantidade: number;
}

export interface ItemPedidoCriado {
  ticketTypeId: string;
  quantidade: number;
  /** Preço unitário em reais no momento da compra, definido pela API. */
  valorUnitario: number;
}

export interface PedidoCriado {
  id: string;
  /** Total em reais calculado pela API a partir do preço atual de cada lote. */
  total: number;
  itens: ItemPedidoCriado[];
}

export interface PagamentoConfirmado {
  id: string;
  pedidoId: string;
  metodoPagamento: ApiPaymentMethod;
  status: ApiPaymentResponse["status"];
  /** Valor pago em reais. */
  valor: number;
  pagoEm: string | null;
}

/**
 * Motivo da falha da compra, para a tela decidir o que fazer: `perfil-incompleto`
 * manda completar o cadastro, os demais viram aviso para a pessoa.
 */
export type CompraErroTipo =
  | "perfil-incompleto"
  | "esgotado"
  | "vendas-fechadas"
  | "pedido-indisponivel"
  | "pagamento-duplicado"
  | "sem-conexao"
  | "desconhecido";

/** Falha de negócio da compra, com a mensagem já pronta para exibir. */
export class CompraError extends Error {
  readonly tipo: CompraErroTipo;
  /** Campos do perfil que faltam preencher, quando `tipo` é `perfil-incompleto`. */
  readonly camposFaltando: readonly string[];

  constructor(tipo: CompraErroTipo, message: string, camposFaltando: readonly string[] = []) {
    super(message);
    this.name = "CompraError";
    this.tipo = tipo;
    this.camposFaltando = camposFaltando;
  }
}

/**
 * Cria o pedido com os lotes escolhidos. O total não é enviado: a API o calcula
 * com o preço atual de cada lote e trava o estoque na mesma transaction, então é
 * ela quem define o valor e recusa lote esgotado.
 */
export async function createOrder(itens: readonly NovoItemPedido[]): Promise<PedidoCriado> {
  if (itens.length === 0) {
    throw new CompraError("desconhecido", "Adicione pelo menos um ingresso para continuar.");
  }

  try {
    const { data } = await apiClient.post<ApiOrderWithItems>("/orders", {
      items: itens.map(({ ticketTypeId, quantidade }) => ({ ticketTypeId, quantity: quantidade })),
    });

    return {
      id: data.id,
      total: Number(data.totalAmount),
      itens: (data.items ?? []).map((item) => ({
        ticketTypeId: item.ticketTypeId,
        quantidade: item.quantity,
        valorUnitario: Number(item.unitPrice),
      })),
    };
  } catch (error) {
    throw toCompraError(error, "Não foi possível criar seu pedido. Tente novamente.");
  }
}

/**
 * Paga o pedido. Uma única chamada confirma o pagamento, marca o pedido como pago
 * e emite os ingressos (tudo numa transaction na API), então depois daqui os
 * ingressos já aparecem em "Meus Ingressos".
 */
export async function processPayment(
  pedidoId: string,
  metodoPagamento: ApiPaymentMethod,
): Promise<PagamentoConfirmado> {
  try {
    const { data } = await apiClient.post<ApiPaymentResponse>("/payments", {
      orderId: pedidoId,
      paymentMethod: metodoPagamento,
    });

    return {
      id: data.id,
      pedidoId: data.orderId,
      metodoPagamento: data.paymentMethod,
      status: data.status,
      valor: Number(data.amount),
      pagoEm: data.paidAt ?? null,
    };
  } catch (error) {
    throw toCompraError(error, "Não foi possível concluir o pagamento. Tente novamente.");
  }
}

/**
 * Traduz a falha da API em `CompraError`. As mensagens de lote esgotado, saldo
 * insuficiente e vendas fechadas já vêm prontas em pt-BR, então são reaproveitadas;
 * nos outros casos o texto da API é técnico demais e usamos o `fallback`.
 */
function toCompraError(error: unknown, fallback: string): CompraError {
  if (error instanceof CompraError) return error;

  const { status, messages } = parseApiError(error);
  const [message] = messages;

  if (status === undefined) {
    return new CompraError(
      "sem-conexao",
      "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.",
    );
  }

  if (status === 403 && isProfileIncomplete(error)) {
    return new CompraError(
      "perfil-incompleto",
      "Complete seu perfil para finalizar a compra.",
      missingProfileFields(error),
    );
  }

  if (status === 409) {
    return new CompraError("pagamento-duplicado", "Este pedido já foi pago.");
  }

  if (status === 422 && message) {
    if (/esgotado|dispon[íi]ve/i.test(message)) return new CompraError("esgotado", message);
    if (/vendas/i.test(message)) return new CompraError("vendas-fechadas", message);
    return new CompraError("pedido-indisponivel", message);
  }

  if (status === 404) {
    return new CompraError("pedido-indisponivel", message ?? "Pedido não encontrado.");
  }

  return new CompraError("desconhecido", fallback);
}

function errorData(error: unknown): Record<string, unknown> | null {
  if (!isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : null;
}

function isProfileIncomplete(error: unknown): boolean {
  return errorData(error)?.code === "PROFILE_INCOMPLETE";
}

function missingProfileFields(error: unknown): string[] {
  const missing = errorData(error)?.missing;
  return Array.isArray(missing) ? missing.filter((field): field is string => typeof field === "string") : [];
}

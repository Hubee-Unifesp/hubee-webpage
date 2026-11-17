import { isAxiosError } from "axios";
import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";
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

  return orders
    .map((order) => toPedido(order, tickets.filter((ticket) => ticket.orderId === order.id)))
    .toSorted((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function getPedido(id: string): Promise<Pedido> {
  const order = await apiClient.get<ApiOrder>(`/orders/${id}`).then(({ data }) => data);
  const tickets =
    order.status === "pago" ? (await getMyTickets()).filter((ticket) => ticket.orderId === order.id) : [];

  return toPedido(order, tickets);
}

async function getMyTickets(): Promise<ApiTicket[]> {
  try {
    const { data } = await apiClient.get<ApiTicket[]>("/users/me/tickets");
    return data;
  } catch {
    // Os ingressos só completam o pedido (QR code, status do ingresso): sem eles a lista continua útil.
    return [];
  }
}

function toPedido(order: ApiOrder, tickets: readonly ApiTicket[]): Pedido {
  const eventos: EventoPedido[] = order.event
    ? [
        {
          id: order.event.id,
          nome: order.event.name,
          descricao: "",
          categoria: "outros",
          local: "",
          dataInicio: order.event.startDate,
          dataFim: order.event.endDate,
          photoUrl: order.event.photoUrl,
          status: order.event.status,
        },
      ]
    : [];

  const itens: ItemPedido[] = (order.items ?? []).map((item) => ({
    id: item.ticketTypeId,
    descricao: item.ticketTypeBatch ? `Ingresso ${item.ticketTypeBatch}` : "Ingresso",
    quantidade: item.quantity,
    valorUnitario: Number(item.unitPrice),
    eventoNome: order.event?.name ?? null,
  }));


  return {
    id: order.id,
    numero: order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    criadoEm: order.createdAt,
    eventos,
    itens,
    total: Number(order.totalAmount),
    metodoPagamento: order.payment?.paymentMethod ?? null,
    pagoEm: order.payment?.paidAt ?? (order.status === "pago" ? order.createdAt : null),
    ingressos: tickets.map((ticket) => ({
      id: ticket.id,
      tipo: "Ingresso",
      codigo: ticket.qrCode,
      status: ticket.status,
      evento: eventos[0] ?? null,
    })),
  };
}

export function ticketTypeLabel(type?: { id?: string; batch?: string; price?: number | string } | null): string {
  return type?.batch ? `Ingresso ${type.batch}` : "Ingresso";
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

/** Ingresso emitido, como vem em `GET /orders/:id/tickets` (sem evento ou lote aninhados). */
export interface IngressoEmitido {
  id: string;
  codigo: string;
  ticketTypeId: string;
}

/**
 * Ingressos emitidos do pedido, para mostrar logo depois do pagamento. Rejeita em vez de
 * devolver lista vazia: a tela de sucesso precisa distinguir "sem ingresso" de "não carregou".
 */
export async function getTicketsDoPedido(pedidoId: string): Promise<IngressoEmitido[]> {
  const { data } = await apiClient.get<ApiTicket[]>(`/orders/${pedidoId}/tickets`);

  return data.map((ticket) => ({
    id: ticket.id,
    codigo: ticket.qrCode,
    ticketTypeId: ticket.ticketTypeId,
  }));
}

/**
 * Cancela um pedido pendente (`DELETE /orders/:id`). Na API, pedido pendente reserva o
 * saldo do lote, então cancelar quem desistiu na tela do PIX devolve os ingressos ao estoque.
 */
export async function cancelOrder(pedidoId: string): Promise<void> {
  try {
    await apiClient.delete(`/orders/${pedidoId}`);
  } catch (error) {
    throw toCompraError(error, "Não foi possível cancelar o pedido.");
  }
}

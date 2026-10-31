import type { EventCategory } from "@/lib/api/events.types";

export type StatusPedido = "pago" | "pendente" | "cancelado" | "estornado";

export type StatusIngresso = "emitido" | "usado" | "cancelado";

export interface EventoPedido {
  id: string;
  nome: string;
  descricao: string;
  categoria: EventCategory;
  local: string;
  /** Datas em ISO 8601 (UTC). */
  dataInicio: string;
  dataFim: string;
}

export interface ItemPedido {
  id: string;
  /** Ex.: "Ingresso Lote 1". */
  descricao: string;
  quantidade: number;
  /** Valor unitário em reais. */
  valorUnitario: number;
  /** Nome do evento do tipo de ingresso; `null` quando o evento não carregou. */
  eventoNome: string | null;
}

export interface IngressoPedido {
  id: string;
  tipo: string;
  codigo: string;
  status: StatusIngresso;
  /** Cada ingresso aponta para o próprio evento: um pedido pode ter ingressos de eventos diferentes. */
  evento: EventoPedido | null;
}

export interface Pedido {
  id: string;
  /** Código curto para exibir, derivado do id (a API não tem número de pedido). */
  numero: string;
  status: StatusPedido;
  /** Data da compra, em ISO 8601 (UTC). */
  criadoEm: string;
  /**
   * Eventos distintos dos ingressos, na ordem em que aparecem. Vazio quando o pedido não tem ingressos
   * emitidos: a API só liga pedido a evento pelos ingressos.
   */
  eventos: EventoPedido[];
  /** Vazio quando não há ingressos: a API não guarda os itens do pedido. */
  itens: ItemPedido[];
  /** Total em reais. */
  total: number;
  /** Método de pagamento utilizado (ex.: 'pix', 'cartao_credito'). */
  metodoPagamento?: string | null;
  /** Data/hora em que o pagamento foi confirmado. */
  pagoEm?: string | null;
  /** Só existem ingressos emitidos para pedidos pagos. */
  ingressos: IngressoPedido[];
}

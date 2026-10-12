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
}

export interface IngressoPedido {
  id: string;
  tipo: string;
  codigo: string;
  status: StatusIngresso;
}

export interface Pedido {
  id: string;
  /** Código curto para exibir, derivado do id (a API não tem número de pedido). */
  numero: string;
  status: StatusPedido;
  /** Data da compra, em ISO 8601 (UTC). */
  criadoEm: string;
  /** `null` quando o pedido não tem ingressos emitidos: a API só liga pedido a evento pelos ingressos. */
  evento: EventoPedido | null;
  /** Vazio quando não há ingressos: a API não guarda os itens do pedido. */
  itens: ItemPedido[];
  /** Total em reais. */
  total: number;
  /** Só existem ingressos emitidos para pedidos pagos. */
  ingressos: IngressoPedido[];
}

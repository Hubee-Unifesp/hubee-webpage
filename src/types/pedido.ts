import type { EventCategory } from "@/lib/api/events.types";

export type StatusPedido = "pago" | "pendente" | "cancelado" | "estornado";

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
  /** Ex.: "Ingresso Inteiro/Lote 1". */
  descricao: string;
  quantidade: number;
  /** Valor unitário em reais. */
  valorUnitario: number;
}

export interface IngressoPedido {
  id: string;
  nomeParticipante: string;
  tipo: string;
  codigo: string;
}

export interface Pedido {
  id: string;
  numero: string;
  status: StatusPedido;
  evento: EventoPedido;
  itens: ItemPedido[];
  /** Total em reais. */
  total: number;
  /** Só existem ingressos emitidos para pedidos pagos. */
  ingressos: IngressoPedido[];
}

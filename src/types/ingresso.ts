import type { EventoPedido, StatusIngresso } from "./pedido";

/** Ingresso da lista "Meus Ingressos": o ingresso, o evento e o pedido de onde ele veio. */
export interface MeuIngresso {
  id: string;
  codigo: string;
  status: StatusIngresso;
  /** Ex.: "Ingresso Lote 1". */
  tipo: string;
  /** Valor pago pelo ingresso, em reais; `null` quando o tipo de ingresso não carregou. */
  valor: number | null;
  pedidoId: string;
  /** Código curto do pedido, o mesmo da tela de pedidos. */
  pedidoNumero: string;
  /** `null` quando o evento não carregou. */
  evento: EventoPedido | null;
}

export interface MeusIngressos {
  proximos: MeuIngresso[];
  anteriores: MeuIngresso[];
}

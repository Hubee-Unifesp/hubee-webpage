import { subtotal as calcularSubtotal } from "@/lib/carrinho";
import { ticketTypeLabel } from "@/lib/api/orders";
import type { ApiPaymentMethod } from "@/lib/api/orders.types";
import type { PaymentMethod } from "@/lib/validations/checkout.schema";
import type { CartItem } from "@/types/carrinho";

/**
 * A API não cobra taxa de serviço: o total do pedido é a soma dos lotes, calculada no
 * `POST /orders`. A linha fica no resumo, zerada, para o total exibido ser o cobrado.
 */
export const TAXA_DE_SERVICO = 0;

export interface CheckoutOrderItem {
  ticketTypeId: string;
  /** Ex.: "Ingresso 1º Lote". */
  title: string;
  eventName: string;
  quantity: number;
  unitPrice: number;
}

/** Pedido a ser pago, montado a partir do carrinho. */
export interface CheckoutOrder {
  items: CheckoutOrderItem[];
  /** Eventos distintos do pedido, na ordem em que aparecem no carrinho. */
  eventNames: string[];
  serviceFeeAmount: number;
  /** Prévia do total; o valor cobrado é o que a API calcular no pedido. */
  totalAmount: number;
}

export interface CheckoutBuyerSummary {
  fullName: string;
  email: string;
  cpf: string;
  paymentMethod: PaymentMethod;
}

/** Compra concluída: o pedido pago e os ingressos que a API emitiu. */
export interface CompraConcluida {
  pedidoId: string;
  /** Código curto exibido, derivado do id (a API não tem número de pedido). */
  numero: string;
  total: number;
  pagoEm: string | null;
  items: CheckoutOrderItem[];
  ingressos: IngressoDaCompra[];
}

export interface IngressoDaCompra {
  id: string;
  codigo: string;
  /** Ex.: "Ingresso 1º Lote"; cai no padrão quando o lote não está no carrinho. */
  tipo: string;
  eventName: string;
}

export function toCheckoutOrder(itens: readonly CartItem[]): CheckoutOrder {
  const subtotal = calcularSubtotal(itens);

  return {
    items: itens.map(toCheckoutItem),
    eventNames: [...new Set(itens.map((item) => item.title))],
    serviceFeeAmount: TAXA_DE_SERVICO,
    totalAmount: subtotal + TAXA_DE_SERVICO,
  };
}

function toCheckoutItem(item: CartItem): CheckoutOrderItem {
  return {
    ticketTypeId: item.ticketTypeId,
    title: ticketTypeLabel({ id: item.ticketTypeId, batch: item.batchLabel, price: item.unitPrice }),
    eventName: item.title,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  };
}

/**
 * O `GET /orders/:id/tickets` devolve o ingresso sem evento nem lote aninhados, então o
 * rótulo vem do item do pedido com o mesmo lote.
 */
export function toIngressosDaCompra(
  ingressos: readonly { id: string; codigo: string; ticketTypeId: string }[],
  items: readonly CheckoutOrderItem[],
): IngressoDaCompra[] {
  return ingressos.map((ingresso) => {
    const item = items.find((candidate) => candidate.ticketTypeId === ingresso.ticketTypeId);
    return {
      id: ingresso.id,
      codigo: ingresso.codigo,
      tipo: item?.title ?? "Ingresso",
      eventName: item?.eventName ?? "",
    };
  });
}

/** Código curto do pedido, o mesmo formato da tela de pedidos. */
export function numeroDoPedido(pedidoId: string): string {
  return pedidoId.slice(0, 8).toUpperCase();
}

/**
 * O formulário oferece PIX e cartão; a API tem o enum completo (`payment_method`).
 * Cartão vira crédito: o formulário não distingue crédito de débito.
 */
export function toApiPaymentMethod(method: PaymentMethod): ApiPaymentMethod {
  return method === "pix" ? "pix" : "cartao_credito";
}

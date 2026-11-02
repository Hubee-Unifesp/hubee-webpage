export interface ApiOrder {
  id: string;
  userId: string;
  /** `numeric` no banco: normalmente chega como número, mas aceitamos texto por segurança. */
  totalAmount: number | string;
  /** `estornado` ainda não existe no enum do pedido na API; só no do pagamento. */
  status: "pendente" | "pago" | "cancelado" | "estornado";
  createdAt: string;
}

export interface ApiTicket {
  id: string;
  qrCode: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  status: "emitido" | "usado" | "cancelado";
}

/** Item do pedido, como a API devolve em `POST /orders` e `GET /orders/:id`. */
export interface ApiOrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  /** `numeric` no banco: normalmente chega como número, mas aceitamos texto por segurança. */
  unitPrice: number | string;
}

/** `POST /orders` devolve o pedido com os itens gravados. */
export interface ApiOrderWithItems extends ApiOrder {
  items: ApiOrderItem[];
}

/** Formas de pagamento aceitas pela API (enum `payment_method`). */
export type ApiPaymentMethod =
  | "cartao_credito"
  | "cartao_debito"
  | "pix"
  | "boleto"
  | "transferencia";

/** Resposta de `POST /payments` (`PaymentResponseDto`). */
export interface ApiPaymentResponse {
  id: string;
  orderId: string;
  paymentMethod: ApiPaymentMethod;
  status: "pendente" | "confirmado" | "recusado" | "estornado";
  amount: number | string;
  paidAt?: string | null;
}

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

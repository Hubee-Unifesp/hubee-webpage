/** Modalidade do ingresso de um lote (`ticket_type_modality` na `hubee-api`). */
export type ModalidadeLote = "inteira" | "meia" | "estudante" | "vip" | "cortesia";

/**
 * Lote de ingressos (`ticket-types`) como a tela de gestão do evento o exibe.
 * Espelha o `TicketTypeResponseDto` da `hubee-api` (GOL-210).
 */
export interface LoteIngresso {
  id: string;
  batch: string;
  modality: ModalidadeLote;
  price: number;
  quantity: number;
  /** Ingressos ainda disponíveis. `quantity - available` é o total já vendido. */
  available: number;
  /** ISO 8601. `null` quando o lote não tem início definido. */
  salesStartDate: string | null;
  /** ISO 8601. `null` quando o lote vende até o fim do evento. */
  salesEndDate: string | null;
}

/** Dados enviados ao criar ou editar um lote. */
export type LotePayload = Pick<
  LoteIngresso,
  "batch" | "modality" | "price" | "quantity" | "salesStartDate" | "salesEndDate"
>;

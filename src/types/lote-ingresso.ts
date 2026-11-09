/** Modalidade do ingresso de um lote. A `hubee-api` ainda não expõe esse campo (ver Task 6). */
export type ModalidadeLote = "inteira" | "meia" | "estudante" | "vip" | "cortesia";

/**
 * Lote de ingressos (`ticket-types`) como a tela de gestão do evento o exibe.
 * `batch`, `price` e `quantity` existem na API; `modality`, `available` e a janela de vendas
 * são previstos pela task GOL-209 e hoje só existem no front.
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

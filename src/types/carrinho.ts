import type { EventCategory } from "@/lib/api/events.types";

/**
 * Linha do carrinho: um lote de um evento e quantos ingressos dele. O lote identifica
 * a linha, então o mesmo lote nunca aparece duas vezes (adicionar de novo soma).
 */
export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  title: string;
  organization: string;
  /** Ex.: "1º Lote · Inteira". */
  batchLabel: string;
  category: EventCategory;
  /**
   * Preço unitário em reais, só para exibir. O valor cobrado é sempre o que a API
   * calcula no `POST /orders` com o preço vigente do lote.
   */
  unitPrice: number;
  quantity: number;
  /** Ingressos ainda disponíveis no lote, quando a API informa. */
  maxQuantity: number;
}

/** Dados do lote para entrar no carrinho; a quantidade é decidida na hora de adicionar. */
export type NovoItemCarrinho = Omit<CartItem, "quantity">;

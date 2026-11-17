import { apiClient } from "./apiClient";
import type { LoteIngresso, LotePayload, ModalidadeLote } from "@/types/lote-ingresso";

/** Lote como a `hubee-api` devolve (`TicketTypeResponseDto`). */
export interface ApiLote {
  id: string;
  batch: string;
  modality: ModalidadeLote;
  price: number | string;
  quantity: number;
  available: number;
  salesStartDate: string | null;
  salesEndDate: string | null;
}

export function toLoteIngresso(lote: ApiLote): LoteIngresso {
  return {
    id: lote.id,
    batch: lote.batch,
    modality: lote.modality,
    price: Number(lote.price),
    quantity: lote.quantity,
    available: lote.available,
    salesStartDate: lote.salesStartDate ?? null,
    salesEndDate: lote.salesEndDate ?? null,
  };
}

const lotesUrl = (eventoId: string) => `/events/${eventoId}/ticket-types`;

export async function getLotes(eventoId: string): Promise<LoteIngresso[]> {
  const { data } = await apiClient.get<ApiLote[]>(lotesUrl(eventoId));
  return data.map(toLoteIngresso);
}

export async function createLote(eventoId: string, payload: LotePayload): Promise<LoteIngresso> {
  const { data } = await apiClient.post<ApiLote>(lotesUrl(eventoId), payload);
  return toLoteIngresso(data);
}

/** O payload vai completo: `null` nas datas de venda apaga a janela gravada. */
export async function updateLote(eventoId: string, loteId: string, payload: LotePayload): Promise<LoteIngresso> {
  const { data } = await apiClient.patch<ApiLote>(`${lotesUrl(eventoId)}/${loteId}`, payload);
  return toLoteIngresso(data);
}

export async function deleteLote(eventoId: string, loteId: string): Promise<void> {
  await apiClient.delete(`${lotesUrl(eventoId)}/${loteId}`);
}

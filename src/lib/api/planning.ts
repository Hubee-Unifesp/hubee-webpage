import { apiClient } from "./apiClient";
import type {
  DespesaPlanejamento,
  DespesaPlanejamentoPayload,
  EventoPlanejamento,
  GrupoDespesa,
  LotePlanejamento,
  ModalidadeLotePlanejamento,
  StatusPagamentoDespesa,
} from "@/types/planejamento";

export interface ApiDespesa {
  id: string;
  group: GrupoDespesa;
  category: string;
  description: string;
  supplierId: string | null;
  supplierName: string | null;
  quantity: number | string;
  unitPrice: number | string;
  amount: number | string;
  responsible: string | null;
  quoted: boolean;
  paymentStatus: StatusPagamentoDespesa;
  notes: string | null;
  dueDate: string | null;
}

interface ApiEventoPlanejamento {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue?: { name: string } | null;
}

interface ApiLoteResumo {
  id: string;
  batch: string;
  price: number | string;
  quantity: number;
  modality: ModalidadeLotePlanejamento;
  sequential: boolean;
}

interface ApiResumoPlanejamento {
  expectedAudience: number | null;
  tickets: { lots: ApiLoteResumo[] };
}

export interface PlanejamentoEventoApi {
  evento: EventoPlanejamento;
  lotes: LotePlanejamento[];
}

export function toDespesaPlanejamento(despesa: ApiDespesa): DespesaPlanejamento {
  return {
    id: despesa.id,
    group: despesa.group,
    category: despesa.category,
    description: despesa.description,
    supplierId: despesa.supplierId ?? null,
    supplierName: despesa.supplierName ?? null,
    quantity: Number(despesa.quantity),
    unitPrice: Number(despesa.unitPrice),
    amount: Number(despesa.amount),
    responsible: despesa.responsible ?? null,
    quoted: despesa.quoted,
    paymentStatus: despesa.paymentStatus,
    notes: despesa.notes ?? null,
    dueDate: despesa.dueDate ?? null,
  };
}

const despesasUrl = (eventoId: string) => `/events/${eventoId}/expenses`;

export async function getDespesas(eventoId: string): Promise<DespesaPlanejamento[]> {
  const { data } = await apiClient.get<ApiDespesa[]>(despesasUrl(eventoId));
  return data.map(toDespesaPlanejamento);
}

export async function createDespesa(
  eventoId: string,
  payload: DespesaPlanejamentoPayload,
): Promise<DespesaPlanejamento> {
  const { data } = await apiClient.post<ApiDespesa>(despesasUrl(eventoId), payload);
  return toDespesaPlanejamento(data);
}

export async function updateDespesa(
  eventoId: string,
  despesaId: string,
  payload: Partial<DespesaPlanejamentoPayload>,
): Promise<DespesaPlanejamento> {
  const { data } = await apiClient.patch<ApiDespesa>(`${despesasUrl(eventoId)}/${despesaId}`, payload);
  return toDespesaPlanejamento(data);
}

export async function deleteDespesa(eventoId: string, despesaId: string): Promise<void> {
  await apiClient.delete(`${despesasUrl(eventoId)}/${despesaId}`);
}

export async function getPlanejamentoEvento(eventoId: string): Promise<PlanejamentoEventoApi> {
  const [{ data: evento }, { data: resumo }] = await Promise.all([
    apiClient.get<ApiEventoPlanejamento>(`/events/${eventoId}`),
    apiClient.get<ApiResumoPlanejamento>(`/events/${eventoId}/planning/summary`),
  ]);
  return {
    evento: {
      id: evento.id,
      name: evento.name,
      startDate: evento.startDate,
      endDate: evento.endDate,
      venueName: evento.venue?.name ?? "Local a definir",
      expectedAudience: resumo.expectedAudience ?? null,
    },
    lotes: (resumo.tickets?.lots ?? []).map((lote) => ({
      id: lote.id,
      batch: lote.batch,
      price: Number(lote.price),
      quantity: lote.quantity,
      modality: lote.modality,
      sequential: lote.sequential,
    })),
  };
}

export async function updatePublicoEsperado(eventoId: string, expectedAudience: number | null): Promise<void> {
  await apiClient.patch(`/events/${eventoId}`, { expectedAudience });
}

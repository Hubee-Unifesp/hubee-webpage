import { apiClient } from "./apiClient";
import type {
  DespesaPlanejamento,
  DespesaPlanejamentoPayload,
  EventoPlanejamento,
  GrupoDespesa,
  ParcelaDespesa,
  ParcelaPayload,
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

interface ApiResumoPublico {
  expectedAudience: number | null;
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

export async function getEventoPlanejamento(eventoId: string): Promise<EventoPlanejamento> {
  const [{ data: evento }, { data: resumo }] = await Promise.all([
    apiClient.get<ApiEventoPlanejamento>(`/events/${eventoId}`),
    apiClient.get<ApiResumoPublico>(`/events/${eventoId}/planning/summary`),
  ]);
  return {
    id: evento.id,
    name: evento.name,
    startDate: evento.startDate,
    endDate: evento.endDate,
    venueName: evento.venue?.name ?? "Local a definir",
    expectedAudience: resumo.expectedAudience ?? null,
  };
}

export interface ApiParcela extends Omit<ParcelaDespesa, "amount"> {
  amount: number | string;
}

export function toParcelaDespesa(parcela: ApiParcela): ParcelaDespesa {
  return {
    id: parcela.id,
    expenseId: parcela.expenseId,
    expenseDescription: parcela.expenseDescription,
    expenseGroup: parcela.expenseGroup,
    expenseCategory: parcela.expenseCategory,
    supplierName: parcela.supplierName ?? null,
    dueDate: parcela.dueDate,
    amount: Number(parcela.amount),
    status: parcela.status,
    paidBy: parcela.paidBy ?? null,
    paymentMethod: parcela.paymentMethod ?? null,
  };
}

const parcelasUrl = (eventoId: string, despesaId: string) => `${despesasUrl(eventoId)}/${despesaId}/installments`;

export async function getParcelas(eventoId: string): Promise<ParcelaDespesa[]> {
  const { data } = await apiClient.get<ApiParcela[]>(`/events/${eventoId}/installments`);
  return data.map(toParcelaDespesa);
}

export async function createParcela(
  eventoId: string,
  despesaId: string,
  payload: ParcelaPayload,
): Promise<ParcelaDespesa> {
  const { data } = await apiClient.post<ApiParcela>(parcelasUrl(eventoId, despesaId), payload);
  return toParcelaDespesa(data);
}

export async function updateParcela(
  eventoId: string,
  despesaId: string,
  parcelaId: string,
  payload: Partial<ParcelaPayload>,
): Promise<ParcelaDespesa> {
  const { data } = await apiClient.patch<ApiParcela>(`${parcelasUrl(eventoId, despesaId)}/${parcelaId}`, payload);
  return toParcelaDespesa(data);
}

export async function deleteParcela(eventoId: string, despesaId: string, parcelaId: string): Promise<void> {
  await apiClient.delete(`${parcelasUrl(eventoId, despesaId)}/${parcelaId}`);
}

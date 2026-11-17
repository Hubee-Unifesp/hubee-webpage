/**
 * Avaliações de fornecedores (GOL-248).
 *
 * Consome os endpoints reais da `hubee-api`:
 * - `GET /suppliers/:id/reviews` — lista de avaliações, das mais recentes para as mais antigas.
 * - `POST /suppliers/:id/reviews` — cria/atualiza (upsert por fornecedor + usuário) a avaliação do
 *   usuário autenticado. Retorna 201 na primeira avaliação e 200 quando atualiza a existente.
 */
import { apiClient } from "./apiClient";
import type { AvaliacaoFornecedor, AvaliacaoFornecedorPayload } from "@/types/avaliacao-fornecedor";

export async function getSupplierReviews(supplierId: string): Promise<AvaliacaoFornecedor[]> {
  const response = await apiClient.get<AvaliacaoFornecedor[]>(`/suppliers/${supplierId}/reviews`);
  return response.data;
}

export async function createSupplierReview(
  supplierId: string,
  payload: AvaliacaoFornecedorPayload,
): Promise<AvaliacaoFornecedor> {
  const body: AvaliacaoFornecedorPayload = {
    rating: payload.rating,
    ...(payload.comment ? { comment: payload.comment } : {}),
  };
  const response = await apiClient.post<AvaliacaoFornecedor>(`/suppliers/${supplierId}/reviews`, body);
  return response.data;
}

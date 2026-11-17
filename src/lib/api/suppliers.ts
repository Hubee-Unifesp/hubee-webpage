import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";
import type { Fornecedor, FornecedorPayload, SupplierSortBy } from "@/types/fornecedor";

export type { SupplierSortBy };

/** Equivalente ao 409 da `hubee-api`: já existe fornecedor com o mesmo CNPJ/CPF ou e-mail. */
export class FornecedorDuplicadoError extends Error {
  constructor(message = "Já existe um fornecedor com este CNPJ/CPF ou E-mail.") {
    super(message);
    this.name = "FornecedorDuplicadoError";
  }
}

export interface GetSuppliersParams {
  search?: string;
  category?: string;
  minRating?: number;
  sortBy?: SupplierSortBy;
}

const VALID_SORT_BY: ReadonlySet<SupplierSortBy> = new Set(["rating", "companyName", "createdAt"]);

function normalizeSupplier(supplier: Fornecedor): Fornecedor {
  if (
    supplier.ratingAverage === undefined &&
    supplier.averageRating !== undefined
  ) {
    return {
      ...supplier,
      ratingAverage: supplier.averageRating,
      ratingCount: supplier.ratingCount ?? supplier.reviewsCount ?? 0,
    };
  }
  if (
    supplier.ratingCount === undefined &&
    supplier.reviewsCount !== undefined
  ) {
    return {
      ...supplier,
      ratingCount: supplier.reviewsCount,
    };
  }
  return supplier;
}

/** Corpo de atualização (`PATCH /suppliers/:id`): `null` limpa campos opcionais no banco. */
export interface FornecedorUpdatePayload {
  companyName?: string;
  cnpjCpf?: string;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
}

function rethrowDuplicateIfConflict(error: unknown): never {
  const apiError = parseApiError(error);
  if (apiError.status === 409) {
    throw new FornecedorDuplicadoError(apiError.messages[0]);
  }
  throw error;
}

export async function getSuppliers(params?: GetSuppliersParams): Promise<Fornecedor[]> {
  const search = params?.search?.trim();
  const category = params?.category?.trim();
  const minRating =
    typeof params?.minRating === "number" &&
    Number.isFinite(params.minRating) &&
    params.minRating >= 1 &&
    params.minRating <= 5
      ? params.minRating
      : undefined;
  const sortBy = params?.sortBy && VALID_SORT_BY.has(params.sortBy) ? params.sortBy : undefined;

  const query: GetSuppliersParams = {
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(minRating !== undefined ? { minRating } : {}),
    ...(sortBy ? { sortBy } : {}),
  };

  const response =
    Object.keys(query).length > 0
      ? await apiClient.get<Fornecedor[]>("/suppliers", { params: query })
      : await apiClient.get<Fornecedor[]>("/suppliers");

  return response.data.map(normalizeSupplier);
}

export async function getSupplierById(id: string): Promise<Fornecedor> {
  const response = await apiClient.get<Fornecedor>(`/suppliers/${id}`);
  return normalizeSupplier(response.data);
}

export async function createSupplier(payload: FornecedorPayload): Promise<Fornecedor> {
  try {
    const response = await apiClient.post<Fornecedor>("/suppliers", payload);
    return response.data;
  } catch (error) {
    rethrowDuplicateIfConflict(error);
  }
}

export async function updateSupplier(
  id: string,
  payload: FornecedorUpdatePayload,
): Promise<Fornecedor> {
  try {
    const response = await apiClient.patch<Fornecedor>(`/suppliers/${id}`, payload);
    return response.data;
  } catch (error) {
    rethrowDuplicateIfConflict(error);
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}

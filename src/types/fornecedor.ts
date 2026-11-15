/** Critérios de ordenação aceitos por `GET /suppliers` na `hubee-api` (`QuerySupplierDto`). */
export type SupplierSortBy = "rating" | "companyName" | "createdAt";

/** Fornecedor como a `hubee-api` devolve em `/suppliers` (`SupplierResponseDto`). */
export interface Fornecedor {
  id: string;
  companyName: string;
  /** Somente dígitos: 11 (CPF) a 14 (CNPJ). */
  cnpjCpf: string;
  phone: string | null;
  email: string | null;
  category: string | null;
  /** Nota média de 1 a 5 (ausente ou `null` quando ainda não avaliado). */
  ratingAverage?: number | null;
  /** Quantidade total de avaliações recebidas. */
  ratingCount?: number;
  /** Alias de `ratingAverage` para compatibilidade de contrato (`GOL-253`). */
  averageRating?: number | null;
  /** Alias de `ratingCount` para compatibilidade de contrato (`GOL-253`). */
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de criação e edição (`CreateSupplierDto` / `UpdateSupplierDto`). Opcionais vazios são omitidos. */
export interface FornecedorPayload {
  companyName: string;
  cnpjCpf: string;
  phone?: string;
  email?: string;
  category?: string;
}

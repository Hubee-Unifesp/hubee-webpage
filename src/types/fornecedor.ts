/** Fornecedor como a `hubee-api` devolve em `/suppliers` (`SupplierResponseDto`). */
export interface Fornecedor {
  id: string;
  companyName: string;
  /** Somente dígitos: 11 (CPF) a 14 (CNPJ). */
  cnpjCpf: string;
  phone: string | null;
  email: string | null;
  category: string | null;
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

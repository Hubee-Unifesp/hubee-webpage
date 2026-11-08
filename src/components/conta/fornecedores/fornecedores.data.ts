import type { Fornecedor } from "@/types/fornecedor";
import type { PapelOrganizador } from "@/types/organizacao";

/** Valor do filtro de categoria que mostra todos os fornecedores. */
export const TODAS_CATEGORIAS = "all";

/** Sugestões do campo Categoria. A API aceita texto livre, então outras categorias também podem existir. */
export const CATEGORIAS_SUGERIDAS = ["Buffet", "Som e iluminação", "Fotografia", "Decoração", "Segurança"] as const;

/** Administradores e Membros gerenciam fornecedores. O papel Leitura só visualiza. */
export function canManageSuppliers(papel: PapelOrganizador): boolean {
  return papel === "administrador" || papel === "membro";
}

/** Categorias já usadas pelos fornecedores, sem repetição e em ordem alfabética, para o filtro. */
export function getCategorias(fornecedores: readonly Fornecedor[]): string[] {
  const categorias = new Set<string>();
  for (const { category } of fornecedores) {
    if (category) categorias.add(category);
  }
  return [...categorias].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Filtra por nome (`companyName`, ignorando acentos e caixa) e por categoria. */
export function filterFornecedores(
  fornecedores: readonly Fornecedor[],
  busca: string,
  categoria: string,
): Fornecedor[] {
  const termo = normalize(busca);
  return fornecedores.filter((fornecedor) => {
    const bateBusca = termo === "" || normalize(fornecedor.companyName).includes(termo);
    const bateCategoria = categoria === TODAS_CATEGORIAS || fornecedor.category === categoria;
    return bateBusca && bateCategoria;
  });
}


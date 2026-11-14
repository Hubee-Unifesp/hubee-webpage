import type { Fornecedor } from "@/types/fornecedor";
import type { PapelOrganizador } from "@/types/organizacao";

/** Valor do filtro de categoria que mostra todos os fornecedores. */
export const TODAS_CATEGORIAS = "all";

/** Valor do filtro de avaliação mínima que mostra todos os fornecedores. */
export const TODAS_AVALIACOES = "all";

/** Opções do filtro de avaliação mínima em estrelas (`GOL-249`). */
export type FiltroAvaliacaoMinima = typeof TODAS_AVALIACOES | "4" | "3";

/** Ordenação padrão da listagem de fornecedores (`Mais bem avaliados`). */
export const ORDENACAO_PADRAO = "rating";

/** Opções de ordenação da listagem de fornecedores (`GOL-249`). */
export type OrdenacaoFornecedores = typeof ORDENACAO_PADRAO | "name";

/** Nota mínima a partir da qual o fornecedor recebe o badge de destaque em pílula (`>= 4,5`). */
export const NOTA_DESTAQUE = 4.5;

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

/** Verifica se o fornecedor possui ao menos uma avaliação válida registrada. */
export function temAvaliacao(
  fornecedor: Pick<Fornecedor, "ratingAverage" | "ratingCount">,
): fornecedor is Pick<Fornecedor, "ratingAverage" | "ratingCount"> & {
  ratingAverage: number;
  ratingCount: number;
} {
  return (
    typeof fornecedor.ratingAverage === "number" &&
    Number.isFinite(fornecedor.ratingAverage) &&
    typeof fornecedor.ratingCount === "number" &&
    fornecedor.ratingCount > 0
  );
}

/** Formata a nota média com 1 casa decimal separada por vírgula (ex.: `4.8` -> `"4,8"`). */
export function formatarNotaMedia(nota: number): string {
  return nota.toFixed(1).replace(".", ",");
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function compareFornecedores(
  a: Fornecedor,
  b: Fornecedor,
  ordenacao: OrdenacaoFornecedores,
): number {
  if (ordenacao === "name") {
    return a.companyName.localeCompare(b.companyName, "pt-BR");
  }

  const aAvaliado = temAvaliacao(a);
  const bAvaliado = temAvaliacao(b);

  if (aAvaliado && !bAvaliado) return -1;
  if (!aAvaliado && bAvaliado) return 1;

  if (aAvaliado && bAvaliado) {
    if (b.ratingAverage !== a.ratingAverage) {
      return b.ratingAverage - a.ratingAverage;
    }
    if (b.ratingCount !== a.ratingCount) {
      return b.ratingCount - a.ratingCount;
    }
  }

  return a.companyName.localeCompare(b.companyName, "pt-BR");
}

/**
 * Filtra por nome (`companyName`, ignorando acentos e caixa), categoria e avaliação mínima,
 * e ordena por reputação (`Mais bem avaliados`, com `Sem avaliações` ao final) ou ordem alfabética (`A–Z`).
 */
export function filterFornecedores(
  fornecedores: readonly Fornecedor[],
  busca: string,
  categoria: string,
  avaliacaoMinima: FiltroAvaliacaoMinima = TODAS_AVALIACOES,
  ordenacao: OrdenacaoFornecedores = ORDENACAO_PADRAO,
): Fornecedor[] {
  const termo = normalize(busca);
  const notaMinima = avaliacaoMinima === "4" ? 4 : avaliacaoMinima === "3" ? 3 : null;

  return fornecedores
    .filter((fornecedor) => {
      const bateBusca = termo === "" || normalize(fornecedor.companyName).includes(termo);
      const bateCategoria = categoria === TODAS_CATEGORIAS || fornecedor.category === categoria;
      const bateAvaliacao =
        notaMinima === null || (temAvaliacao(fornecedor) && fornecedor.ratingAverage >= notaMinima);
      return bateBusca && bateCategoria && bateAvaliacao;
    })
    .sort((a, b) => compareFornecedores(a, b, ordenacao));
}

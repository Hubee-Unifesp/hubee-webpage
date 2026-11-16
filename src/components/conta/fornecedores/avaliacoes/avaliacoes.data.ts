import type { AvaliacaoFornecedor, NotaEstrela, ResumoAvaliacoes } from "@/types/avaliacao-fornecedor";

export const NOTAS: readonly NotaEstrela[] = [5, 4, 3, 2, 1];

/** Rótulo de cada nota, lido pelos leitores de tela e mostrado ao lado das estrelas no formulário. */
export const ROTULO_NOTA: Record<NotaEstrela, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente",
};

export type OrdemAvaliacoes = "recentes" | "maior-nota" | "menor-nota";
export const TODAS_NOTAS = "all";

export const ORDENS: readonly { id: OrdemAvaliacoes; label: string }[] = [
  { id: "recentes", label: "Mais recentes" },
  { id: "maior-nota", label: "Maior nota" },
  { id: "menor-nota", label: "Menor nota" },
];

function arredondar(valor: number): number {
  return Math.round(valor * 10) / 10;
}

export function calcularResumo(avaliacoes: readonly AvaliacaoFornecedor[]): ResumoAvaliacoes {
  const distribuicao: Record<NotaEstrela, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let somaNotas = 0;

  for (const avaliacao of avaliacoes) {
    distribuicao[avaliacao.rating] += 1;
    somaNotas += avaliacao.rating;
  }

  const total = avaliacoes.length;

  return {
    total,
    media: total === 0 ? 0 : arredondar(somaNotas / total),
    distribuicao,
  };
}

/** Filtra pela nota (ou todas) e ordena a lista de avaliações. */
export function filtrarAvaliacoes(
  avaliacoes: readonly AvaliacaoFornecedor[],
  nota: string,
  ordem: OrdemAvaliacoes,
): AvaliacaoFornecedor[] {
  const filtradas =
    nota === TODAS_NOTAS ? [...avaliacoes] : avaliacoes.filter((item) => String(item.rating) === nota);

  return filtradas.sort((a, b) => {
    if (ordem === "maior-nota" && b.rating !== a.rating) return b.rating - a.rating;
    if (ordem === "menor-nota" && b.rating !== a.rating) return a.rating - b.rating;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/** "4,5" — nota com vírgula decimal, como no restante da interface em pt-BR. */
export function formatarNota(nota: number): string {
  return nota.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatarTotalAvaliacoes(total: number): string {
  return `${total} ${total === 1 ? "avaliação" : "avaliações"}`;
}

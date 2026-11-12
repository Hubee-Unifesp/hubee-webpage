import type {
  AvaliacaoFornecedor,
  CriterioAvaliacao,
  NotaEstrela,
  NotasPorCriterio,
  ResumoAvaliacoes,
} from "@/types/avaliacao-fornecedor";

export const CRITERIOS: readonly { id: CriterioAvaliacao; label: string; descricao: string }[] = [
  { id: "qualidade", label: "Qualidade", descricao: "Entrega do serviço ou produto contratado" },
  { id: "pontualidade", label: "Pontualidade", descricao: "Cumprimento de horários e prazos" },
  { id: "comunicacao", label: "Comunicação", descricao: "Clareza e agilidade no atendimento" },
  { id: "custoBeneficio", label: "Custo-benefício", descricao: "Preço justo pelo que foi entregue" },
];

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

/** Média dos critérios com uma casa decimal. */
export function calcularNota(notas: NotasPorCriterio): number {
  const valores = CRITERIOS.map(({ id }) => notas[id]);
  return arredondar(valores.reduce((soma, valor) => soma + valor, 0) / valores.length);
}

/** Nota usada na distribuição e no filtro: arredondada para a estrela mais próxima. */
export function notaInteira(nota: number): NotaEstrela {
  return Math.min(5, Math.max(1, Math.round(nota))) as NotaEstrela;
}

export function calcularResumo(avaliacoes: readonly AvaliacaoFornecedor[]): ResumoAvaliacoes {
  const distribuicao: Record<NotaEstrela, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const somas: Record<CriterioAvaliacao, number> = { qualidade: 0, pontualidade: 0, comunicacao: 0, custoBeneficio: 0 };
  let somaNotas = 0;
  let recomendam = 0;

  for (const avaliacao of avaliacoes) {
    distribuicao[notaInteira(avaliacao.nota)] += 1;
    somaNotas += avaliacao.nota;
    if (avaliacao.recomenda) recomendam += 1;
    for (const { id } of CRITERIOS) somas[id] += avaliacao.notas[id];
  }

  const total = avaliacoes.length;
  const media = (soma: number) => (total === 0 ? 0 : arredondar(soma / total));

  return {
    total,
    media: media(somaNotas),
    distribuicao,
    mediasPorCriterio: {
      qualidade: media(somas.qualidade),
      pontualidade: media(somas.pontualidade),
      comunicacao: media(somas.comunicacao),
      custoBeneficio: media(somas.custoBeneficio),
    },
    percentualRecomenda: total === 0 ? 0 : Math.round((recomendam / total) * 100),
  };
}

/** Filtra pela nota arredondada (ou todas) e ordena a lista de avaliações. */
export function filtrarAvaliacoes(
  avaliacoes: readonly AvaliacaoFornecedor[],
  nota: string,
  ordem: OrdemAvaliacoes,
): AvaliacaoFornecedor[] {
  const filtradas =
    nota === TODAS_NOTAS ? [...avaliacoes] : avaliacoes.filter((item) => String(notaInteira(item.nota)) === nota);

  return filtradas.sort((a, b) => {
    if (ordem === "maior-nota" && b.nota !== a.nota) return b.nota - a.nota;
    if (ordem === "menor-nota" && b.nota !== a.nota) return a.nota - b.nota;
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

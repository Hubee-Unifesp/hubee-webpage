/** Critérios avaliados em cada prestação de serviço de um fornecedor. */
export type CriterioAvaliacao = "qualidade" | "pontualidade" | "comunicacao" | "custoBeneficio";

/** Nota de 1 a 5 estrelas. */
export type NotaEstrela = 1 | 2 | 3 | 4 | 5;

export type NotasPorCriterio = Record<CriterioAvaliacao, NotaEstrela>;

/** Avaliação de um fornecedor feita por um membro da organização após um evento. */
export interface AvaliacaoFornecedor {
  id: string;
  supplierId: string;
  eventId: string;
  eventName: string;
  /** Data de início do evento avaliado (ISO). */
  eventDate: string;
  authorName: string;
  notas: NotasPorCriterio;
  /** Média dos critérios, de 1 a 5, com uma casa decimal. */
  nota: number;
  recomenda: boolean;
  comentario: string | null;
  createdAt: string;
}

/** Corpo de criação de uma avaliação. */
export interface AvaliacaoFornecedorPayload {
  eventId: string;
  notas: NotasPorCriterio;
  recomenda: boolean;
  comentario?: string;
}

/** Números consolidados das avaliações de um fornecedor. */
export interface ResumoAvaliacoes {
  total: number;
  /** Média geral (0 quando não há avaliações). */
  media: number;
  /** Quantidade de avaliações por nota arredondada (1 a 5). */
  distribuicao: Record<NotaEstrela, number>;
  mediasPorCriterio: Record<CriterioAvaliacao, number>;
  /** Percentual (0–100) de avaliações que recomendam o fornecedor. */
  percentualRecomenda: number;
}

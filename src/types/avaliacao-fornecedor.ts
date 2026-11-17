/** Nota de 1 a 5 estrelas. */
export type NotaEstrela = 1 | 2 | 3 | 4 | 5;

/** Avaliação de um fornecedor como a `hubee-api` devolve em `GET /suppliers/:id/reviews`. */
export interface AvaliacaoFornecedor {
  id: string;
  supplierId: string;
  /** Id do usuário autor da avaliação. */
  userId: string;
  /** Nome do usuário autor, exibido no card. */
  userName: string;
  /** Nota de 1 a 5 (inteiro). */
  rating: NotaEstrela;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de criação/atualização (`POST /suppliers/:id/reviews`). Upsert por (fornecedor, usuário). */
export interface AvaliacaoFornecedorPayload {
  rating: NotaEstrela;
  comment?: string;
}

/** Números consolidados das avaliações de um fornecedor. */
export interface ResumoAvaliacoes {
  total: number;
  /** Média geral (0 quando não há avaliações). */
  media: number;
  /** Quantidade de avaliações por nota (1 a 5). */
  distribuicao: Record<NotaEstrela, number>;
}

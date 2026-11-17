import { describe, expect, it } from "vitest";
import type { AvaliacaoFornecedor, NotaEstrela } from "@/types/avaliacao-fornecedor";
import {
  calcularResumo,
  filtrarAvaliacoes,
  formatarNota,
  formatarTotalAvaliacoes,
  TODAS_NOTAS,
} from "./avaliacoes.data";

function avaliacao(id: string, rating: NotaEstrela, createdAt: string): AvaliacaoFornecedor {
  return {
    id,
    supplierId: "sup-1",
    userId: "user-1",
    userName: "Ana",
    rating,
    comment: null,
    createdAt,
    updatedAt: createdAt,
  };
}

const alta = avaliacao("a", 5, "2026-03-01T00:00:00Z");
const media = avaliacao("b", 3, "2026-05-01T00:00:00Z");
const baixa = avaliacao("c", 2, "2026-04-01T00:00:00Z");

describe("calcularResumo", () => {
  it("devolve zeros sem avaliações", () => {
    const resumo = calcularResumo([]);
    expect(resumo.total).toBe(0);
    expect(resumo.media).toBe(0);
    expect(resumo.distribuicao).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("consolida média e distribuição", () => {
    const resumo = calcularResumo([alta, media, baixa]);
    expect(resumo.total).toBe(3);
    expect(resumo.media).toBe(3.3);
    expect(resumo.distribuicao).toEqual({ 1: 0, 2: 1, 3: 1, 4: 0, 5: 1 });
  });
});

describe("filtrarAvaliacoes", () => {
  const todas = [alta, media, baixa];

  it("ordena por mais recentes por padrão", () => {
    expect(filtrarAvaliacoes(todas, TODAS_NOTAS, "recentes").map((a) => a.id)).toEqual(["b", "c", "a"]);
  });

  it("ordena por maior e menor nota", () => {
    expect(filtrarAvaliacoes(todas, TODAS_NOTAS, "maior-nota").map((a) => a.id)).toEqual(["a", "b", "c"]);
    expect(filtrarAvaliacoes(todas, TODAS_NOTAS, "menor-nota").map((a) => a.id)).toEqual(["c", "b", "a"]);
  });

  it("filtra pela nota", () => {
    expect(filtrarAvaliacoes(todas, "5", "recentes").map((a) => a.id)).toEqual(["a"]);
  });
});

describe("formatação", () => {
  it("usa vírgula decimal e pluraliza o total", () => {
    expect(formatarNota(4)).toBe("4,0");
    expect(formatarTotalAvaliacoes(1)).toBe("1 avaliação");
    expect(formatarTotalAvaliacoes(3)).toBe("3 avaliações");
  });
});

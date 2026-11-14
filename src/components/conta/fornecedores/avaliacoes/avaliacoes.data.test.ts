import { describe, expect, it } from "vitest";
import type { AvaliacaoFornecedor, NotasPorCriterio } from "@/types/avaliacao-fornecedor";
import {
  calcularNota,
  calcularResumo,
  filtrarAvaliacoes,
  formatarNota,
  formatarTotalAvaliacoes,
  notaInteira,
  TODAS_NOTAS,
} from "./avaliacoes.data";

function avaliacao(id: string, notas: NotasPorCriterio, createdAt: string, recomenda = true): AvaliacaoFornecedor {
  return {
    id,
    supplierId: "sup-1",
    eventId: "evt-1",
    eventName: "Evento",
    eventDate: "2026-01-01T00:00:00.000Z",
    authorName: "Ana",
    notas,
    nota: calcularNota(notas),
    recomenda,
    comentario: null,
    createdAt,
  };
}

const alta = avaliacao("a", { qualidade: 5, pontualidade: 5, comunicacao: 5, custoBeneficio: 4 }, "2026-03-01T00:00:00Z");
const media = avaliacao("b", { qualidade: 3, pontualidade: 3, comunicacao: 3, custoBeneficio: 3 }, "2026-05-01T00:00:00Z");
const baixa = avaliacao("c", { qualidade: 1, pontualidade: 2, comunicacao: 1, custoBeneficio: 2 }, "2026-04-01T00:00:00Z", false);

describe("calcularNota", () => {
  it("faz a média dos critérios com uma casa decimal", () => {
    expect(alta.nota).toBe(4.8);
    expect(baixa.nota).toBe(1.5);
  });
});

describe("notaInteira", () => {
  it("arredonda para a estrela mais próxima dentro de 1 a 5", () => {
    expect(notaInteira(4.8)).toBe(5);
    expect(notaInteira(1.5)).toBe(2);
    expect(notaInteira(0)).toBe(1);
  });
});

describe("calcularResumo", () => {
  it("devolve zeros sem avaliações", () => {
    const resumo = calcularResumo([]);
    expect(resumo.total).toBe(0);
    expect(resumo.media).toBe(0);
    expect(resumo.percentualRecomenda).toBe(0);
  });

  it("consolida média, distribuição, critérios e recomendação", () => {
    const resumo = calcularResumo([alta, media, baixa]);
    expect(resumo.total).toBe(3);
    expect(resumo.media).toBe(3.1);
    expect(resumo.distribuicao).toEqual({ 1: 0, 2: 1, 3: 1, 4: 0, 5: 1 });
    expect(resumo.mediasPorCriterio.qualidade).toBe(3);
    expect(resumo.percentualRecomenda).toBe(67);
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

  it("filtra pela nota arredondada", () => {
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

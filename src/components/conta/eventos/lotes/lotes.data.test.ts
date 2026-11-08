import { describe, expect, it } from "vitest";
import type { LoteIngresso } from "@/types/lote-ingresso";
import { adaptarLote, formatarJanelaVendas, getStatusVenda, getVendidos } from "./lotes.data";
import { aplicarEdicao, limparLotesMock, novoLote, obterLotes } from "./lotes.store";

const lote: LoteIngresso = {
  id: "1",
  batch: "1º Lote",
  modality: "inteira",
  price: 80,
  quantity: 100,
  available: 60,
  salesStartDate: "2026-11-10T12:00:00.000Z",
  salesEndDate: "2026-11-20T12:00:00.000Z",
};

describe("adaptarLote", () => {
  it("assume inteira, tudo disponível e sem janela de vendas", () => {
    expect(adaptarLote({ id: "a", batch: "VIP", price: 150, quantity: 20 })).toEqual({
      id: "a",
      batch: "VIP",
      modality: "inteira",
      price: 150,
      quantity: 20,
      available: 20,
      salesStartDate: null,
      salesEndDate: null,
    });
  });
});

describe("getVendidos", () => {
  it("é o total menos o disponível, nunca negativo", () => {
    expect(getVendidos(lote)).toBe(40);
    expect(getVendidos({ quantity: 5, available: 9 })).toBe(0);
  });
});

describe("getStatusVenda", () => {
  it("marca esgotado antes de qualquer outra regra", () => {
    expect(getStatusVenda({ ...lote, available: 0 }, new Date("2026-11-05T00:00:00Z"))).toBe("esgotado");
  });

  it("separa em breve, à venda e encerrado pela janela", () => {
    expect(getStatusVenda(lote, new Date("2026-11-09T12:00:00Z"))).toBe("em-breve");
    expect(getStatusVenda(lote, new Date("2026-11-15T12:00:00Z"))).toBe("a-venda");
    expect(getStatusVenda(lote, new Date("2026-11-20T12:00:00Z"))).toBe("encerrado");
  });

  it("sem janela, está sempre à venda", () => {
    expect(getStatusVenda({ ...lote, salesStartDate: null, salesEndDate: null })).toBe("a-venda");
  });
});

describe("formatarJanelaVendas", () => {
  it("descreve cada combinação de início e fim", () => {
    expect(formatarJanelaVendas({ salesStartDate: null, salesEndDate: null })).toBe("Sem período definido");
    expect(formatarJanelaVendas({ salesStartDate: lote.salesStartDate, salesEndDate: null })).toMatch(/^A partir de /);
    expect(formatarJanelaVendas({ salesStartDate: null, salesEndDate: lote.salesEndDate })).toMatch(/^Até /);
    expect(formatarJanelaVendas(lote)).toMatch(/ até /);
  });
});

describe("lotes.store", () => {
  it("cria o lote com tudo disponível", () => {
    const criado = novoLote({ ...lote, quantity: 30 });
    expect(criado.available).toBe(30);
    expect(criado.id).toBeTruthy();
  });

  it("ao editar, preserva o já vendido", () => {
    expect(aplicarEdicao(lote, { ...lote, quantity: 150 })).toMatchObject({ quantity: 150, available: 110 });
    expect(aplicarEdicao(lote, { ...lote, quantity: 40 })).toMatchObject({ quantity: 40, available: 0 });
  });

  it("guarda os lotes por evento até serem limpos", () => {
    limparLotesMock();
    expect(obterLotes("e1", () => [lote])).toEqual([lote]);
    expect(obterLotes("e1", () => [])).toEqual([lote]);
    limparLotesMock();
    expect(obterLotes("e1", () => [])).toEqual([]);
  });
});

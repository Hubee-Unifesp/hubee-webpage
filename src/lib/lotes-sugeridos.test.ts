import { describe, expect, it } from "vitest";
import { lerLotesSugeridos } from "./lotes-sugeridos";

describe("lerLotesSugeridos", () => {
  it("restaura os lotes salvos", () => {
    const lotes = [{ batch: "Meia", price: 20, quantity: null, modality: "meia" }];
    expect(lerLotesSugeridos(JSON.stringify(lotes))).toEqual(lotes);
  });

  it.each([
    ["vazio", null],
    ["JSON inválido", "{"],
    ["que não é lista", JSON.stringify({ batch: "x" })],
  ])("ignora conteúdo %s", (_caso, raw) => {
    expect(lerLotesSugeridos(raw)).toEqual([]);
  });

  it("descarta itens sem nome de lote", () => {
    expect(lerLotesSugeridos(JSON.stringify([{ price: 10 }, null, { batch: "VIP", price: 80, quantity: 10, modality: null }]))).toEqual([
      { batch: "VIP", price: 80, quantity: 10, modality: null },
    ]);
  });
});

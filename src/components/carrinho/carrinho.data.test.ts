import { describe, expect, it } from "vitest";
import { TAXA_DE_SERVICO, calculateCartSummary, formatCurrencyBRL } from "./carrinho.data";
import type { CartItem } from "@/types/carrinho";

const item = (ticketTypeId: string, quantity: number, unitPrice: number): CartItem => ({
  ticketTypeId,
  eventId: "evento-1",
  title: "Calourada",
  organization: "UNIFESP - SJC",
  batchLabel: "1º Lote · Inteira",
  category: "festas",
  unitPrice,
  quantity,
  maxQuantity: 4,
});

describe("calculateCartSummary", () => {
  it("soma os ingressos e os valores do carrinho", () => {
    const summary = calculateCartSummary([item("t1", 3, 70), item("t2", 1, 75)]);

    expect(summary.totalItems).toBe(4);
    expect(summary.subtotal).toBe(285);
  });

  it("nao cobra taxa, entao o total e igual ao subtotal", () => {
    const summary = calculateCartSummary([item("t1", 2, 60)]);

    expect(summary.serviceFee).toBe(TAXA_DE_SERVICO);
    expect(summary.serviceFee).toBe(0);
    expect(summary.total).toBe(summary.subtotal);
  });

  it("retorna valores zerados quando o carrinho esta vazio", () => {
    const summary = calculateCartSummary([]);

    expect(summary).toEqual({ totalItems: 0, subtotal: 0, serviceFee: 0, total: 0 });
  });

  it("formata valores monetarios em BRL", () => {
    expect(formatCurrencyBRL(287)).toContain("287,00");
    expect(formatCurrencyBRL(0)).toContain("0,00");
  });
});

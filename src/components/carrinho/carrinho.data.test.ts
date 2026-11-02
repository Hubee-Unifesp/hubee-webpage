import { describe, expect, it } from "vitest";
import {
  DEFAULT_COUPON_DISCOUNT,
  INITIAL_CART_ITEMS,
  calculateCartSummary,
  formatCurrencyBRL,
} from "./carrinho.data";

describe("calculateCartSummary", () => {
  it("calcula subtotal, desconto e total dos itens iniciais conforme o Figma", () => {
    const summary = calculateCartSummary(INITIAL_CART_ITEMS, DEFAULT_COUPON_DISCOUNT);

    expect(summary.totalItems).toBe(6);
    expect(summary.subtotal).toBe(287);
    expect(summary.serviceFee).toBe(0);
    expect(summary.discount).toBe(4);
    expect(summary.total).toBe(283);
  });

  it("não permite que o total fique negativo quando o desconto supera o subtotal", () => {
    const summary = calculateCartSummary(
      [
        {
          id: "item-1",
          eventId: "evt-1",
          title: "Innovation Week",
          organization: "UNIFESP - SJC",
          batchLabel: "1º Lote",
          category: "palestras",
          unitPrice: 2,
          quantity: 1,
          maxQuantity: 4,
        },
      ],
      10,
    );

    expect(summary.subtotal).toBe(2);
    expect(summary.discount).toBe(2);
    expect(summary.total).toBe(0);
  });

  it("retorna valores zerados quando o carrinho está vazio", () => {
    const summary = calculateCartSummary([], DEFAULT_COUPON_DISCOUNT);

    expect(summary.totalItems).toBe(0);
    expect(summary.subtotal).toBe(0);
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(0);
  });

  it("formata valores monetários em BRL", () => {
    expect(formatCurrencyBRL(287)).toContain("287,00");
    expect(formatCurrencyBRL(0)).toContain("0,00");
  });
});


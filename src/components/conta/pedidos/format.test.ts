import { describe, expect, it } from "vitest";
import { formatOrderDate, formatOrderDateTime, formatPaymentMethod } from "./format";

describe("pedidos format helpers", () => {
  it("formata data do pedido no fuso de São Paulo", () => {
    // 2026-10-31T23:00:00Z corresponde a 31/10/2026 às 20:00 no fuso de São Paulo (UTC-3)
    const iso = "2026-10-31T23:00:00Z";
    expect(formatOrderDate(iso)).toBe("31/10/2026");
    expect(formatOrderDateTime(iso)).toBe("31/10/2026 às 20:00");
  });

  it("formata métodos de pagamento corretamente", () => {
    expect(formatPaymentMethod("pix")).toBe("PIX");
    expect(formatPaymentMethod("cartao_credito")).toBe("Cartão de Crédito");
    expect(formatPaymentMethod("cartao_debito")).toBe("Cartão de Débito");
    expect(formatPaymentMethod("boleto")).toBe("Boleto Bancário");
    expect(formatPaymentMethod(null)).toBe("Não informado");
    expect(formatPaymentMethod(undefined)).toBe("Não informado");
    expect(formatPaymentMethod("outro_metodo")).toBe("outro_metodo");
  });
});

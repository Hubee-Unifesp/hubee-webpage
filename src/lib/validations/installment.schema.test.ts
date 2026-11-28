import { describe, expect, it } from "vitest";
import { emptyInstallmentForm, installmentSchema, toInstallmentPayload } from "./installment.schema";

describe("installmentSchema", () => {
  it("converte valor em reais e data do campo para o payload da API", () => {
    const values = installmentSchema.parse({
      ...emptyInstallmentForm("d1"),
      dueDate: "2026-11-10",
      amount: "1.234,56",
      paymentMethod: " Pix ",
    });

    const { expenseId, payload } = toInstallmentPayload(values);

    expect(expenseId).toBe("d1");
    expect(payload).toMatchObject({ amount: 1234.56, status: "pendente", paidBy: null, paymentMethod: "Pix" });
    expect(new Date(payload.dueDate).getDate()).toBe(10);
  });

  it("recusa parcela sem despesa, sem data ou com valor zero", () => {
    const result = installmentSchema.safeParse({ ...emptyInstallmentForm(), amount: "0" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(["expenseId", "dueDate", "amount"]);
  });

  it("preenche o valor sugerido no formulário vazio", () => {
    expect(emptyInstallmentForm("d1", 600).amount).toBe("600,00");
  });
});

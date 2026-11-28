import { describe, expect, it } from "vitest";
import { emptyExpenseForm, expenseSchema } from "./expense.schema";

describe("expenseSchema", () => {
  it("converte quantidade e valor em pt-BR e limpa opcionais vazios", () => {
    const result = expenseSchema.parse({
      ...emptyExpenseForm("variable", "Bar"),
      description: "Gelo cubo",
      quantity: "11",
      unitPrice: "1.250,50",
    });

    expect(result).toMatchObject({
      group: "variable",
      category: "Bar",
      quantity: 11,
      unitPrice: 1250.5,
      supplierId: null,
      responsible: null,
      notes: null,
    });
  });

  it("aceita quantidade zero para itens apenas cotados", () => {
    const result = expenseSchema.safeParse({ ...emptyExpenseForm(), category: "Estrutura", description: "Tenda", quantity: "0", unitPrice: "500" });

    expect(result.success).toBe(true);
  });

  it("recusa item vazio, quantidade negativa e valor inválido", () => {
    const result = expenseSchema.safeParse({ ...emptyExpenseForm(), category: "Estrutura", quantity: "-1", unitPrice: "abc" });

    expect(result.success).toBe(false);
    const campos = result.error?.issues.map((issue) => issue.path[0]);
    expect(campos).toEqual(expect.arrayContaining(["description", "quantity", "unitPrice"]));
  });
});

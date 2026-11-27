import { z } from "zod";
import type { DespesaPlanejamento, DespesaPlanejamentoPayload, GrupoDespesa } from "@/types/planejamento";
import { parsePrecoBRL, toPrecoInput } from "./ticket-type.schema";

export const EXPENSE_DESCRIPTION_MAX_LENGTH = 255;
export const EXPENSE_CATEGORY_MAX_LENGTH = 100;
export const EXPENSE_RESPONSIBLE_MAX_LENGTH = 100;
export const EXPENSE_VALUE_MAX = 9_999_999_999.99;

export const EXPENSE_GROUPS = ["fixed", "variable", "marketing"] as const satisfies readonly GrupoDespesa[];
export const EXPENSE_PAYMENT_STATUSES = ["pendente", "pago", "atrasado", "cancelado"] as const;

function parseQuantidade(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  const normalized = text.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

const textoOpcional = (max: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(max, { error: mensagem })
    .transform((value) => (value === "" ? null : value));

export const expenseSchema = z.object({
  group: z.enum(EXPENSE_GROUPS, { error: "Selecione o grupo da despesa." }),
  category: z
    .string()
    .trim()
    .min(1, { error: "A categoria é obrigatória." })
    .max(EXPENSE_CATEGORY_MAX_LENGTH, { error: `A categoria deve ter no máximo ${EXPENSE_CATEGORY_MAX_LENGTH} caracteres.` }),
  description: z
    .string()
    .trim()
    .min(1, { error: "O item é obrigatório." })
    .max(EXPENSE_DESCRIPTION_MAX_LENGTH, { error: `O item deve ter no máximo ${EXPENSE_DESCRIPTION_MAX_LENGTH} caracteres.` }),
  supplierId: z.string().transform((value) => (value === "" ? null : value)),
  quantity: z
    .string()
    .trim()
    .min(1, { error: "A quantidade é obrigatória. Use 0 para itens só cotados." })
    .transform((value, ctx) => {
      const quantity = parseQuantidade(value);
      if (quantity === null) {
        ctx.addIssue({ code: "custom", message: "Informe uma quantidade válida, sem negativos e com até 2 casas decimais." });
        return z.NEVER;
      }
      return quantity;
    }),
  unitPrice: z
    .string()
    .trim()
    .min(1, { error: "O valor unitário é obrigatório." })
    .transform((value, ctx) => {
      const price = parsePrecoBRL(value);
      if (price === null) {
        ctx.addIssue({ code: "custom", message: "Informe um valor válido, com até 2 casas decimais." });
        return z.NEVER;
      }
      if (price > EXPENSE_VALUE_MAX) {
        ctx.addIssue({ code: "custom", message: "O valor informado é alto demais." });
        return z.NEVER;
      }
      return price;
    }),
  responsible: textoOpcional(
    EXPENSE_RESPONSIBLE_MAX_LENGTH,
    `O responsável deve ter no máximo ${EXPENSE_RESPONSIBLE_MAX_LENGTH} caracteres.`,
  ),
  quoted: z.boolean(),
  paymentStatus: z.enum(EXPENSE_PAYMENT_STATUSES, { error: "Selecione a situação do pagamento." }),
  notes: textoOpcional(500, "A observação deve ter no máximo 500 caracteres."),
});

export type ExpenseFormInputs = z.input<typeof expenseSchema>;
export type ExpenseFormValues = z.output<typeof expenseSchema>;

export function emptyExpenseForm(group: GrupoDespesa = "fixed", category = ""): ExpenseFormInputs {
  return {
    group,
    category,
    description: "",
    supplierId: "",
    quantity: "1",
    unitPrice: "",
    responsible: "",
    quoted: false,
    paymentStatus: "pendente",
    notes: "",
  };
}

export function toExpenseFormInputs(despesa: DespesaPlanejamento): ExpenseFormInputs {
  return {
    group: despesa.group,
    category: despesa.category,
    description: despesa.description,
    supplierId: despesa.supplierId ?? "",
    quantity: String(despesa.quantity).replace(".", ","),
    unitPrice: toPrecoInput(despesa.unitPrice),
    responsible: despesa.responsible ?? "",
    quoted: despesa.quoted,
    paymentStatus: despesa.paymentStatus,
    notes: despesa.notes ?? "",
  };
}

export function toExpensePayload(values: ExpenseFormValues): DespesaPlanejamentoPayload {
  return { ...values };
}

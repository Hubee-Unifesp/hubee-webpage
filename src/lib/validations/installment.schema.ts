import { z } from "zod";
import { deDataInput, paraDataInput } from "@/components/conta/eventos/planejamento/cronograma.data";
import type { ParcelaDespesa, ParcelaPayload } from "@/types/planejamento";
import { EXPENSE_VALUE_MAX } from "./expense.schema";
import { parsePrecoBRL, toPrecoInput } from "./ticket-type.schema";

export const INSTALLMENT_STATUSES = ["pendente", "pago", "cancelado"] as const;

const textoOpcional = (max: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(max, { error: mensagem })
    .transform((value) => (value === "" ? null : value));

export const installmentSchema = z.object({
  expenseId: z.string().min(1, { error: "Selecione a despesa." }),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe a data da parcela." })
    .transform(deDataInput),
  amount: z
    .string()
    .trim()
    .min(1, { error: "O valor da parcela é obrigatório." })
    .transform((value, ctx) => {
      const amount = parsePrecoBRL(value);
      if (amount === null || amount <= 0) {
        ctx.addIssue({ code: "custom", message: "Informe um valor maior que zero, com até 2 casas decimais." });
        return z.NEVER;
      }
      if (amount > EXPENSE_VALUE_MAX) {
        ctx.addIssue({ code: "custom", message: "O valor informado é alto demais." });
        return z.NEVER;
      }
      return amount;
    }),
  status: z.enum(INSTALLMENT_STATUSES, { error: "Selecione a situação da parcela." }),
  paidBy: textoOpcional(255, "Quem pagou deve ter no máximo 255 caracteres."),
  paymentMethod: textoOpcional(100, "A forma de pagamento deve ter no máximo 100 caracteres."),
});

export type InstallmentFormInputs = z.input<typeof installmentSchema>;
export type InstallmentFormValues = z.output<typeof installmentSchema>;

export function emptyInstallmentForm(expenseId = "", amount: number | null = null): InstallmentFormInputs {
  return {
    expenseId,
    dueDate: "",
    amount: amount ? toPrecoInput(amount) : "",
    status: "pendente",
    paidBy: "",
    paymentMethod: "",
  };
}

export function toInstallmentFormInputs(parcela: ParcelaDespesa): InstallmentFormInputs {
  return {
    expenseId: parcela.expenseId,
    dueDate: paraDataInput(parcela.dueDate),
    amount: toPrecoInput(parcela.amount),
    status: parcela.status === "atrasado" ? "pendente" : parcela.status,
    paidBy: parcela.paidBy ?? "",
    paymentMethod: parcela.paymentMethod ?? "",
  };
}

export function toInstallmentPayload(values: InstallmentFormValues): { expenseId: string; payload: ParcelaPayload } {
  const { expenseId, ...payload } = values;
  return { expenseId, payload };
}

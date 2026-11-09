import { z } from "zod";
import type { LotePayload, ModalidadeLote } from "@/types/lote-ingresso";

/** Limite da coluna `batch` da tabela `ticket_types` da hubee-api. */
export const TICKET_TYPE_BATCH_MAX_LENGTH = 100;
/** `numeric(12, 2)` na API: 10 dígitos inteiros e 2 decimais. */
export const TICKET_TYPE_PRICE_MAX = 9_999_999_999.99;
/** `integer` do Postgres. */
export const TICKET_TYPE_QUANTITY_MAX = 2_147_483_647;

export const TICKET_TYPE_MODALITIES = ["inteira", "meia", "estudante", "vip", "cortesia"] as const satisfies
  readonly ModalidadeLote[];

function toTime(value: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Lê um valor em reais digitado em pt-BR (`50`, `50,5`, `1.250,50`).
 * Devolve `null` quando o texto não é um valor monetário válido.
 */
export function parsePrecoBRL(value: string): number | null {
  const text = value.replace(/^R\$\s*/, "").trim();
  if (!text) return null;
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

/** Texto do campo de preço para um valor existente (`1250.5` vira `1250,50`). */
export function toPrecoInput(price: number): string {
  return price.toFixed(2).replace(".", ",");
}

const dateField = z.string().refine((value) => !value || toTime(value) !== null, { error: "Data inválida." });

/**
 * Schema do formulário de lote. `vendidos` é a quantidade já vendida do lote em edição:
 * o total não pode ficar abaixo dela, senão o saldo disponível ficaria negativo.
 */
export function buildTicketTypeSchema(vendidos = 0) {
  return z
    .object({
      batch: z
        .string()
        .trim()
        .min(1, { error: "O nome do lote é obrigatório." })
        .max(TICKET_TYPE_BATCH_MAX_LENGTH, {
          error: `O nome deve ter no máximo ${TICKET_TYPE_BATCH_MAX_LENGTH} caracteres.`,
        }),
      modality: z.enum(TICKET_TYPE_MODALITIES, { error: "Selecione a modalidade do ingresso." }),
      price: z
        .string()
        .trim()
        .min(1, { error: "O preço é obrigatório. Use 0 para ingressos gratuitos." })
        .transform((value, ctx) => {
          const price = parsePrecoBRL(value);
          if (price === null) {
            ctx.addIssue({ code: "custom", message: "Informe um valor válido, com até 2 casas decimais." });
            return z.NEVER;
          }
          if (price > TICKET_TYPE_PRICE_MAX) {
            ctx.addIssue({ code: "custom", message: "O preço informado é alto demais." });
            return z.NEVER;
          }
          return price;
        }),
      quantity: z
        .string()
        .trim()
        .min(1, { error: "A quantidade é obrigatória." })
        .transform((value, ctx) => {
          if (!/^\d+$/.test(value)) {
            ctx.addIssue({ code: "custom", message: "A quantidade deve ser um número inteiro, sem negativos." });
            return z.NEVER;
          }
          const quantity = Number(value);
          if (quantity > TICKET_TYPE_QUANTITY_MAX) {
            ctx.addIssue({ code: "custom", message: "A quantidade informada é alta demais." });
            return z.NEVER;
          }
          if (quantity < vendidos) {
            ctx.addIssue({
              code: "custom",
              message: `A quantidade não pode ser menor que os ${vendidos} ingressos já vendidos.`,
            });
            return z.NEVER;
          }
          return quantity;
        }),
      salesStartDate: dateField,
      salesEndDate: dateField,
    })
    .refine(
      ({ salesStartDate, salesEndDate }) => {
        const start = toTime(salesStartDate);
        const end = toTime(salesEndDate);
        return start === null || end === null || end > start;
      },
      {
        path: ["salesEndDate"],
        error: "O fim das vendas deve ser posterior ao início.",
        // Só compara quando os dois campos passaram pela validação de texto.
        when: ({ value }) => {
          const { salesStartDate, salesEndDate } = value as Record<string, unknown>;
          return typeof salesStartDate === "string" && typeof salesEndDate === "string";
        },
      },
    );
}

export const ticketTypeSchema = buildTicketTypeSchema();

export type TicketTypeSchema = ReturnType<typeof buildTicketTypeSchema>;
export type TicketTypeFormInputs = z.input<TicketTypeSchema>;
export type TicketTypeFormValues = z.output<TicketTypeSchema>;

export const emptyTicketTypeForm: TicketTypeFormInputs = {
  batch: "",
  modality: "inteira",
  price: "",
  quantity: "",
  salesStartDate: "",
  salesEndDate: "",
};

/** Converte os valores validados no corpo do lote; as datas voltam como ISO 8601. */
export function toLotePayload(values: TicketTypeFormValues): LotePayload {
  return {
    batch: values.batch,
    modality: values.modality,
    price: values.price,
    quantity: values.quantity,
    salesStartDate: values.salesStartDate ? new Date(values.salesStartDate).toISOString() : null,
    salesEndDate: values.salesEndDate ? new Date(values.salesEndDate).toISOString() : null,
  };
}

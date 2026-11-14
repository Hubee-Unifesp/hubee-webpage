import { z } from "zod";
import type { AvaliacaoFornecedorPayload, NotaEstrela } from "@/types/avaliacao-fornecedor";

export const SUPPLIER_REVIEW_COMMENT_MAX_LENGTH = 500;

// 0 representa "ainda não avaliado" no formulário; a API só aceita 1 a 5.
const notaField = z
  .number()
  .int()
  .min(1, { error: "Selecione de 1 a 5 estrelas." })
  .max(5, { error: "Selecione de 1 a 5 estrelas." });

export const supplierReviewSchema = z.object({
  eventId: z.string().min(1, { error: "Selecione o evento em que o fornecedor atuou." }),
  notas: z.object({
    qualidade: notaField,
    pontualidade: notaField,
    comunicacao: notaField,
    custoBeneficio: notaField,
  }),
  // "" enquanto a pessoa não escolheu; o Zod obriga "sim" ou "nao".
  recomenda: z.string().refine((value) => value === "sim" || value === "nao", {
    error: "Informe se você recomendaria este fornecedor.",
  }),
  comentario: z.string().trim().max(SUPPLIER_REVIEW_COMMENT_MAX_LENGTH, {
    error: `O comentário deve ter no máximo ${SUPPLIER_REVIEW_COMMENT_MAX_LENGTH} caracteres.`,
  }),
});

export type SupplierReviewFormInputs = z.input<typeof supplierReviewSchema>;
export type SupplierReviewFormValues = z.output<typeof supplierReviewSchema>;

export const emptySupplierReviewForm: SupplierReviewFormInputs = {
  eventId: "",
  notas: { qualidade: 0, pontualidade: 0, comunicacao: 0, custoBeneficio: 0 },
  recomenda: "",
  comentario: "",
};

export function toSupplierReviewPayload(values: SupplierReviewFormValues): AvaliacaoFornecedorPayload {
  const nota = (valor: number) => valor as NotaEstrela;
  return {
    eventId: values.eventId,
    notas: {
      qualidade: nota(values.notas.qualidade),
      pontualidade: nota(values.notas.pontualidade),
      comunicacao: nota(values.notas.comunicacao),
      custoBeneficio: nota(values.notas.custoBeneficio),
    },
    recomenda: values.recomenda === "sim",
    ...(values.comentario && { comentario: values.comentario }),
  };
}

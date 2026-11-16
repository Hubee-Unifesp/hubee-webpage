import { z } from "zod";
import type { AvaliacaoFornecedorPayload, NotaEstrela } from "@/types/avaliacao-fornecedor";

export const SUPPLIER_REVIEW_COMMENT_MAX_LENGTH = 500;

export const supplierReviewSchema = z.object({
  // 0 representa "ainda não avaliado" no formulário; a API só aceita 1 a 5.
  rating: z
    .number()
    .int()
    .min(1, { error: "Selecione de 1 a 5 estrelas." })
    .max(5, { error: "Selecione de 1 a 5 estrelas." }),
  comentario: z.string().trim().max(SUPPLIER_REVIEW_COMMENT_MAX_LENGTH, {
    error: `O comentário deve ter no máximo ${SUPPLIER_REVIEW_COMMENT_MAX_LENGTH} caracteres.`,
  }),
});

export type SupplierReviewFormInputs = z.input<typeof supplierReviewSchema>;
export type SupplierReviewFormValues = z.output<typeof supplierReviewSchema>;

export const emptySupplierReviewForm: SupplierReviewFormInputs = {
  rating: 0,
  comentario: "",
};

export function toSupplierReviewPayload(values: SupplierReviewFormValues): AvaliacaoFornecedorPayload {
  return {
    rating: values.rating as NotaEstrela,
    ...(values.comentario && { comment: values.comentario }),
  };
}

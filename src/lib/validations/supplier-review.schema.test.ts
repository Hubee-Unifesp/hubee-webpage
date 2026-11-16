import { describe, expect, it } from "vitest";
import {
  emptySupplierReviewForm,
  SUPPLIER_REVIEW_COMMENT_MAX_LENGTH,
  supplierReviewSchema,
  toSupplierReviewPayload,
  type SupplierReviewFormInputs,
} from "./supplier-review.schema";

const valid: SupplierReviewFormInputs = {
  rating: 5,
  comentario: "  Ótimo serviço.  ",
};

function errorsOf(values: SupplierReviewFormInputs): string[] {
  const result = supplierReviewSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("supplierReviewSchema", () => {
  it("aceita uma avaliação completa", () => {
    expect(supplierReviewSchema.safeParse(valid).success).toBe(true);
  });

  it("exige a nota no formulário vazio", () => {
    const messages = errorsOf(emptySupplierReviewForm);
    expect(messages).toContain("Selecione de 1 a 5 estrelas.");
  });

  it("rejeita nota fora de 1 a 5", () => {
    expect(errorsOf({ ...valid, rating: 6 })).toEqual(["Selecione de 1 a 5 estrelas."]);
  });

  it("limita o tamanho do comentário", () => {
    const comentario = "a".repeat(SUPPLIER_REVIEW_COMMENT_MAX_LENGTH + 1);
    expect(errorsOf({ ...valid, comentario })).toHaveLength(1);
  });
});

describe("toSupplierReviewPayload", () => {
  it("mantém a nota e apara o comentário", () => {
    const payload = toSupplierReviewPayload(supplierReviewSchema.parse(valid));
    expect(payload).toEqual({
      rating: 5,
      comment: "Ótimo serviço.",
    });
  });

  it("omite comentário vazio", () => {
    const payload = toSupplierReviewPayload(supplierReviewSchema.parse({ ...valid, comentario: "  " }));
    expect(payload.rating).toBe(5);
    expect(payload).not.toHaveProperty("comment");
  });
});

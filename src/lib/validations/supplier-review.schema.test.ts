import { describe, expect, it } from "vitest";
import {
  emptySupplierReviewForm,
  SUPPLIER_REVIEW_COMMENT_MAX_LENGTH,
  supplierReviewSchema,
  toSupplierReviewPayload,
  type SupplierReviewFormInputs,
} from "./supplier-review.schema";

const valid: SupplierReviewFormInputs = {
  eventId: "evt-1",
  notas: { qualidade: 5, pontualidade: 4, comunicacao: 4, custoBeneficio: 3 },
  recomenda: "sim",
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

  it("exige evento, as quatro notas e a recomendação no formulário vazio", () => {
    const messages = errorsOf(emptySupplierReviewForm);
    expect(messages).toContain("Selecione o evento em que o fornecedor atuou.");
    expect(messages.filter((m) => m === "Selecione de 1 a 5 estrelas.")).toHaveLength(4);
    expect(messages).toContain("Informe se você recomendaria este fornecedor.");
  });

  it("rejeita nota fora de 1 a 5", () => {
    expect(errorsOf({ ...valid, notas: { ...valid.notas, qualidade: 6 } })).toEqual(["Selecione de 1 a 5 estrelas."]);
  });

  it("limita o tamanho do comentário", () => {
    const comentario = "a".repeat(SUPPLIER_REVIEW_COMMENT_MAX_LENGTH + 1);
    expect(errorsOf({ ...valid, comentario })).toHaveLength(1);
  });
});

describe("toSupplierReviewPayload", () => {
  it("converte a recomendação em booleano e apara o comentário", () => {
    const payload = toSupplierReviewPayload(supplierReviewSchema.parse(valid));
    expect(payload).toEqual({
      eventId: "evt-1",
      notas: valid.notas,
      recomenda: true,
      comentario: "Ótimo serviço.",
    });
  });

  it("omite comentário vazio", () => {
    const payload = toSupplierReviewPayload(supplierReviewSchema.parse({ ...valid, recomenda: "nao", comentario: "  " }));
    expect(payload.recomenda).toBe(false);
    expect(payload).not.toHaveProperty("comentario");
  });
});

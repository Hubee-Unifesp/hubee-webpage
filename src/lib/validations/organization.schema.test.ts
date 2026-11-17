import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_DESCRIPTION_MAX_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
  organizationSchema,
} from "./organization.schema";

function organizationErrors(input: { name: string; description?: string }) {
  const result = organizationSchema.safeParse(input);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    if (!(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

describe("organizationSchema", () => {
  it("aceita nome valido e descricao opcional vazia ou ausente", () => {
    expect(organizationErrors({ name: "Atlética Unifesp" })).toEqual({});
    expect(organizationErrors({ name: "Atlética Unifesp", description: "" })).toEqual({});
    expect(
      organizationErrors({
        name: "Coletivo Cultural",
        description: "Organização estudantil voltada para eventos culturais e acadêmicos.",
      }),
    ).toEqual({});
  });

  it("aceita nome nos limites de 2 e 255 caracteres", () => {
    expect(organizationErrors({ name: "A".repeat(ORGANIZATION_NAME_MIN_LENGTH) })).toEqual({});
    expect(organizationErrors({ name: "A".repeat(ORGANIZATION_NAME_MAX_LENGTH) })).toEqual({});
  });

  it("recusa nome vazio ou apenas com espacos", () => {
    expect(organizationErrors({ name: "" }).name).toBe("Informe o nome da organização.");
    expect(organizationErrors({ name: "   " }).name).toBe("Informe o nome da organização.");
  });

  it("recusa nome com menos de 2 caracteres", () => {
    expect(organizationErrors({ name: "A" }).name).toBe(
      "O nome da organização deve ter pelo menos 2 caracteres.",
    );
    expect(organizationErrors({ name: " A " }).name).toBe(
      "O nome da organização deve ter pelo menos 2 caracteres.",
    );
  });

  it("recusa nome com mais de 255 caracteres", () => {
    expect(organizationErrors({ name: "A".repeat(ORGANIZATION_NAME_MAX_LENGTH + 1) }).name).toBe(
      "O nome da organização deve ter no máximo 255 caracteres.",
    );
  });

  it("recusa descricao com mais de 500 caracteres", () => {
    expect(
      organizationErrors({
        name: "Atlética Unifesp",
        description: "D".repeat(ORGANIZATION_DESCRIPTION_MAX_LENGTH + 1),
      }).description,
    ).toBe("A descrição deve ter no máximo 500 caracteres.");
  });
});

import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  NEW_PASSWORD_MAX_LENGTH,
  NEW_PASSWORD_MIN_LENGTH,
  personalDataSchema,
} from "./profile.schema";

function passwordErrors(input: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const result = changePasswordSchema.safeParse(input);
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

const validPassword = (length: number) => "a".repeat(length - 1) + "1";

describe("changePasswordSchema", () => {
  it("aceita a nova senha nos limites de 8 e 72 caracteres", () => {
    for (const length of [NEW_PASSWORD_MIN_LENGTH, NEW_PASSWORD_MAX_LENGTH]) {
      const newPassword = validPassword(length);
      expect(passwordErrors({ currentPassword: "atual123", newPassword, confirmPassword: newPassword })).toEqual({});
    }
  });

  it("recusa nova senha com 7 caracteres", () => {
    const newPassword = validPassword(NEW_PASSWORD_MIN_LENGTH - 1);

    expect(passwordErrors({ currentPassword: "atual123", newPassword, confirmPassword: newPassword }).newPassword).toBe(
      "A senha deve ter no mínimo 8 caracteres.",
    );
  });

  it("recusa nova senha com 73 caracteres", () => {
    const newPassword = validPassword(NEW_PASSWORD_MAX_LENGTH + 1);

    expect(passwordErrors({ currentPassword: "atual123", newPassword, confirmPassword: newPassword }).newPassword).toBe(
      "A senha deve ter no máximo 72 caracteres.",
    );
  });

  it("recusa nova senha igual a atual", () => {
    expect(
      passwordErrors({ currentPassword: "mesma1234", newPassword: "mesma1234", confirmPassword: "mesma1234" })
        .newPassword,
    ).toBe("A nova senha deve ser diferente da atual.");
  });

  it("recusa confirmacao diferente da nova senha", () => {
    expect(
      passwordErrors({ currentPassword: "atual123", newPassword: "nova12345", confirmPassword: "outra12345" })
        .confirmPassword,
    ).toBe("As senhas não conferem.");
  });
});

describe("personalDataSchema", () => {
  it("aceita telefone vazio, ja que e opcional", () => {
    expect(personalDataSchema.safeParse({ fullName: "Maria Silva", email: "maria@email.com", phone: "" }).success).toBe(
      true,
    );
  });

  it("recusa telefone sem DDD", () => {
    expect(
      personalDataSchema.safeParse({ fullName: "Maria Silva", email: "maria@email.com", phone: "9876-5432" }).success,
    ).toBe(false);
  });
});

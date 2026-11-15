import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  completeProfileSchema,
  formatCpf,
  isValidCpf,
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

  it("aceita CPF e data de nascimento opcionais vazios ou válidos", () => {
    expect(
      personalDataSchema.safeParse({
        fullName: "Maria Silva",
        email: "maria@email.com",
        phone: "",
        cpf: "",
        birthDate: "",
      }).success,
    ).toBe(true);

    expect(
      personalDataSchema.safeParse({
        fullName: "Maria Silva",
        email: "maria@email.com",
        phone: "",
        cpf: "529.982.247-25",
        birthDate: "1998-05-15",
      }).success,
    ).toBe(true);
  });

  it("recusa CPF inválido ou data de nascimento futura quando preenchidos", () => {
    expect(
      personalDataSchema.safeParse({
        fullName: "Maria Silva",
        email: "maria@email.com",
        phone: "",
        cpf: "529.982.247-24",
      }).success,
    ).toBe(false);

    expect(
      personalDataSchema.safeParse({
        fullName: "Maria Silva",
        email: "maria@email.com",
        phone: "",
        birthDate: "2099-01-01",
      }).success,
    ).toBe(false);
  });
});

describe("completeProfileSchema e utilitários de CPF", () => {
  it("valida dígitos verificadores de CPF corretamente e formata com máscara", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("52998224724")).toBe(false);
  });

  it("aceita CPF válido e data de nascimento não futura", () => {
    expect(
      completeProfileSchema.safeParse({
        cpf: "529.982.247-25",
        birthDate: "1998-05-15",
      }).success,
    ).toBe(true);
  });

  it("exige CPF e data de nascimento e recusa valores inválidos", () => {
    const empty = completeProfileSchema.safeParse({ cpf: "", birthDate: "" });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      const messages = Object.fromEntries(empty.error.issues.map((i) => [i.path[0], i.message]));
      expect(messages.cpf).toBe("Informe seu CPF.");
      expect(messages.birthDate).toBe("Informe sua data de nascimento.");
    }

    const shortCpf = completeProfileSchema.safeParse({ cpf: "123.456", birthDate: "1998-05-15" });
    expect(shortCpf.success).toBe(false);

    const invalidCpf = completeProfileSchema.safeParse({ cpf: "529.982.247-24", birthDate: "1998-05-15" });
    expect(invalidCpf.success).toBe(false);

    const futureDate = completeProfileSchema.safeParse({ cpf: "529.982.247-25", birthDate: "2099-12-31" });
    expect(futureDate.success).toBe(false);
  });
});

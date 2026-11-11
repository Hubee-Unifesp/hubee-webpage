import { describe, expect, it } from "vitest";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  registerSchema,
} from "./auth.schema";

function registerPasswordError(password: string): string | undefined {
  const result = registerSchema.safeParse({
    signupIntent: "BUY",
    fullName: "Maria Silva",
    email: "maria@email.com",
    password,
    confirmPassword: password,
  });

  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === "password")?.message;
}

describe("registerSchema (limites de senha unificados)", () => {
  it("aceita senhas nos limites de 8 e 72 caracteres", () => {
    for (const length of [PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]) {
      const password = "a".repeat(length);
      expect(registerPasswordError(password)).toBeUndefined();
    }
  });

  it("recusa senha com 7 caracteres", () => {
    const password = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    expect(registerPasswordError(password)).toBe("A senha deve ter no mínimo 8 caracteres.");
  });

  it("recusa senha com 73 caracteres", () => {
    const password = "a".repeat(PASSWORD_MAX_LENGTH + 1);
    expect(registerPasswordError(password)).toBe("A senha deve ter no máximo 72 caracteres.");
  });
});

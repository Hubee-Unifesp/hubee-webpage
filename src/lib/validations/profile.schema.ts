import { z } from "zod";
import { CPF_LENGTH, onlyDigits } from "@/lib/masks";
import { emailField, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./auth.schema";

const PHONE_MIN_DIGITS = 10;

/** Regra da nova senha na área logada (unificada com o cadastro e a API: 8 a 72 caracteres). */
export const NEW_PASSWORD_MIN_LENGTH = PASSWORD_MIN_LENGTH;
export const NEW_PASSWORD_MAX_LENGTH = PASSWORD_MAX_LENGTH;

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, CPF_LENGTH);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function cpfCheckDigit(digits: string): number {
  const sum = [...digits].reduce((acc, digit, index) => acc + Number(digit) * (digits.length + 1 - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** Mesma validação de dígitos verificadores do `@IsCpf()` da `hubee-api`. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== CPF_LENGTH || /^(\d)\1{10}$/.test(digits)) return false;
  return (
    cpfCheckDigit(digits.slice(0, 9)) === Number(digits[9]) &&
    cpfCheckDigit(digits.slice(0, 10)) === Number(digits[10])
  );
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 1900) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/** Mesma regra do `@IsNotFutureDate()` da `hubee-api`. */
export function isNotFutureDate(value: string): boolean {
  if (!isValidIsoDate(value)) return false;
  const today = new Date().toISOString().split("T")[0];
  return value <= today;
}

const optionalCpfField = z
  .string()
  .optional()
  .superRefine((value, ctx) => {
    const digits = onlyDigits(value ?? "");
    if (!digits) return;
    if (digits.length !== CPF_LENGTH) {
      ctx.addIssue({ code: "custom", message: "O CPF deve ter 11 dígitos." });
      return;
    }
    if (!isValidCpf(digits)) {
      ctx.addIssue({ code: "custom", message: "CPF inválido." });
    }
  });

const optionalBirthDateField = z
  .string()
  .optional()
  .superRefine((value, ctx) => {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return;
    if (!isValidIsoDate(trimmed)) {
      ctx.addIssue({ code: "custom", message: "Data de nascimento inválida." });
      return;
    }
    if (!isNotFutureDate(trimmed)) {
      ctx.addIssue({ code: "custom", message: "A data de nascimento não pode estar no futuro." });
    }
  });

const requiredCpfField = z.string().superRefine((value, ctx) => {
  const digits = onlyDigits(value);
  if (!digits) {
    ctx.addIssue({ code: "custom", message: "Informe seu CPF." });
    return;
  }
  if (digits.length !== CPF_LENGTH) {
    ctx.addIssue({ code: "custom", message: "O CPF deve ter 11 dígitos." });
    return;
  }
  if (!isValidCpf(digits)) {
    ctx.addIssue({ code: "custom", message: "CPF inválido." });
  }
});

const requiredBirthDateField = z.string().superRefine((value, ctx) => {
  const trimmed = value.trim();
  if (!trimmed) {
    ctx.addIssue({ code: "custom", message: "Informe sua data de nascimento." });
    return;
  }
  if (!isValidIsoDate(trimmed)) {
    ctx.addIssue({ code: "custom", message: "Data de nascimento inválida." });
    return;
  }
  if (!isNotFutureDate(trimmed)) {
    ctx.addIssue({ code: "custom", message: "A data de nascimento não pode estar no futuro." });
  }
});

export const personalDataSchema = z.object({
  fullName: z.string().trim().min(1, { error: "Informe seu nome completo." }),
  email: emailField,
  // Opcional: só valida o tamanho quando preenchido (DDD + número).
  phone: z.string().refine((value) => !value || value.replace(/\D/g, "").length >= PHONE_MIN_DIGITS, {
    error: "Informe o telefone com DDD.",
  }),
  cpf: optionalCpfField,
  birthDate: optionalBirthDateField,
});

export const completeProfileSchema = z.object({
  cpf: requiredCpfField,
  birthDate: requiredBirthDateField,
});

/** Roda a validação cruzada mesmo quando outro campo já falhou (comportamento padrão do zod 4 é pular). */
function bothAreStrings(first: string, second: string) {
  return ({ value }: { value: unknown }) => {
    const fields = value as Record<string, unknown>;
    return typeof fields[first] === "string" && typeof fields[second] === "string";
  };
}

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Informe sua senha atual." }),
    newPassword: z
      .string()
      .min(1, { error: "Informe a nova senha." })
      .min(NEW_PASSWORD_MIN_LENGTH, { error: `A senha deve ter no mínimo ${NEW_PASSWORD_MIN_LENGTH} caracteres.` })
      .max(NEW_PASSWORD_MAX_LENGTH, { error: `A senha deve ter no máximo ${NEW_PASSWORD_MAX_LENGTH} caracteres.` }),
    confirmPassword: z.string().min(1, { error: "Confirme a nova senha." }),
  })
  .refine((data) => !data.newPassword || data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    error: "A nova senha deve ser diferente da atual.",
    when: bothAreStrings("newPassword", "currentPassword"),
  })
  .refine((data) => !data.confirmPassword || data.confirmPassword === data.newPassword, {
    path: ["confirmPassword"],
    error: "As senhas não conferem.",
    when: bothAreStrings("newPassword", "confirmPassword"),
  });

export type PersonalDataInputs = z.infer<typeof personalDataSchema>;
export type CompleteProfileInputs = z.infer<typeof completeProfileSchema>;
export type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;

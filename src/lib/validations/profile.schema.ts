import { z } from "zod";
import { emailField } from "./auth.schema";

const PHONE_MIN_DIGITS = 10;

/** Regra da nova senha na área logada (a API limita o bcrypt em 72 caracteres). */
export const NEW_PASSWORD_MIN_LENGTH = 8;
export const NEW_PASSWORD_MAX_LENGTH = 72;

export const personalDataSchema = z.object({
  fullName: z.string().trim().min(1, { error: "Informe seu nome completo." }),
  email: emailField,
  // Opcional: só valida o tamanho quando preenchido (DDD + número).
  phone: z.string().refine((value) => !value || value.replace(/\D/g, "").length >= PHONE_MIN_DIGITS, {
    error: "Informe o telefone com DDD.",
  }),
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
export type ChangePasswordInputs = z.infer<typeof changePasswordSchema>;

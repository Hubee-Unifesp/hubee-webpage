import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const emailField = z
  .string()
  .trim()
  .min(1, { error: "Informe seu e-mail." })
  .pipe(z.email({ error: "Informe um e-mail válido." }));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "Informe sua senha." }),
});

export const signupIntents = ["BUY", "ORGANIZE"] as const;

export const registerSchema = z
  .object({
    signupIntent: z.enum(signupIntents),
    fullName: z.string().trim().min(1, { error: "Informe seu nome." }),
    email: emailField,
    password: z
      .string()
      .min(1, { error: "Informe uma senha." })
      .min(PASSWORD_MIN_LENGTH, { error: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.` }),
    confirmPassword: z.string().min(1, { error: "Confirme sua senha." }),
  })
  .refine((data) => !data.confirmPassword || data.confirmPassword === data.password, {
    path: ["confirmPassword"],
    error: "As senhas não conferem.",
    when: ({ value }) => {
      const { password, confirmPassword } = value as Partial<Record<"password" | "confirmPassword", unknown>>;
      return typeof password === "string" && typeof confirmPassword === "string";
    },
  });

export type SignupIntent = (typeof signupIntents)[number];
export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;

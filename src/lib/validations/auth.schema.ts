import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 6;

const emailField = z
  .string()
  .trim()
  .min(1, { message: "Informe seu e-mail." })
  .email({ message: "Informe um e-mail válido." });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "Informe sua senha." }),
});

export const signupIntents = ["BUY", "ORGANIZE"] as const;

export const registerSchema = z
  .object({
    signupIntent: z.enum(signupIntents),
    fullName: z.string().trim().min(1, { message: "Informe seu nome." }),
    email: emailField,
    password: z
      .string()
      .min(1, { message: "Informe sua senha." })
      .min(PASSWORD_MIN_LENGTH, { message: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.` }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((data) => data.confirmPassword === data.password, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  })
  .refine(
    (data) => {
      // Validação para exigir pelo menos nome e sobrenome
      return data.fullName.trim().split(/\s+/).length >= 2;
    },
    {
      path: ["fullName"],
      message: "Deves inserir o teu nome e apelido.",
    }
  );

export type SignupIntent = (typeof signupIntents)[number];
export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
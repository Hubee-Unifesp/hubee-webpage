import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('O e-mail é inválido'),
  password: z.string().min(1, 'A palavra-passe é obrigatória'),
});

export const registerSchema = z.object({
  fullName: z.string()
    .trim()
    .refine((name) => name.split(/\s+/).length >= 2, {
      message: 'Deves inserir o teu nome e apelido',
    }),
  email: z.string().email('O e-mail é inválido'),
  password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
  signupIntent: z.enum(['BUY', 'ORGANIZE']),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
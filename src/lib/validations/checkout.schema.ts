import { z } from "zod";
import { emailField } from "./auth.schema";

export const paymentMethods = ["pix", "card"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatCardExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCardCvv(value: string): string {
  return onlyDigits(value).slice(0, 4);
}

/** Mascara o CPF para exibição na tela de confirmação (ex.: `***.456.789-**`). */
export function maskCpfForDisplay(cpf: string): string {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return "***.456.789-**";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export const checkoutSchema = z
  .object({
    useAccountData: z.boolean(),
    fullName: z
      .string()
      .trim()
      .min(1, { error: "Informe o nome completo do comprador." })
      .refine((value) => value.trim().split(/\s+/).length >= 2, {
        error: "Informe o nome e o sobrenome do comprador.",
      }),
    email: emailField,
    cpf: z.string().refine((value) => onlyDigits(value).length === 11, {
      error: "Informe um CPF válido com 11 dígitos.",
    }),
    phone: z.string().refine(
      (value) => {
        const length = onlyDigits(value).length;
        return length === 10 || length === 11;
      },
      {
        error: "Informe um telefone válido com DDD.",
      },
    ),
    paymentMethod: z.enum(paymentMethods),
    cardNumber: z.string(),
    cardHolder: z.string(),
    cardExpiry: z.string(),
    cardCvv: z.string(),
    installments: z.string(),
    acceptTerms: z.boolean().refine((value) => value === true, {
      error: "Você precisa aceitar os Termos de Uso e a Política de Cancelamento.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "card") return;

    if (onlyDigits(data.cardNumber).length !== 16) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNumber"],
        message: "Informe os 16 dígitos do cartão de crédito.",
      });
    }

    if (data.cardHolder.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["cardHolder"],
        message: "Informe o nome impresso no cartão.",
      });
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry)) {
      ctx.addIssue({
        code: "custom",
        path: ["cardExpiry"],
        message: "Informe a validade no formato MM/AA.",
      });
    }

    if (!/^\d{3,4}$/.test(onlyDigits(data.cardCvv))) {
      ctx.addIssue({
        code: "custom",
        path: ["cardCvv"],
        message: "Informe o CVV de 3 ou 4 dígitos.",
      });
    }

    if (!data.installments.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["installments"],
        message: "Selecione uma opção de parcelamento.",
      });
    }
  });

export type CheckoutFormInputs = z.infer<typeof checkoutSchema>;


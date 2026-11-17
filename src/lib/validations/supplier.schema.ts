import { z } from "zod";
import { onlyDigits } from "@/lib/masks";
import type { FornecedorPayload } from "@/types/fornecedor";

/** Limites das colunas `company_name` e `category` da tabela `suppliers`. */
export const SUPPLIER_COMPANY_NAME_MAX_LENGTH = 255;
export const SUPPLIER_CATEGORY_MAX_LENGTH = 100;
const DOCUMENT_MIN_LENGTH = 11;
const DOCUMENT_MAX_LENGTH = 14;
const PHONE_MIN_DIGITS = 10;

/** Remove só os separadores da máscara, para que letras digitadas ainda sejam detectadas. */
function stripDocumentMask(value: string): string {
  return value.replace(/[\s./-]/g, "");
}

// Mesmas regras e mensagens do `CreateSupplierDto` da hubee-api: apenas números, de 11 a 14 dígitos.
const documentField = z.string().superRefine((value, ctx) => {
  const raw = stripDocumentMask(value);
  if (!raw) {
    ctx.addIssue({ code: "custom", message: "O CNPJ ou CPF é obrigatório." });
    return;
  }
  if (!/^\d+$/.test(raw)) {
    ctx.addIssue({ code: "custom", message: "O documento deve conter apenas números." });
    return;
  }
  if (raw.length < DOCUMENT_MIN_LENGTH || raw.length > DOCUMENT_MAX_LENGTH) {
    ctx.addIssue({ code: "custom", message: "O documento deve ter entre 11 e 14 caracteres." });
  }
});

const emailFormat = z.email();

export const supplierSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, { error: "O nome da empresa é obrigatório." })
    .max(SUPPLIER_COMPANY_NAME_MAX_LENGTH, {
      error: `O nome deve ter no máximo ${SUPPLIER_COMPANY_NAME_MAX_LENGTH} caracteres.`,
    }),
  cnpjCpf: documentField,
  // Opcional: só valida o tamanho quando preenchido (DDD + número).
  phone: z.string().refine((value) => !value || onlyDigits(value).length >= PHONE_MIN_DIGITS, {
    error: "Informe o telefone com DDD.",
  }),
  email: z
    .string()
    .trim()
    .refine((value) => !value || emailFormat.safeParse(value).success, { error: "Formato de e-mail inválido." }),
  category: z.string().trim().max(SUPPLIER_CATEGORY_MAX_LENGTH, {
    error: `A categoria deve ter no máximo ${SUPPLIER_CATEGORY_MAX_LENGTH} caracteres.`,
  }),
});

export type SupplierFormInputs = z.input<typeof supplierSchema>;
export type SupplierFormValues = z.output<typeof supplierSchema>;

export const emptySupplierForm: SupplierFormInputs = {
  companyName: "",
  cnpjCpf: "",
  phone: "",
  email: "",
  category: "",
};

/** Converte os valores do formulário no corpo esperado pela API: documento e telefone só com dígitos. */
export function toSupplierPayload(values: SupplierFormValues): FornecedorPayload {
  const phone = onlyDigits(values.phone);
  return {
    companyName: values.companyName,
    cnpjCpf: onlyDigits(values.cnpjCpf),
    ...(phone && { phone }),
    ...(values.email && { email: values.email }),
    ...(values.category && { category: values.category }),
  };
}

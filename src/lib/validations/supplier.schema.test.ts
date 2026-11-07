import { describe, expect, it } from "vitest";
import {
  emptySupplierForm,
  SUPPLIER_CATEGORY_MAX_LENGTH,
  SUPPLIER_COMPANY_NAME_MAX_LENGTH,
  supplierSchema,
  toSupplierPayload,
  type SupplierFormInputs,
} from "./supplier.schema";

const valid: SupplierFormInputs = {
  ...emptySupplierForm,
  companyName: "Buffet Sabor & Arte Ltda.",
  cnpjCpf: "12.345.678/0001-95",
};

function errors(overrides: Partial<SupplierFormInputs>) {
  const result = supplierSchema.safeParse({ ...valid, ...overrides });
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("supplierSchema", () => {
  it("aceita apenas os campos obrigatórios, com os opcionais vazios", () => {
    expect(errors({})).toEqual({});
  });

  it("aceita todos os campos preenchidos", () => {
    expect(
      errors({ phone: "(11) 98765-4321", email: "contato@saborarte.com.br", category: "Buffet" }),
    ).toEqual({});
  });

  describe("companyName", () => {
    it("recusa nome vazio ou só com espaços", () => {
      expect(errors({ companyName: "   " }).companyName).toBe("O nome da empresa é obrigatório.");
    });

    it("aceita 255 caracteres e recusa 256", () => {
      expect(errors({ companyName: "a".repeat(SUPPLIER_COMPANY_NAME_MAX_LENGTH) })).toEqual({});
      expect(errors({ companyName: "a".repeat(SUPPLIER_COMPANY_NAME_MAX_LENGTH + 1) }).companyName).toBe(
        "O nome deve ter no máximo 255 caracteres.",
      );
    });
  });

  describe("cnpjCpf", () => {
    it("aceita CPF e CNPJ com ou sem máscara", () => {
      for (const cnpjCpf of ["123.456.789-09", "12345678909", "12.345.678/0001-95", "12345678000195"]) {
        expect(errors({ cnpjCpf })).toEqual({});
      }
    });

    it("recusa documento vazio", () => {
      expect(errors({ cnpjCpf: "" }).cnpjCpf).toBe("O CNPJ ou CPF é obrigatório.");
    });

    it("recusa documento com letras", () => {
      expect(errors({ cnpjCpf: "12345678ABC" }).cnpjCpf).toBe("O documento deve conter apenas números.");
    });

    it("recusa documento com menos de 11 ou mais de 14 dígitos", () => {
      expect(errors({ cnpjCpf: "12345" }).cnpjCpf).toBe("O documento deve ter entre 11 e 14 caracteres.");
      expect(errors({ cnpjCpf: "123456789012345" }).cnpjCpf).toBe("O documento deve ter entre 11 e 14 caracteres.");
    });
  });

  describe("phone", () => {
    it("recusa telefone sem DDD", () => {
      expect(errors({ phone: "9876-5432" }).phone).toBe("Informe o telefone com DDD.");
    });
  });

  describe("email", () => {
    it("recusa e-mail sem domínio completo", () => {
      expect(errors({ email: "contato@empresa" }).email).toBe("Formato de e-mail inválido.");
    });
  });

  describe("category", () => {
    it("aceita 100 caracteres e recusa 101", () => {
      expect(errors({ category: "a".repeat(SUPPLIER_CATEGORY_MAX_LENGTH) })).toEqual({});
      expect(errors({ category: "a".repeat(SUPPLIER_CATEGORY_MAX_LENGTH + 1) }).category).toBe(
        "A categoria deve ter no máximo 100 caracteres.",
      );
    });
  });
});

describe("toSupplierPayload", () => {
  it("envia documento e telefone só com dígitos e remove espaços das bordas", () => {
    const values = supplierSchema.parse({
      companyName: "  Luz & Cena Produções Ltda.  ",
      cnpjCpf: "23.456.789/0001-12",
      phone: "(11) 99876-5432",
      email: " equipe@luzecena.com.br ",
      category: " Som e iluminação ",
    });

    expect(toSupplierPayload(values)).toEqual({
      companyName: "Luz & Cena Produções Ltda.",
      cnpjCpf: "23456789000112",
      phone: "11998765432",
      email: "equipe@luzecena.com.br",
      category: "Som e iluminação",
    });
  });

  it("omite os campos opcionais vazios", () => {
    expect(toSupplierPayload(supplierSchema.parse(valid))).toEqual({
      companyName: "Buffet Sabor & Arte Ltda.",
      cnpjCpf: "12345678000195",
    });
  });
});

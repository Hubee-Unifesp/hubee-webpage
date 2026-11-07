import { describe, expect, it } from "vitest";
import { formatCpfCnpj, formatPhone, onlyDigits } from "./masks";

describe("onlyDigits", () => {
  it("remove tudo que não é número", () => {
    expect(onlyDigits("12.345.678/0001-95")).toBe("12345678000195");
    expect(onlyDigits("abc")).toBe("");
  });
});

describe("formatCpfCnpj", () => {
  it("aplica a máscara de CPF progressivamente até 11 dígitos", () => {
    expect(formatCpfCnpj("123")).toBe("123");
    expect(formatCpfCnpj("1234")).toBe("123.4");
    expect(formatCpfCnpj("1234567")).toBe("123.456.7");
    expect(formatCpfCnpj("1234567890")).toBe("123.456.789-0");
    expect(formatCpfCnpj("12345678909")).toBe("123.456.789-09");
  });

  it("troca para a máscara de CNPJ a partir de 12 dígitos", () => {
    expect(formatCpfCnpj("123456780001")).toBe("12.345.678/0001");
    expect(formatCpfCnpj("1234567800019")).toBe("12.345.678/0001-9");
    expect(formatCpfCnpj("12345678000195")).toBe("12.345.678/0001-95");
  });

  it("ignora letras e corta acima de 14 dígitos", () => {
    expect(formatCpfCnpj("123abc456")).toBe("123.456");
    expect(formatCpfCnpj("123456780001959")).toBe("12.345.678/0001-95");
  });

  it("reformata um valor que já tem máscara", () => {
    expect(formatCpfCnpj("123.456.789-09")).toBe("123.456.789-09");
  });
});

describe("formatPhone", () => {
  it("formata fixo e celular", () => {
    expect(formatPhone("1132654321")).toBe("(11) 3265-4321");
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("formata valores parciais", () => {
    expect(formatPhone("11")).toBe("11");
    expect(formatPhone("119")).toBe("(11) 9");
  });
});

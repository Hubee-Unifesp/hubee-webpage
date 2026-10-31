import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  formatCardExpiry,
  formatCardNumber,
  formatCpf,
  formatPhone,
  maskCpfForDisplay,
  type CheckoutFormInputs,
} from "./checkout.schema";

const validPixBase: CheckoutFormInputs = {
  useAccountData: true,
  fullName: "Gustavo Baptistella Ocampo",
  email: "gustavo@unifesp.br",
  cpf: "123.456.789-01",
  phone: "(11) 99999-9999",
  paymentMethod: "pix",
  cardNumber: "",
  cardHolder: "",
  cardExpiry: "",
  cardCvv: "",
  installments: "1x",
  acceptTerms: true,
};

describe("checkoutSchema", () => {
  it("aceita checkout via PIX sem exigir dados de cartao", () => {
    const result = checkoutSchema.safeParse(validPixBase);
    expect(result.success).toBe(true);
  });

  it("exige CPF, telefone e aceite dos termos", () => {
    const result = checkoutSchema.safeParse({
      ...validPixBase,
      cpf: "123",
      phone: "9999",
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toContain("cpf");
      expect(paths).toContain("phone");
      expect(paths).toContain("acceptTerms");
    }
  });

  it("valida campos do cartao quando paymentMethod e card", () => {
    const invalidCard = checkoutSchema.safeParse({
      ...validPixBase,
      paymentMethod: "card",
    });

    expect(invalidCard.success).toBe(false);
    if (!invalidCard.success) {
      const paths = invalidCard.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(["cardNumber", "cardHolder", "cardExpiry", "cardCvv"]),
      );
    }

    const validCard = checkoutSchema.safeParse({
      ...validPixBase,
      paymentMethod: "card",
      cardNumber: "4242 4242 4242 4242",
      cardHolder: "GUSTAVO B OCAMPO",
      cardExpiry: "12/29",
      cardCvv: "123",
      installments: "1x",
    });

    expect(validCard.success).toBe(true);
  });

  it("formata mascaras de CPF, telefone, cartao e validade", () => {
    expect(formatCpf("12345678901")).toBe("123.456.789-01");
    expect(maskCpfForDisplay("123.456.789-01")).toBe("***.456.789-**");
    expect(formatPhone("11988887777")).toBe("(11) 98888-7777");
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardExpiry("1128")).toBe("11/28");
  });
});


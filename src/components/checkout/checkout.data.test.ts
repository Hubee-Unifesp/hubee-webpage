import { describe, expect, it } from "vitest";
import {
  TAXA_DE_SERVICO,
  numeroDoPedido,
  toApiPaymentMethod,
  toCheckoutOrder,
  toIngressosDaCompra,
} from "./checkout.data";
import type { CartItem } from "@/types/carrinho";

const item = (ticketTypeId: string, extra: Partial<CartItem> = {}): CartItem => ({
  ticketTypeId,
  eventId: "evento-1",
  title: "Calourada",
  organization: "UNIFESP - SJC",
  batchLabel: "1º Lote",
  category: "festas",
  unitPrice: 75,
  quantity: 1,
  maxQuantity: 10,
  ...extra,
});

describe("toCheckoutOrder", () => {
  it("monta os itens do pedido a partir do carrinho", () => {
    const order = toCheckoutOrder([item("t1", { quantity: 2 })]);

    expect(order.items).toEqual([
      {
        ticketTypeId: "t1",
        title: "Ingresso 1º Lote",
        eventName: "Calourada",
        quantity: 2,
        unitPrice: 75,
      },
    ]);
  });

  it("nao cobra taxa, entao o total e a soma dos lotes", () => {
    const order = toCheckoutOrder([item("t1", { quantity: 2 }), item("t2", { unitPrice: 40 })]);

    expect(order.serviceFeeAmount).toBe(TAXA_DE_SERVICO);
    expect(order.totalAmount).toBe(190);
  });

  it("lista cada evento uma vez, mesmo com varios lotes do mesmo evento", () => {
    const order = toCheckoutOrder([
      item("t1"),
      item("t2"),
      item("t3", { eventId: "evento-2", title: "Show da Colmeia" }),
    ]);

    expect(order.eventNames).toEqual(["Calourada", "Show da Colmeia"]);
  });
});

describe("toIngressosDaCompra", () => {
  const items = toCheckoutOrder([item("t1", { quantity: 2 })]).items;

  it("usa o rotulo do item do pedido com o mesmo lote", () => {
    const ingressos = toIngressosDaCompra(
      [
        { id: "i1", codigo: "qr-1", ticketTypeId: "t1" },
        { id: "i2", codigo: "qr-2", ticketTypeId: "t1" },
      ],
      items,
    );

    expect(ingressos).toEqual([
      { id: "i1", codigo: "qr-1", tipo: "Ingresso 1º Lote", eventName: "Calourada" },
      { id: "i2", codigo: "qr-2", tipo: "Ingresso 1º Lote", eventName: "Calourada" },
    ]);
  });

  it("cai no rotulo padrao quando o lote nao esta no pedido", () => {
    const [ingresso] = toIngressosDaCompra([{ id: "i9", codigo: "qr-9", ticketTypeId: "outro" }], items);

    expect(ingresso).toMatchObject({ tipo: "Ingresso", eventName: "" });
  });
});

describe("toApiPaymentMethod", () => {
  it("traduz o metodo do formulario para o enum da API", () => {
    expect(toApiPaymentMethod("pix")).toBe("pix");
    expect(toApiPaymentMethod("card")).toBe("cartao_credito");
  });
});

describe("numeroDoPedido", () => {
  it("usa os primeiros oito caracteres do id, em maiusculas", () => {
    expect(numeroDoPedido("a1b2c3d4-0000-4000-8000-000000000001")).toBe("A1B2C3D4");
  });
});

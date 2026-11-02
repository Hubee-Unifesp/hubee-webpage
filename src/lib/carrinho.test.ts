import { describe, expect, it } from "vitest";
import {
  MAX_ITENS_PEDIDO,
  MAX_QUANTIDADE_POR_LOTE,
  adicionarItem,
  definirQuantidade,
  lerCarrinhoSalvo,
  paraItensDoPedido,
  removerItem,
  subtotal,
  totalDeIngressos,
} from "./carrinho";
import type { CartItem, NovoItemCarrinho } from "@/types/carrinho";

const lote = (ticketTypeId: string, extra: Partial<NovoItemCarrinho> = {}): NovoItemCarrinho => ({
  ticketTypeId,
  eventId: "evento-1",
  title: "Calourada",
  organization: "UNIFESP - SJC",
  batchLabel: "1º Lote · Inteira",
  category: "festas",
  unitPrice: 75,
  maxQuantity: 4,
  ...extra,
});

const item = (ticketTypeId: string, quantity: number, extra: Partial<CartItem> = {}): CartItem => ({
  ...lote(ticketTypeId),
  quantity,
  ...extra,
});

describe("adicionarItem", () => {
  it("adiciona o lote com quantidade 1 por padrao", () => {
    const { status, itens } = adicionarItem([], lote("t1"));

    expect(status).toBe("adicionado");
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ ticketTypeId: "t1", quantity: 1 });
  });

  it("soma na linha existente em vez de duplicar o lote", () => {
    const { status, itens } = adicionarItem([item("t1", 1)], lote("t1"));

    expect(status).toBe("quantidade-aumentada");
    expect(itens).toHaveLength(1);
    expect(itens[0].quantity).toBe(2);
  });

  it("nao passa do que resta no lote", () => {
    const { status, itens } = adicionarItem([item("t1", 4)], lote("t1", { maxQuantity: 4 }));

    expect(status).toBe("limite-do-lote");
    expect(itens[0].quantity).toBe(4);
  });

  it("limita a quantidade pedida ao que resta no lote", () => {
    const { itens } = adicionarItem([], lote("t1", { maxQuantity: 2 }), 5);

    expect(itens[0].quantity).toBe(2);
  });

  it("respeita o maximo por lote que a API aceita", () => {
    const { itens } = adicionarItem([], lote("t1", { maxQuantity: 500 }), 99);

    expect(itens[0].quantity).toBe(MAX_QUANTIDADE_POR_LOTE);
  });

  it("recusa lote sem ingresso disponivel", () => {
    const { status, itens } = adicionarItem([], lote("t1", { maxQuantity: 0 }));

    expect(status).toBe("esgotado");
    expect(itens).toEqual([]);
  });

  it("recusa lote novo quando o pedido ja tem o maximo de lotes", () => {
    const cheio = Array.from({ length: MAX_ITENS_PEDIDO }, (_, index) => item(`t${index}`, 1));

    const { status, itens } = adicionarItem(cheio, lote("novo"));

    expect(status).toBe("limite-do-pedido");
    expect(itens).toHaveLength(MAX_ITENS_PEDIDO);
  });

  it("ainda soma em lote que ja esta no carrinho cheio", () => {
    const cheio = Array.from({ length: MAX_ITENS_PEDIDO }, (_, index) => item(`t${index}`, 1));

    const { status } = adicionarItem(cheio, lote("t0"));

    expect(status).toBe("quantidade-aumentada");
  });

  it("atualiza preco e saldo do lote ao somar, porque podem ter mudado", () => {
    const { itens } = adicionarItem([item("t1", 1, { unitPrice: 75 })], lote("t1", { unitPrice: 90 }));

    expect(itens[0]).toMatchObject({ unitPrice: 90, quantity: 2 });
  });

  it("nao altera o carrinho recebido", () => {
    const original = [item("t1", 1)];

    adicionarItem(original, lote("t1"));

    expect(original[0].quantity).toBe(1);
  });
});

describe("definirQuantidade", () => {
  it("troca a quantidade do lote indicado", () => {
    const itens = definirQuantidade([item("t1", 1), item("t2", 1)], "t1", 3);

    expect(itens[0].quantity).toBe(3);
    expect(itens[1].quantity).toBe(1);
  });

  it("nunca desce abaixo de 1", () => {
    expect(definirQuantidade([item("t1", 2)], "t1", 0)[0].quantity).toBe(1);
    expect(definirQuantidade([item("t1", 2)], "t1", -5)[0].quantity).toBe(1);
  });

  it("nao passa do que resta no lote", () => {
    const itens = definirQuantidade([item("t1", 1, { maxQuantity: 3 })], "t1", 10);

    expect(itens[0].quantity).toBe(3);
  });
});

describe("removerItem", () => {
  it("remove so o lote indicado", () => {
    const itens = removerItem([item("t1", 1), item("t2", 1)], "t1");

    expect(itens.map((i) => i.ticketTypeId)).toEqual(["t2"]);
  });
});

describe("totais", () => {
  it("conta todos os ingressos, nao as linhas", () => {
    expect(totalDeIngressos([item("t1", 2), item("t2", 3)])).toBe(5);
  });

  it("soma o subtotal em reais", () => {
    expect(subtotal([item("t1", 2, { unitPrice: 75 }), item("t2", 1, { unitPrice: 40 })])).toBe(190);
  });

  it("soma precos quebrados sem erro de ponto flutuante", () => {
    expect(subtotal([item("t1", 3, { unitPrice: 0.1 })])).toBe(0.3);
  });

  it("zera com carrinho vazio", () => {
    expect(totalDeIngressos([])).toBe(0);
    expect(subtotal([])).toBe(0);
  });
});

describe("paraItensDoPedido", () => {
  it("converte para o formato que o createOrder espera", () => {
    expect(paraItensDoPedido([item("t1", 2), item("t2", 1)])).toEqual([
      { ticketTypeId: "t1", quantidade: 2 },
      { ticketTypeId: "t2", quantidade: 1 },
    ]);
  });
});

describe("lerCarrinhoSalvo", () => {
  it("devolve vazio sem nada gravado", () => {
    expect(lerCarrinhoSalvo(null)).toEqual([]);
    expect(lerCarrinhoSalvo("")).toEqual([]);
  });

  it("le o carrinho gravado", () => {
    const itens = [item("t1", 2)];

    expect(lerCarrinhoSalvo(JSON.stringify(itens))).toEqual(itens);
  });

  it("descarta conteudo que nao e JSON", () => {
    expect(lerCarrinhoSalvo("{nao-json")).toEqual([]);
  });

  it("descarta conteudo que nao e lista", () => {
    expect(lerCarrinhoSalvo(JSON.stringify({ ticketTypeId: "t1" }))).toEqual([]);
  });

  it("descarta itens com campo faltando ou de tipo errado", () => {
    const bruto = JSON.stringify([
      item("t1", 1),
      { ticketTypeId: "t2" },
      { ...item("t3", 1), unitPrice: "75" },
      { ...item("t4", 1), quantity: 0 },
      null,
    ]);

    expect(lerCarrinhoSalvo(bruto).map((i) => i.ticketTypeId)).toEqual(["t1"]);
  });

  it("corta o excesso de lotes do limite do pedido", () => {
    const bruto = JSON.stringify(
      Array.from({ length: MAX_ITENS_PEDIDO + 5 }, (_, index) => item(`t${index}`, 1)),
    );

    expect(lerCarrinhoSalvo(bruto)).toHaveLength(MAX_ITENS_PEDIDO);
  });
});

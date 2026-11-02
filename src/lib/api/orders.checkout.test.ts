import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authPost, authDelete } = vi.hoisted(() => ({ authPost: vi.fn(), authDelete: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: vi.fn(), post: authPost, delete: authDelete } }));
vi.mock("./client", () => ({ apiClient: { get: vi.fn() } }));

import { CompraError, cancelOrder, createOrder, processPayment } from "./orders";

const ORDER_ID = "a1b2c3d4-0000-4000-8000-000000000001";
const TYPE_ID = "t0000000-0000-4000-8000-000000000001";

/** Erro no formato que o axios entrega, para `parseApiError` reconhecer. */
function apiError(status: number, data: unknown): AxiosError {
  return new AxiosError("falhou", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data,
    statusText: "",
    headers: {},
    config: {} as never,
  });
}

/** A API responde a falha de negócio com `message` em texto. */
const negocio = (status: number, message: string) => apiError(status, { statusCode: status, message });

beforeEach(() => {
  authPost.mockReset();
  authDelete.mockReset();
});

describe("createOrder", () => {
  it("envia os lotes no formato da API e devolve o total que ela calculou", async () => {
    authPost.mockResolvedValue({
      data: {
        id: ORDER_ID,
        userId: "u",
        totalAmount: "134.00",
        status: "pendente",
        createdAt: "2026-11-02T12:00:00Z",
        items: [{ id: "i1", orderId: ORDER_ID, ticketTypeId: TYPE_ID, quantity: 2, unitPrice: "67.00" }],
      },
    });

    const pedido = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 2 }]);

    expect(authPost).toHaveBeenCalledWith("/orders", {
      items: [{ ticketTypeId: TYPE_ID, quantity: 2 }],
    });
    expect(pedido).toEqual({
      id: ORDER_ID,
      total: 134,
      itens: [{ ticketTypeId: TYPE_ID, quantidade: 2, valorUnitario: 67 }],
    });
  });

  it("nao envia o total: quem define o valor e a API", async () => {
    authPost.mockResolvedValue({ data: { id: ORDER_ID, totalAmount: 10, status: "pendente", items: [] } });

    await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]);

    const [, body] = authPost.mock.calls[0];
    expect(body).not.toHaveProperty("totalAmount");
    expect(body).not.toHaveProperty("total");
  });

  it("recusa carrinho vazio sem chamar a API", async () => {
    await expect(createOrder([])).rejects.toBeInstanceOf(CompraError);
    expect(authPost).not.toHaveBeenCalled();
  });

  it("identifica perfil incompleto e quais campos faltam", async () => {
    authPost.mockRejectedValue(
      apiError(403, {
        statusCode: 403,
        message: "Complete o perfil antes de comprar",
        code: "PROFILE_INCOMPLETE",
        missing: ["cpf", "birthDate"],
      }),
    );

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CompraError);
    expect(error).toMatchObject({ tipo: "perfil-incompleto", camposFaltando: ["cpf", "birthDate"] });
  });

  it("reaproveita a mensagem da API quando o lote esta esgotado", async () => {
    const message = 'O lote "1º Lote" do evento "Calourada" está esgotado';
    authPost.mockRejectedValue(negocio(422, message));

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "esgotado", message });
  });

  it("trata saldo insuficiente como esgotado, mantendo a quantidade disponivel", async () => {
    const message = 'O lote "1º Lote" do evento "Calourada" tem apenas 2 ingresso(s) disponível(is)';
    authPost.mockRejectedValue(negocio(422, message));

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 5 }]).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "esgotado", message });
  });

  it("identifica vendas que ainda nao abriram", async () => {
    authPost.mockRejectedValue(negocio(422, 'As vendas do evento "Calourada" não estão abertas'));

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "vendas-fechadas" });
  });

  it("avisa da falta de conexao quando a API nao responde", async () => {
    authPost.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "sem-conexao" });
  });

  it("usa mensagem generica quando a falha nao e de negocio", async () => {
    authPost.mockRejectedValue(negocio(500, "Internal server error"));

    const error = await createOrder([{ ticketTypeId: TYPE_ID, quantidade: 1 }]).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "desconhecido" });
    expect((error as CompraError).message).not.toContain("Internal");
  });
});

describe("processPayment", () => {
  it("paga o pedido e devolve a confirmacao", async () => {
    authPost.mockResolvedValue({
      data: {
        id: "p1",
        orderId: ORDER_ID,
        paymentMethod: "pix",
        status: "confirmado",
        amount: "134.00",
        paidAt: "2026-11-02T12:05:00Z",
      },
    });

    const pagamento = await processPayment(ORDER_ID, "pix");

    expect(authPost).toHaveBeenCalledWith("/payments", { orderId: ORDER_ID, paymentMethod: "pix" });
    expect(pagamento).toEqual({
      id: "p1",
      pedidoId: ORDER_ID,
      metodoPagamento: "pix",
      status: "confirmado",
      valor: 134,
      pagoEm: "2026-11-02T12:05:00Z",
    });
  });

  it("nao envia o valor: o pagamento e sempre do total do pedido", async () => {
    authPost.mockResolvedValue({ data: { id: "p1", orderId: ORDER_ID, paymentMethod: "pix", status: "confirmado", amount: 10 } });

    await processPayment(ORDER_ID, "pix");

    const [, body] = authPost.mock.calls[0];
    expect(body).not.toHaveProperty("amount");
  });

  it("avisa quando o pedido ja tem pagamento", async () => {
    authPost.mockRejectedValue(negocio(409, `Pedido ${ORDER_ID} já possui um pagamento registrado`));

    const error = await processPayment(ORDER_ID, "pix").catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "pagamento-duplicado" });
  });

  it("avisa quando o pedido nao pode mais ser pago", async () => {
    authPost.mockRejectedValue(negocio(422, "Pedido já foi pago"));

    const error = await processPayment(ORDER_ID, "pix").catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "pedido-indisponivel", message: "Pedido já foi pago" });
  });

  it("trata pedido de outra pessoa como indisponivel", async () => {
    authPost.mockRejectedValue(negocio(404, `Pedido ${ORDER_ID} não encontrado`));

    const error = await processPayment(ORDER_ID, "pix").catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "pedido-indisponivel" });
  });
});

describe("cancelOrder", () => {
  it("cancela o pedido pela rota do comprador", async () => {
    authDelete.mockResolvedValue({ status: 204 });

    await cancelOrder(ORDER_ID);

    expect(authDelete).toHaveBeenCalledWith(`/orders/${ORDER_ID}`);
  });

  it("avisa quando o pedido ja foi pago e nao pode ser cancelado", async () => {
    authDelete.mockRejectedValue(negocio(422, "Pedido pago não pode ser cancelado; registre um estorno"));

    const error = await cancelOrder(ORDER_ID).catch((e: unknown) => e);

    expect(error).toMatchObject({ tipo: "pedido-indisponivel" });
  });
});

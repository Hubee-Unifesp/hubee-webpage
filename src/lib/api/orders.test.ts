import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: apiGet } }));

import { getMyOrders, getPedido } from "./orders";

const EVENT_ID = "e0000000-0000-4000-8000-000000000001";
const TYPE_ID = "t0000000-0000-4000-8000-000000000001";

const paidOrder = {
  id: "a1b2c3d4-0000-4000-8000-000000000001",
  userId: "u",
  totalAmount: 134,
  status: "pago",
  createdAt: "2026-10-01T15:00:00Z",
  event: {
    id: EVENT_ID,
    name: "Calourada",
    startDate: "2026-10-31T23:00:00Z",
    endDate: "2026-11-01T04:00:00Z",
    status: "published",
  },
  items: [
    {
      id: "item-1",
      ticketTypeId: TYPE_ID,
      quantity: 2,
      unitPrice: "67.00",
      ticketTypeBatch: "Lote 1",
    },
  ],
  payment: {
    id: "pay-1",
    paymentMethod: "pix",
    status: "confirmado",
    amount: "134.00",
    paidAt: "2026-10-01T15:05:00Z",
  },
};

const pendingOrder = {
  id: "f9e8d7c6-0000-4000-8000-000000000002",
  userId: "u",
  totalAmount: "67.00",
  status: "pendente",
  createdAt: "2026-10-05T15:00:00Z",
  event: {
    id: EVENT_ID,
    name: "Calourada",
    startDate: "2026-10-31T23:00:00Z",
    endDate: "2026-11-01T04:00:00Z",
    status: "published",
  },
  items: [
    {
      id: "item-2",
      ticketTypeId: TYPE_ID,
      quantity: 1,
      unitPrice: "67.00",
      ticketTypeBatch: "Lote 1",
    },
  ],
};
const ticket = (id: string, status = "emitido") => ({
  id,
  qrCode: `qr-${id}`,
  orderId: paidOrder.id,
  eventId: EVENT_ID,
  ticketTypeId: TYPE_ID,
  status,
});

const defaultRoutes: Record<string, unknown> = {
  "/users/me/orders": [pendingOrder, paidOrder],
  "/users/me/tickets": [ticket("1"), ticket("2", "usado")],
  [`/orders/${paidOrder.id}`]: paidOrder,
  [`/orders/${pendingOrder.id}`]: pendingOrder,
};
const defaultPublicRoutes: Record<string, unknown> = {
  [`/events/${EVENT_ID}`]: {
    id: EVENT_ID,
    name: "Calourada",
    description: null,
    venueId: "v1",
    startDate: "2026-10-31T23:00:00Z",
    endDate: "2026-11-01T04:00:00Z",
    category: "Festas",
  },
  "/venues/v1": { id: "v1", name: "Quadra", address: { city: "Santos" } },
  [`/events/${EVENT_ID}/ticket-types`]: [{ id: TYPE_ID, batch: "Lote 1", price: "67.00" }],
};

const resolve = (
  privateTable: Record<string, unknown>,
  publicTable: Record<string, unknown> = {},
) => (url: string) => {
  if (url in privateTable) return Promise.resolve({ data: privateTable[url] });
  if (url in publicTable) return Promise.resolve({ data: publicTable[url] });
  return Promise.reject(new Error(`sem rota ${url}`));
};

// Cópias novas a cada teste: alguns casos trocam rotas (ex.: outros ingressos) e não podem vazar para os demais.
let routes: Record<string, unknown>;
let publicRoutes: Record<string, unknown>;

beforeEach(() => {
  routes = { ...defaultRoutes };
  publicRoutes = { ...defaultPublicRoutes };
  apiGet.mockReset().mockImplementation(resolve(routes, publicRoutes));
});

describe("getMyOrders", () => {
  it("monta o evento e itens a partir da resposta enriquecida da API", async () => {
    const [pending, paid] = await getMyOrders();

    expect(pending.eventos).toHaveLength(1);
    expect(pending.eventos[0].nome).toBe("Calourada");
    expect(pending.itens).toHaveLength(1);
    expect(pending.itens[0]).toMatchObject({
      descricao: "Ingresso Lote 1",
      quantidade: 1,
      valorUnitario: 67,
    });

    expect(paid.eventos).toHaveLength(1);
    expect(paid.eventos[0]).toMatchObject({
      nome: "Calourada",
      dataInicio: "2026-10-31T23:00:00Z",
    });
    expect(paid.itens).toHaveLength(1);
    expect(paid.metodoPagamento).toBe("pix");
  });

  it("ordena do pedido mais recente para o mais antigo e converte o total para numero", async () => {
    const orders = await getMyOrders();

    expect(orders.map((order) => order.id)).toEqual([pendingOrder.id, paidOrder.id]);
    expect(orders[0].total).toBe(67);
    expect(orders[0].numero).toBe("F9E8D7C6");
  });


  it("mantem a lista quando os ingressos nao carregam", async () => {
    apiGet.mockImplementation((url: string) =>
      url === "/users/me/tickets" ? Promise.reject(new Error("404")) : resolve(routes, publicRoutes)(url),
    );

    const orders = await getMyOrders();

    expect(orders).toHaveLength(2);
    expect(orders[0].eventos).toHaveLength(1);
  });

  it("propaga a falha da lista de pedidos", async () => {
    apiGet.mockImplementation((url: string) =>
      url === "/users/me/orders" ? Promise.reject(new Error("500")) : resolve(routes, publicRoutes)(url),
    );

    await expect(getMyOrders()).rejects.toThrow("500");
  });
});

describe("getPedido", () => {
  it("carrega o pedido enriquecido com evento, itens e pagamento", async () => {
    const pedido = await getPedido(paidOrder.id);

    expect(pedido.itens).toEqual([
      { id: TYPE_ID, descricao: "Ingresso Lote 1", quantidade: 2, valorUnitario: 67, eventoNome: "Calourada" },
    ]);
    expect(pedido.eventos[0].nome).toBe("Calourada");
    expect(pedido.metodoPagamento).toBe("pix");
    expect(pedido.pagoEm).toBe("2026-10-01T15:05:00Z");
    expect(pedido.ingressos).toHaveLength(2);
  });

  it("nao busca ingressos de pedido que nao esta pago", async () => {
    const pedido = await getPedido(pendingOrder.id);

    expect(pedido.ingressos).toEqual([]);
    expect(apiGet).not.toHaveBeenCalledWith("/users/me/tickets");
  });

  it("so mostra os ingressos do proprio pedido", async () => {
    routes["/users/me/tickets"] = [ticket("1"), { ...ticket("9"), orderId: "outro-pedido" }];
    apiGet.mockImplementation(resolve(routes, publicRoutes));

    const pedido = await getPedido(paidOrder.id);

    expect(pedido.ingressos.map((item) => item.id)).toEqual(["1"]);
  });


  it("rejeita quando o pedido nao existe", async () => {
    await expect(getPedido("nao-existe")).rejects.toThrow();
  });
});

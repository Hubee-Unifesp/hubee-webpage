import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGet, publicGet } = vi.hoisted(() => ({ authGet: vi.fn(), publicGet: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: authGet } }));
vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import { getMyOrders, getPedido } from "./orders";

const EVENT_ID = "e0000000-0000-4000-8000-000000000001";
const TYPE_ID = "t0000000-0000-4000-8000-000000000001";

const paidOrder = { id: "a1b2c3d4-0000-4000-8000-000000000001", userId: "u", totalAmount: 134, status: "pago", createdAt: "2026-10-01T15:00:00Z" };
const pendingOrder = { id: "f9e8d7c6-0000-4000-8000-000000000002", userId: "u", totalAmount: "67.00", status: "pendente", createdAt: "2026-10-05T15:00:00Z" };
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

const resolve = (table: Record<string, unknown>) => (url: string) =>
  url in table ? Promise.resolve({ data: table[url] }) : Promise.reject(new Error(`sem rota ${url}`));

// Cópias novas a cada teste: alguns casos trocam rotas (ex.: outros ingressos) e não podem vazar para os demais.
let routes: Record<string, unknown>;
let publicRoutes: Record<string, unknown>;

beforeEach(() => {
  routes = { ...defaultRoutes };
  publicRoutes = { ...defaultPublicRoutes };
  authGet.mockReset().mockImplementation(resolve(routes));
  publicGet.mockReset().mockImplementation(resolve(publicRoutes));
});

describe("getMyOrders", () => {
  it("monta o evento a partir dos ingressos e deixa sem evento o pedido sem ingressos", async () => {
    const [pending, paid] = await getMyOrders();

    expect(pending.eventos).toEqual([]);
    expect(pending.itens).toEqual([]);
    expect(paid.eventos).toHaveLength(1);
    expect(paid.eventos[0]).toMatchObject({
      nome: "Calourada",
      categoria: "festas",
      local: "Quadra · Santos",
      descricao: "",
    });
  });

  it("ordena do pedido mais recente para o mais antigo e converte o total para numero", async () => {
    const orders = await getMyOrders();

    expect(orders.map((order) => order.id)).toEqual([pendingOrder.id, paidOrder.id]);
    expect(orders[0].total).toBe(67);
    expect(orders[0].numero).toBe("F9E8D7C6");
  });

  it("busca cada evento uma vez, mesmo com varios ingressos", async () => {
    await getMyOrders();

    expect(publicGet.mock.calls.filter(([url]) => url === `/events/${EVENT_ID}`)).toHaveLength(1);
  });

  it("mantem a lista quando os ingressos nao carregam", async () => {
    authGet.mockImplementation((url: string) =>
      url === "/users/me/tickets" ? Promise.reject(new Error("404")) : resolve(routes)(url),
    );

    const orders = await getMyOrders();

    expect(orders).toHaveLength(2);
    expect(orders.every((order) => order.eventos.length === 0)).toBe(true);
  });

  it("mantem o pedido sem evento quando o evento nao carrega", async () => {
    publicGet.mockImplementation(() => Promise.reject(new Error("500")));

    const orders = await getMyOrders();

    const paid = orders.find((order) => order.id === paidOrder.id);

    expect(paid?.eventos).toEqual([]);
    expect(paid?.ingressos.map((item) => item.evento)).toEqual([null, null]);
  });

  it("propaga a falha da lista de pedidos", async () => {
    authGet.mockImplementation((url: string) =>
      url === "/users/me/orders" ? Promise.reject(new Error("500")) : resolve(routes)(url),
    );

    await expect(getMyOrders()).rejects.toThrow("500");
  });
});

describe("pedido com ingressos de mais de um evento", () => {
  const SHOW_ID = "e0000000-0000-4000-8000-000000000002";
  const SHOW_TYPE_ID = "t0000000-0000-4000-8000-000000000002";

  beforeEach(() => {
    routes["/users/me/tickets"] = [
      ticket("1"),
      { ...ticket("2"), eventId: SHOW_ID, ticketTypeId: SHOW_TYPE_ID },
      ticket("3"),
    ];
    publicRoutes[`/events/${SHOW_ID}`] = {
      id: SHOW_ID,
      name: "Show da Colmeia",
      description: "Rock autoral",
      venueId: "v1",
      startDate: "2026-11-07T23:00:00Z",
      endDate: "2026-11-08T03:00:00Z",
      category: "Shows",
    };
    publicRoutes[`/events/${SHOW_ID}/ticket-types`] = [{ id: SHOW_TYPE_ID, batch: "Lote 2", price: 40 }];
  });

  it("lista cada evento uma vez, na ordem dos ingressos", async () => {
    const paid = (await getMyOrders()).find((order) => order.id === paidOrder.id);

    expect(paid?.eventos.map((evento) => evento.nome)).toEqual(["Calourada", "Show da Colmeia"]);
  });

  it("liga cada ingresso e cada item ao proprio evento, nao ao primeiro", async () => {
    const pedido = await getPedido(paidOrder.id);

    expect(pedido.ingressos.map((item) => item.evento?.nome)).toEqual(["Calourada", "Show da Colmeia", "Calourada"]);
    expect(pedido.itens.map(({ descricao, quantidade, valorUnitario, eventoNome }) => ({
      descricao,
      quantidade,
      valorUnitario,
      eventoNome,
    }))).toEqual([
      { descricao: "Ingresso Lote 1", quantidade: 2, valorUnitario: 67, eventoNome: "Calourada" },
      { descricao: "Ingresso Lote 2", quantidade: 1, valorUnitario: 40, eventoNome: "Show da Colmeia" },
    ]);
  });
});

describe("getPedido", () => {
  it("agrupa os ingressos por tipo em itens, com o valor unitario do lote", async () => {
    const pedido = await getPedido(paidOrder.id);

    expect(pedido.itens).toEqual([
      { id: TYPE_ID, descricao: "Ingresso Lote 1", quantidade: 2, valorUnitario: 67, eventoNome: "Calourada" },
    ]);
    expect(pedido.ingressos.map(({ id, tipo, codigo, status }) => ({ id, tipo, codigo, status }))).toEqual([
      { id: "1", tipo: "Ingresso Lote 1", codigo: "qr-1", status: "emitido" },
      { id: "2", tipo: "Ingresso Lote 1", codigo: "qr-2", status: "usado" },
    ]);
  });

  it("nao busca ingressos de pedido que nao esta pago", async () => {
    const pedido = await getPedido(pendingOrder.id);

    expect(pedido.ingressos).toEqual([]);
    expect(authGet).not.toHaveBeenCalledWith("/users/me/tickets");
  });

  it("so mostra os ingressos do proprio pedido", async () => {
    routes["/users/me/tickets"] = [ticket("1"), { ...ticket("9"), orderId: "outro-pedido" }];
    authGet.mockImplementation(resolve(routes));

    const pedido = await getPedido(paidOrder.id);

    expect(pedido.ingressos.map((item) => item.id)).toEqual(["1"]);
  });

  it("rejeita quando o pedido nao existe", async () => {
    await expect(getPedido("nao-existe")).rejects.toThrow();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGet, publicGet } = vi.hoisted(() => ({ authGet: vi.fn(), publicGet: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: authGet } }));
vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import { getMeusIngressos } from "./tickets";

const NOW = new Date("2026-10-28T12:00:00Z");
const PAST_EVENT = "e0000000-0000-4000-8000-000000000001";
const NEXT_EVENT = "e0000000-0000-4000-8000-000000000002";
const LATER_EVENT = "e0000000-0000-4000-8000-000000000003";

const paidOrder = { id: "a1b2c3d4-0000-4000-8000-000000000001", userId: "u", totalAmount: 90, status: "pago", createdAt: "2026-10-01T15:00:00Z" };
const pendingOrder = { id: "f9e8d7c6-0000-4000-8000-000000000002", userId: "u", totalAmount: 30, status: "pendente", createdAt: "2026-10-05T15:00:00Z" };

const ticket = (id: string, eventId: string, status = "emitido") => ({
  id,
  qrCode: `qr-${id}`,
  orderId: paidOrder.id,
  eventId,
  ticketTypeId: `type-${eventId}`,
  status,
});

const event = (id: string, startDate: string, endDate: string) => ({
  id,
  name: `Evento ${id.slice(-1)}`,
  description: null,
  organizerId: "o",
  venueId: "v",
  startDate,
  endDate,
  category: "Festas",
  featured: false,
});

const authRoutes: Record<string, unknown> = {
  "/users/me/orders": [pendingOrder, paidOrder],
  [`/orders/${paidOrder.id}/tickets`]: [
    ticket("1", PAST_EVENT),
    ticket("2", LATER_EVENT),
    ticket("3", NEXT_EVENT),
    ticket("4", NEXT_EVENT, "cancelado"),
  ],
};

const publicRoutes: Record<string, unknown> = {
  [`/events/${PAST_EVENT}`]: event(PAST_EVENT, "2026-10-01T23:00:00Z", "2026-10-02T05:00:00Z"),
  [`/events/${NEXT_EVENT}`]: event(NEXT_EVENT, "2026-11-01T23:00:00Z", "2026-11-02T05:00:00Z"),
  [`/events/${LATER_EVENT}`]: event(LATER_EVENT, "2026-12-01T23:00:00Z", "2026-12-02T05:00:00Z"),
  "/venues/v": { id: "v", name: "Arena", address: { city: "São Paulo" } },
  ...Object.fromEntries(
    [PAST_EVENT, NEXT_EVENT, LATER_EVENT].map((id) => [
      `/events/${id}/ticket-types`,
      [{ id: `type-${id}`, batch: "Lote 1", price: "30.00" }],
    ]),
  ),
};

const resolve = (routes: Record<string, unknown>) => (url: string) =>
  url in routes ? Promise.resolve({ data: routes[url] }) : Promise.reject(new Error(`404 ${url}`));

describe("getMeusIngressos", () => {
  beforeEach(() => {
    authGet.mockReset().mockImplementation(resolve(authRoutes));
    publicGet.mockReset().mockImplementation(resolve(publicRoutes));
  });

  it("busca os ingressos só dos pedidos pagos", async () => {
    await getMeusIngressos(NOW);

    expect(authGet).toHaveBeenCalledWith(`/orders/${paidOrder.id}/tickets`);
    expect(authGet).not.toHaveBeenCalledWith(`/orders/${pendingOrder.id}/tickets`);
  });

  it("separa próximos e anteriores, ordenando pela data do evento", async () => {
    const { proximos, anteriores } = await getMeusIngressos(NOW);

    expect(proximos.map(({ id }) => id)).toEqual(["3", "2"]);
    // Cancelado vai para anteriores mesmo com o evento por vir.
    expect(anteriores.map(({ id }) => id)).toEqual(["4", "1"]);
  });

  it("monta o ingresso com evento, tipo, valor e pedido", async () => {
    const { proximos } = await getMeusIngressos(NOW);

    expect(proximos[0]).toMatchObject({
      codigo: "qr-3",
      status: "emitido",
      tipo: "Ingresso Lote 1",
      valor: 30,
      pedidoId: paidOrder.id,
      pedidoNumero: "A1B2C3D4",
      evento: { id: NEXT_EVENT, categoria: "festas", local: "Arena · São Paulo" },
    });
  });

  it("mantém o ingresso sem evento nos próximos, no fim da lista", async () => {
    publicGet.mockImplementation((url: string) =>
      url === `/events/${LATER_EVENT}` ? Promise.reject(new Error("500")) : resolve(publicRoutes)(url),
    );

    const { proximos } = await getMeusIngressos(NOW);

    expect(proximos.map(({ id }) => id)).toEqual(["3", "2"]);
    expect(proximos[1].evento).toBeNull();
  });

  it("rejeita quando os ingressos de um pedido não carregam", async () => {
    authGet.mockImplementation((url: string) =>
      url.endsWith("/tickets") ? Promise.reject(new Error("500")) : resolve(authRoutes)(url),
    );

    await expect(getMeusIngressos(NOW)).rejects.toThrow("500");
  });
});

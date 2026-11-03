import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGet, publicGet } = vi.hoisted(() => ({ authGet: vi.fn(), publicGet: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: authGet } }));
vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import { getMeusIngressos } from "./tickets";

const NOW = new Date("2026-10-28T12:00:00Z");
const PAST_EVENT = "e0000000-0000-4000-8000-000000000001";
const NEXT_EVENT = "e0000000-0000-4000-8000-000000000002";
const LATER_EVENT = "e0000000-0000-4000-8000-000000000003";
const ORDER_ID = "a1b2c3d4-0000-4000-8000-000000000001";

const eventoAninhado = (id: string, startDate: string, endDate: string) => ({
  id,
  name: `Evento ${id.slice(-1)}`,
  startDate,
  endDate,
  photoUrl: null,
  venue: { id: "v", name: "Arena", address: { city: "São Paulo" } },
});

const ticket = (id: string, eventId: string, startDate: string, endDate: string, status = "emitido") => ({
  id,
  qrCode: `qr-${id}`,
  orderId: ORDER_ID,
  eventId,
  ticketTypeId: `type-${eventId}`,
  status,
  event: eventoAninhado(eventId, startDate, endDate),
  ticketType: { id: `type-${eventId}`, batch: "Lote 1", price: "30.00" },
});

const meusIngressos = [
  ticket("1", PAST_EVENT, "2026-10-01T23:00:00Z", "2026-10-02T05:00:00Z"),
  ticket("2", LATER_EVENT, "2026-12-01T23:00:00Z", "2026-12-02T05:00:00Z"),
  ticket("3", NEXT_EVENT, "2026-11-01T23:00:00Z", "2026-11-02T05:00:00Z"),
  ticket("4", NEXT_EVENT, "2026-11-01T23:00:00Z", "2026-11-02T05:00:00Z", "cancelado"),
];

const publicRoutes: Record<string, unknown> = Object.fromEntries(
  [PAST_EVENT, NEXT_EVENT, LATER_EVENT].map((id) => [
    `/events/${id}`,
    { id, name: `Evento ${id.slice(-1)}`, description: "Noite boa", category: "Festas" },
  ]),
);

const resolve = (routes: Record<string, unknown>) => (url: string) =>
  url in routes ? Promise.resolve({ data: routes[url] }) : Promise.reject(new Error(`404 ${url}`));

describe("getMeusIngressos", () => {
  beforeEach(() => {
    authGet.mockReset().mockImplementation((url: string) =>
      url === "/users/me/tickets"
        ? Promise.resolve({ data: meusIngressos })
        : Promise.reject(new Error(`404 ${url}`)),
    );
    publicGet.mockReset().mockImplementation(resolve(publicRoutes));
  });

  it("busca os ingressos na rota do usuario, sem passar pelos pedidos", async () => {
    await getMeusIngressos(NOW);

    expect(authGet).toHaveBeenCalledWith("/users/me/tickets");
    expect(authGet).toHaveBeenCalledTimes(1);
    expect(authGet.mock.calls.every(([url]) => !String(url).includes("/orders"))).toBe(true);
  });

  it("separa proximos e anteriores, ordenando pela data do evento", async () => {
    const { proximos, anteriores } = await getMeusIngressos(NOW);

    expect(proximos.map(({ id }) => id)).toEqual(["3", "2"]);
    // Cancelado vai para anteriores mesmo com o evento por vir.
    expect(anteriores.map(({ id }) => id)).toEqual(["4", "1"]);
  });

  it("monta o ingresso com evento, local, tipo, valor e pedido", async () => {
    const { proximos } = await getMeusIngressos(NOW);

    expect(proximos[0]).toMatchObject({
      codigo: "qr-3",
      status: "emitido",
      tipo: "Ingresso Lote 1",
      valor: 30,
      pedidoId: ORDER_ID,
      pedidoNumero: "A1B2C3D4",
      evento: {
        id: NEXT_EVENT,
        categoria: "festas",
        descricao: "Noite boa",
        local: "Arena · São Paulo",
      },
    });
  });

  it("busca cada evento uma vez, mesmo com varios ingressos do mesmo evento", async () => {
    await getMeusIngressos(NOW);

    expect(publicGet.mock.calls.filter(([url]) => url === `/events/${NEXT_EVENT}`)).toHaveLength(1);
  });

  it("mantem o ingresso utilizavel quando a categoria do evento nao carrega", async () => {
    publicGet.mockImplementation(() => Promise.reject(new Error("500")));

    const { proximos } = await getMeusIngressos(NOW);

    expect(proximos.map(({ id }) => id)).toEqual(["3", "2"]);
    // O evento continua vindo aninhado no ingresso: só a categoria cai no padrão.
    expect(proximos[0].evento).toMatchObject({ local: "Arena · São Paulo", categoria: "outros" });
  });

  it("usa so o nome do local quando a cidade nao vem", async () => {
    authGet.mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            ...ticket("5", NEXT_EVENT, "2026-11-01T23:00:00Z", "2026-11-02T05:00:00Z"),
            event: {
              ...eventoAninhado(NEXT_EVENT, "2026-11-01T23:00:00Z", "2026-11-02T05:00:00Z"),
              venue: { id: "v", name: "Arena", address: null },
            },
          },
        ],
      }),
    );

    const { proximos } = await getMeusIngressos(NOW);

    expect(proximos[0].evento?.local).toBe("Arena");
  });

  it("propaga a falha quando a lista de ingressos nao carrega", async () => {
    authGet.mockImplementation(() => Promise.reject(new Error("500")));

    await expect(getMeusIngressos(NOW)).rejects.toThrow("500");
  });
});

import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { publicGet } = vi.hoisted(() => ({ publicGet: vi.fn() }));

vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import { formatFilterDateRange } from "@/components/home/events/active-filter-chips";
import {
  filterEvents,
  hasActiveModalFilters,
  INITIAL_FILTERS,
} from "@/components/home/events/event-search-bar";
import { organizerHref } from "@/components/home/events/links";
import {
  buildEventQueryParams,
  getEventById,
  getHomeEvents,
  isSoldOut,
  searchEvents,
  soldRatio,
  toAgeRating,
  toCategory,
  type EventSummary,
} from "./events";
import type {
  ApiEventDetail,
  ApiEventPage,
  ApiEventSummary,
} from "./events.types";

const EVENT_ID = "8f1c2a4e-6b3d-4e5f-9a7b-1c2d3e4f5a6b";

const apiEventDetailFixture: ApiEventDetail = {
  id: EVENT_ID,
  name: "Entre acordes e encontros",
  edition: "Uma noite de jazz, soul e afeto",
  description: "Show intimista em São Paulo.\n\nAbertura às 19h.",
  category: "Shows",
  ageRating: "18",
  organizerId: "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
  venueId: "3b7e9d21-4c5a-4f6b-8e7d-2a1b3c4d5e6f",
  startDate: "2026-11-21T23:00:00.000Z",
  endDate: "2026-11-22T03:00:00.000Z",
  photoUrl: null,
  featured: true,
  venue: {
    id: "3b7e9d21-4c5a-4f6b-8e7d-2a1b3c4d5e6f",
    name: "Casa Natura Musical",
    maxCapacity: 500,
    address: {
      street: "Rua Artur de Azevedo",
      number: "2134",
      complement: null,
      neighborhood: "Pinheiros",
      city: "São Paulo",
      state: "SP",
      zipCode: "05404005",
    },
  },
  organization: {
    id: "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
    name: "Coletivo Entro",
    description: "Música que aproxima.",
  },
  ticketTypes: [
    {
      id: "a1b2c3d4-0001-4a5b-8c6d-7e8f9a0b1c2d",
      batch: "1º Lote",
      price: "60.00",
      quantity: 0,
    },
    {
      id: "a1b2c3d4-0002-4a5b-8c6d-7e8f9a0b1c2d",
      batch: "2º Lote",
      price: 80,
      quantity: 120,
    },
  ],
};

function makeAxiosError(status: number, message = "Erro"): AxiosError {
  return new AxiosError(
    message,
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: message,
      headers: {},
      config: {} as AxiosResponse["config"],
      data: { statusCode: status, message },
    },
  );
}

beforeEach(() => {
  publicGet.mockReset();
});

describe("getEventById", () => {
  it("mapeia os dados do endpoint GET /events/:id para EventDetails", async () => {
    publicGet.mockResolvedValueOnce({ data: apiEventDetailFixture });

    const result = await getEventById(EVENT_ID);

    expect(publicGet).toHaveBeenCalledWith(`/events/${EVENT_ID}`);
    expect(result).toEqual({
      id: EVENT_ID,
      title: "Entre acordes e encontros",
      tagline: "Uma noite de jazz, soul e afeto",
      description: "Show intimista em São Paulo.\n\nAbertura às 19h.",
      category: "shows",
      ageRating: "18",
      startDate: "2026-11-21T23:00:00.000Z",
      endDate: "2026-11-22T03:00:00.000Z",
      photoUrl: null,
      venue: {
        id: "3b7e9d21-4c5a-4f6b-8e7d-2a1b3c4d5e6f",
        name: "Casa Natura Musical",
        address: {
          street: "Rua Artur de Azevedo",
          number: "2134",
          complement: null,
          neighborhood: "Pinheiros",
          city: "São Paulo",
          state: "SP",
          zipCode: "05404005",
        },
      },
      organizer: {
        id: "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
        name: "Coletivo Entro",
        description: "Música que aproxima.",
      },
      ticketTypes: [
        {
          id: "a1b2c3d4-0001-4a5b-8c6d-7e8f9a0b1c2d",
          batch: "1º Lote",
          price: 60,
          soldOut: true,
        },
        {
          id: "a1b2c3d4-0002-4a5b-8c6d-7e8f9a0b1c2d",
          batch: "2º Lote",
          price: 80,
          soldOut: false,
        },
      ],
    });
  });

  it("retorna null quando a API responde 404 (evento inexistente ou nao publicado)", async () => {
    publicGet.mockRejectedValueOnce(makeAxiosError(404, "Evento não encontrado"));

    await expect(getEventById(EVENT_ID)).resolves.toBeNull();
  });

  it("retorna null quando a API responde 400 (UUID invalido na rota)", async () => {
    publicGet.mockRejectedValueOnce(makeAxiosError(400, "Validation failed (uuid is expected)"));

    await expect(getEventById("id-invalido")).resolves.toBeNull();
  });

  it("retorna null para id vazio sem chamar a API", async () => {
    await expect(getEventById("   ")).resolves.toBeNull();
    expect(publicGet).not.toHaveBeenCalled();
  });

  it("propaga erros inesperados da API (ex.: 500)", async () => {
    publicGet.mockRejectedValueOnce(makeAxiosError(500, "Internal Server Error"));

    await expect(getEventById(EVENT_ID)).rejects.toThrow();
  });
});

describe("getHomeEvents", () => {
  it("monta as vitrines da Home a partir de GET /events/summary", async () => {
    const summaries: ApiEventSummary[] = [
      {
        id: EVENT_ID,
        name: "Entre acordes e encontros",
        description: "Noite de jazz",
        category: "Shows",
        startDate: "2026-10-28T23:00:00.000Z",
        endDate: "2026-10-29T03:00:00.000Z",
        featured: true,
        organizerName: "Coletivo Entro",
        venueName: "Casa Natura Musical",
        venueCity: "São Paulo",
        minPrice: 60,
        minPriceBatch: "1º Lote",
        capacity: 100,
        ticketsSold: 85,
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Palestra de IA",
        description: null,
        category: "Palestras",
        startDate: "2026-11-10T18:00:00.000Z",
        endDate: "2026-11-10T21:00:00.000Z",
        featured: false,
        organizerName: "DAComp",
        venueName: "Auditório Unifesp",
        venueCity: "São José dos Campos",
        minPrice: 0,
        minPriceBatch: "Gratuito",
        capacity: 200,
        ticketsSold: 50,
      },
    ];
    publicGet.mockResolvedValueOnce({ data: summaries });

    const home = await getHomeEvents(new Date("2026-10-26T15:00:00.000Z"));

    expect(publicGet).toHaveBeenCalledWith("/events/summary");
    expect(home.featured).toHaveLength(1);
    expect(home.featured[0]).toMatchObject({
      id: EVENT_ID,
      title: "Entre acordes e encontros",
      venueName: "Casa Natura Musical · São Paulo",
      price: 60,
      batchLabel: "1º Lote",
    });
    expect(home.thisWeek.events.map((e) => e.id)).toEqual([EVENT_ID]);
    expect(home.sellingOut.map((e) => e.id)).toEqual([EVENT_ID]);
    expect(home.free.map((e) => e.id)).toEqual(["22222222-2222-4222-8222-222222222222"]);
  });
});

describe("searchEvents (GOL-135)", () => {
  it("monta query params e consulta GET /events com filtros de busca, categoria, cidade e data", async () => {
    const pageResponse: ApiEventPage = {
      data: [
        {
          id: EVENT_ID,
          name: "Cervejada da Bateria",
          description: "Festa universitária",
          organizerId: "org-1",
          venueId: "venue-1",
          startDate: "2026-10-30T17:00:00.000Z",
          endDate: "2026-10-31T02:00:00.000Z",
          category: "Festas",
          featured: true,
          venueName: "Arena Unifesp",
          venueCity: "São José dos Campos",
          minPrice: "35.00",
          minPriceBatch: "1º Lote",
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    };
    publicGet.mockResolvedValueOnce({ data: pageResponse });

    const fallback: EventSummary[] = [
      {
        id: EVENT_ID,
        title: "Cervejada da Bateria",
        category: "festas",
        organizerName: "Atlética Bateria SJC",
        venueName: "Arena Unifesp · São José dos Campos",
        startDate: "2026-10-30T17:00:00.000Z",
        endDate: "2026-10-31T02:00:00.000Z",
        price: 35,
        capacity: 500,
        ticketsSold: 420,
      },
    ];

    const startDate = new Date(2026, 9, 30);
    const endDate = new Date(2026, 9, 31);

    expect(
      buildEventQueryParams({
        search: " Cervejada ",
        categories: ["festas"],
        city: "São José dos Campos",
        startDate,
        endDate,
      }),
    ).toEqual({
      limit: 100,
      search: "Cervejada",
      category: "Festas",
      city: "São José dos Campos",
      startDate: "2026-10-30",
      endDate: "2026-10-31",
    });

    const results = await searchEvents(
      {
        search: "Cervejada",
        categories: ["festas"],
        city: "São José dos Campos",
        startDate,
        endDate,
      },
      fallback,
    );

    expect(publicGet).toHaveBeenCalledWith("/events", {
      params: {
        limit: 100,
        search: "Cervejada",
        category: "Festas",
        city: "São José dos Campos",
        startDate: "2026-10-30",
        endDate: "2026-10-31",
      },
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: EVENT_ID,
      title: "Cervejada da Bateria",
      organizerName: "Atlética Bateria SJC",
      venueName: "Arena Unifesp · São José dos Campos",
      price: 35,
    });
  });
});

describe("helpers de eventos e filtros", () => {
  it("normaliza categorias e classificacoes indicativas", () => {
    expect(toCategory("Acadêmicos")).toBe("academicos");
    expect(toCategory("Desconhecida")).toBe("outros");
    expect(toAgeRating("18")).toBe("18");
    expect(toAgeRating("l")).toBe("L");
    expect(toAgeRating("invalido")).toBeNull();
  });

  it("calcula isSoldOut e soldRatio corretamente", () => {
    const base = {
      id: "1",
      title: "Teste",
      category: "outros" as const,
      organizerName: "Org",
      venueName: "Local",
      startDate: "2026-11-01T00:00:00Z",
      endDate: "2026-11-01T02:00:00Z",
      price: 10,
      capacity: 100,
      ticketsSold: 100,
    };

    expect(isSoldOut(base)).toBe(true);
    expect(soldRatio(base)).toBe(1);
    expect(isSoldOut({ ...base, capacity: null })).toBe(false);
    expect(soldRatio({ ...base, capacity: 0 })).toBe(0);
  });

  it("filtra eventos por busca, categorias, cidade e intervalo de data", () => {
    const events: EventSummary[] = [
      {
        id: "1",
        title: "Cervejada da Bateria",
        category: "festas",
        organizerName: "Atlética Bateria SJC",
        venueName: "Arena Unifesp · São José dos Campos",
        startDate: "2026-10-30T15:00:00.000Z",
        endDate: "2026-10-30T22:00:00.000Z",
        price: 35,
        capacity: 500,
        ticketsSold: 420,
      },
      {
        id: "2",
        title: "Simpósio de Computação",
        category: "academicos",
        organizerName: "DAComp Unifesp",
        venueName: "Auditório · São Paulo",
        startDate: "2026-11-15T15:00:00.000Z",
        endDate: "2026-11-15T19:00:00.000Z",
        price: 0,
        capacity: 300,
        ticketsSold: 120,
      },
    ];

    expect(hasActiveModalFilters(INITIAL_FILTERS)).toBe(false);
    expect(
      hasActiveModalFilters({ ...INITIAL_FILTERS, city: "São Paulo" }),
    ).toBe(true);

    expect(
      filterEvents(events, "bateria", INITIAL_FILTERS).map((e) => e.id),
    ).toEqual(["1"]);
    expect(
      filterEvents(events, "", {
        ...INITIAL_FILTERS,
        categories: ["academicos"],
      }).map((e) => e.id),
    ).toEqual(["2"]);
    expect(
      filterEvents(events, "", {
        ...INITIAL_FILTERS,
        city: "São Paulo",
      }).map((e) => e.id),
    ).toEqual(["2"]);
    expect(
      filterEvents(events, "", {
        ...INITIAL_FILTERS,
        dateRange: { start: new Date(2026, 9, 30), end: null },
      }).map((e) => e.id),
    ).toEqual(["1"]);

    expect(organizerHref("Atlética Bateria SJC")).toBe(
      "/eventos?q=Atl%C3%A9tica%20Bateria%20SJC",
    );
    expect(
      formatFilterDateRange(new Date(2026, 9, 15), new Date(2026, 9, 20)),
    ).toContain("–");
  });
});

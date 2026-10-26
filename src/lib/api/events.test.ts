import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { publicGet } = vi.hoisted(() => ({ publicGet: vi.fn() }));

vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import {
  getEventById,
  getHomeEvents,
  isSoldOut,
  soldRatio,
  toAgeRating,
  toCategory,
} from "./events";
import type { ApiEventDetail, ApiEventSummary } from "./events.types";

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

describe("helpers de eventos", () => {
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
});

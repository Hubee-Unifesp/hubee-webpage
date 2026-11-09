import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import type {
  AtualizacaoEventoPayload,
  EventoEditavel,
  EventoPayload,
  LocalEvento,
  LocalPayload,
} from "@/types/evento-editor";


const MOCK_DELAY_MS = 600;

export const MOCK_ORGANIZER_ID = "mock-organizacao";

const locaisMock: LocalEvento[] = [
  { id: "mock-local-centro", nome: "Centro de Convenções Hubee", capacidade: 2000 },
  { id: "mock-local-arena", nome: "Espaço Hubee Arena", capacidade: 5000 },
  { id: "mock-local-teatro", nome: "Teatro Hubee", capacidade: 800 },
];

const eventosMock = new Map<string, EventoEditavel>(
  [
    {
      id: "mock-evento-rascunho",
      organizerId: MOCK_ORGANIZER_ID,
      status: "draft" as const,
      name: "Hubee Tech Summit",
      description: "Um dia de palestras e oficinas sobre tecnologia e carreira.",
      category: "palestras" as const,
      edition: "3ª edição",
      ageRating: "L" as const,
      photoUrl: null,
      startDate: "2027-03-20T12:00:00.000Z",
      endDate: "2027-03-20T21:00:00.000Z",
      salesStartDate: "2026-12-01T13:00:00.000Z",
      venueId: "mock-local-centro",
      lotes: [
        { id: "mock-lote-1", batch: "Early Bird", price: 250, quantity: 300 },
        { id: "mock-lote-2", batch: "1º Lote", price: 350, quantity: 900 },
        { id: "mock-lote-3", batch: "Estudante", price: 120, quantity: 400 },
      ],
    },
    {
      id: "mock-evento-publicado",
      organizerId: MOCK_ORGANIZER_ID,
      status: "published" as const,
      name: "Stand-up Hubee: Noite de Comédia",
      description: "Uma noite com os melhores comediantes da cena independente.",
      category: "shows" as const,
      edition: null,
      ageRating: "16" as const,
      photoUrl: null,
      startDate: "2026-12-12T23:00:00.000Z",
      endDate: "2026-12-13T01:30:00.000Z",
      salesStartDate: "2026-10-15T13:00:00.000Z",
      venueId: "mock-local-teatro",
      lotes: [
        { id: "mock-lote-4", batch: "Lote Único - Inteira", price: 80, quantity: 600 },
        { id: "mock-lote-5", batch: "Lote Único - Meia", price: 40, quantity: 200 },
      ],
    },
  ].map((evento) => [evento.id, evento]),
);

function wait(ms = MOCK_DELAY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function notFound(message: string): AxiosError {
  const response = {
    status: 404,
    statusText: "Not Found",
    data: { statusCode: 404, message },
    headers: {},
    config: { headers: new AxiosHeaders() },
  } satisfies AxiosResponse;
  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, response.config, undefined, response);
}

function buscarEvento(id: string): EventoEditavel {
  const evento = eventosMock.get(id);
  if (!evento) throw notFound("Evento não encontrado");
  return evento;
}

function salvarEvento(evento: EventoEditavel): EventoEditavel {
  eventosMock.set(evento.id, evento);
  return structuredClone(evento);
}

export async function getEventoEditavel(id: string): Promise<EventoEditavel> {
  await wait();
  return structuredClone(buscarEvento(id));
}

export async function getLocais(): Promise<LocalEvento[]> {
  await wait();
  return locaisMock.map((local) => ({ ...local }));
}

export async function createLocal(payload: LocalPayload): Promise<LocalEvento> {
  await wait();
  const local: LocalEvento = { id: crypto.randomUUID(), nome: payload.name, capacidade: payload.maxCapacity };
  locaisMock.push(local);
  return { ...local };
}

export async function createEvento(payload: EventoPayload): Promise<EventoEditavel> {
  await wait();
  return salvarEvento({
    id: crypto.randomUUID(),
    organizerId: payload.organizerId,
    status: "draft",
    name: payload.name,
    description: payload.description ?? null,
    category: payload.category ?? null,
    edition: payload.edition ?? null,
    ageRating: payload.ageRating ?? null,
    photoUrl: null,
    startDate: payload.startDate,
    endDate: payload.endDate,
    salesStartDate: payload.salesStartDate ?? null,
    venueId: payload.venueId,
    lotes: [],
  });
}

export async function updateEvento(id: string, payload: AtualizacaoEventoPayload): Promise<EventoEditavel> {
  await wait();
  return salvarEvento({ ...buscarEvento(id), ...payload });
}

export async function uploadCapaEvento(id: string, file: File): Promise<EventoEditavel> {
  await wait();
  return salvarEvento({ ...buscarEvento(id), photoUrl: URL.createObjectURL(file) });
}

export function publicarEvento(id: string): Promise<EventoEditavel> {
  return updateEvento(id, { status: "published" });
}

export async function cancelarEvento(id: string): Promise<void> {
  await wait();
  eventosMock.set(id, { ...buscarEvento(id), status: "cancelled" });
}

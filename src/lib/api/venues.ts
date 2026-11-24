import { apiClient } from "./apiClient";
import type { LocalEvento, LocalPayload } from "@/types/evento-editor";

/** Local como a `hubee-api` devolve (`VenueResponseDto`), só com o que o editor usa. */
export interface ApiVenue {
  id: string;
  name: string;
  maxCapacity: number;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
}

export interface LocalComEndereco extends LocalEvento {
  rua: string | null;
  numero: string | null;
  cidade: string | null;
  uf: string | null;
}

export function toLocalEvento(venue: ApiVenue): LocalEvento {
  return { id: venue.id, nome: venue.name, capacidade: venue.maxCapacity };
}

/** `GET /venues` é público: lista os locais disponíveis para o evento. */
export async function getLocais(): Promise<LocalEvento[]> {
  const { data } = await apiClient.get<ApiVenue[]>("/venues");
  return data.map(toLocalEvento);
}

export async function getLocaisComEndereco(): Promise<LocalComEndereco[]> {
  const { data } = await apiClient.get<ApiVenue[]>("/venues");
  return data.map((venue) => ({
    ...toLocalEvento(venue),
    rua: venue.address?.street ?? null,
    numero: venue.address?.number ?? null,
    cidade: venue.address?.city ?? null,
    uf: venue.address?.state ?? null,
  }));
}

/** `POST /venues`: ADMIN ou membro com `write` em alguma organização. */
export async function createLocal(payload: LocalPayload): Promise<LocalEvento> {
  const { data } = await apiClient.post<ApiVenue>("/venues", payload);
  return toLocalEvento(data);
}

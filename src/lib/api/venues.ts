import { apiClient } from "./apiClient";
import type { LocalEvento, LocalPayload } from "@/types/evento-editor";

/** Local como a `hubee-api` devolve (`VenueResponseDto`), só com o que o editor usa. */
export interface ApiVenue {
  id: string;
  name: string;
  maxCapacity: number;
}

export function toLocalEvento(venue: ApiVenue): LocalEvento {
  return { id: venue.id, nome: venue.name, capacidade: venue.maxCapacity };
}

/** `GET /venues` é público: lista os locais disponíveis para o evento. */
export async function getLocais(): Promise<LocalEvento[]> {
  const { data } = await apiClient.get<ApiVenue[]>("/venues");
  return data.map(toLocalEvento);
}

/** `POST /venues`: ADMIN ou membro com `write` em alguma organização. */
export async function createLocal(payload: LocalPayload): Promise<LocalEvento> {
  const { data } = await apiClient.post<ApiVenue>("/venues", payload);
  return toLocalEvento(data);
}

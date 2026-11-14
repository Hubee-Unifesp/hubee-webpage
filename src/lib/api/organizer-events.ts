import { apiClient } from "./apiClient";
import { toCategory } from "./events";
import { toLoteIngresso, type ApiLote } from "./ticket-types";
import type { AgeRating } from "./events.types";
import type { AtualizacaoEventoPayload, EventoEditavel, EventoPayload } from "@/types/evento-editor";
import type { StatusEvento } from "@/types/organizacao";

/** Evento como a `hubee-api` devolve em create/update (`EventResponseDto`). */
export interface ApiEventoOrganizador {
  id: string;
  organizerId: string;
  venueId: string;
  status: StatusEvento;
  name: string;
  description: string | null;
  category: string | null;
  edition: string | null;
  ageRating: AgeRating | null;
  photoUrl: string | null;
  startDate: string;
  endDate: string;
  salesStartDate: string | null;
  /** Só vem em `GET /events/:id` (`EventDetailResponseDto`). */
  ticketTypes?: ApiLote[];
}

/** `lotes` é passado à parte quando a resposta não traz os lotes (create/update). */
export function toEventoEditavel(evento: ApiEventoOrganizador, lotes?: EventoEditavel["lotes"]): EventoEditavel {
  return {
    id: evento.id,
    organizerId: evento.organizerId,
    status: evento.status,
    name: evento.name,
    description: evento.description ?? null,
    category: evento.category ? toCategory(evento.category) : null,
    edition: evento.edition ?? null,
    ageRating: evento.ageRating ?? null,
    photoUrl: evento.photoUrl ?? null,
    startDate: evento.startDate,
    endDate: evento.endDate,
    salesStartDate: evento.salesStartDate ?? null,
    venueId: evento.venueId,
    lotes: lotes ?? (evento.ticketTypes ?? []).map(toLoteIngresso),
  };
}

/** Rascunho só aparece para ADMIN e membros da organização, por isso vai com o token. */
export async function getEventoEditavel(id: string): Promise<EventoEditavel> {
  const { data } = await apiClient.get<ApiEventoOrganizador>(`/events/${id}`);
  return toEventoEditavel(data);
}

/** `POST /events`: o evento nasce como rascunho e sem lotes. */
export async function createEvento(payload: EventoPayload): Promise<EventoEditavel> {
  const { data } = await apiClient.post<ApiEventoOrganizador>("/events", payload);
  return toEventoEditavel(data, []);
}

/**
 * `PATCH /events/:id`. A resposta não traz os lotes, então quem chama mantém os que já tem.
 * Campo omitido não muda; `null` apaga o valor gravado.
 */
export async function updateEvento(
  id: string,
  payload: AtualizacaoEventoPayload,
  lotes: EventoEditavel["lotes"],
): Promise<EventoEditavel> {
  const { data } = await apiClient.patch<ApiEventoOrganizador>(`/events/${id}`, payload);
  return toEventoEditavel(data, lotes);
}

/** `PATCH /events/:id/photo` (multipart, campo `file`). */
export async function uploadCapaEvento(
  id: string,
  file: File,
  lotes: EventoEditavel["lotes"],
): Promise<EventoEditavel> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.patch<ApiEventoOrganizador>(`/events/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return toEventoEditavel(data, lotes);
}

/** A API recusa (422) publicar evento sem lotes. */
export function publicarEvento(id: string, lotes: EventoEditavel["lotes"]): Promise<EventoEditavel> {
  return updateEvento(id, { status: "published" }, lotes);
}

/** `DELETE /events/:id`: só ADMIN e administradores da organização (`manage`). */
export async function cancelarEvento(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

/** `POST /events/:id/duplicate`: cópia em rascunho com os mesmos lotes, sem vendas nem capa. */
export async function duplicarEvento(id: string): Promise<EventoEditavel> {
  const { data } = await apiClient.post<ApiEventoOrganizador>(`/events/${id}/duplicate`);
  return toEventoEditavel(data);
}

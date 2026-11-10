import type { AgeRating, EventCategory } from "@/lib/api/events.types";
import type { LoteIngresso } from "@/types/lote-ingresso";
import type { StatusEvento } from "@/types/organizacao";

export interface LocalEvento {
  id: string;
  nome: string;
  capacidade: number;
}

export interface LocalPayload {
  name: string;
  maxCapacity: number;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

/** Lote do evento: fonte única para o painel de ingressos, a Revisão e a checagem de capacidade. */
export type LoteEvento = LoteIngresso;

export interface EventoEditavel {
  id: string;
  organizerId: string;
  status: StatusEvento;
  name: string;
  description: string | null;
  category: EventCategory | null;
  edition: string | null;
  ageRating: AgeRating | null;
  photoUrl: string | null;
  startDate: string;
  endDate: string;
  salesStartDate: string | null;
  venueId: string;
  lotes: LoteEvento[];
}

export interface EventoPayload {
  name: string;
  organizerId: string;
  venueId: string;
  startDate: string;
  endDate: string;
  /** `null` apaga o valor na edição (o `PATCH` mantém o que não vem no corpo). */
  salesStartDate?: string | null;
  description?: string | null;
  category?: EventCategory | null;
  edition?: string | null;
  ageRating?: AgeRating | null;
}

export type AtualizacaoEventoPayload = Partial<Omit<EventoPayload, "organizerId">> & { status?: StatusEvento };

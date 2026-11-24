import type { AgeRating, EventCategory } from "@/lib/api/events.types";
import type { ModalidadeLote } from "@/types/lote-ingresso";

export const ASSISTANT_FIELDS = [
  "name",
  "start",
  "end",
  "venue",
  "ticketTypes",
  "salesStart",
  "category",
  "ageRating",
  "description",
] as const;

export type AssistantField = (typeof ASSISTANT_FIELDS)[number];

export const ASSISTANT_ANSWER_MAX_LENGTH = 2000;

export interface AssistantVenue {
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

export interface AssistantTicketType {
  batch: string;
  price: number | null;
  quantity: number | null;
  modality: ModalidadeLote | null;
}

export interface AssistantDraft {
  name: string | null;
  description: string | null;
  category: EventCategory | null;
  ageRating: AgeRating | null;
  edition: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  salesStartDate: string | null;
  salesStartTime: string | null;
  venue: AssistantVenue | null;
  ticketTypes: AssistantTicketType[];
  skipped: AssistantField[];
}

export interface AssistantQuestion {
  field: AssistantField;
  text: string;
  skippable: boolean;
}

export interface AssistantTurnRequest {
  draft?: AssistantDraft;
  field?: AssistantField;
  answer?: string;
  skip?: boolean;
}

export interface AssistantTurnResponse {
  draft: AssistantDraft;
  reply: string | null;
  question: AssistantQuestion | null;
  missingRequired: AssistantField[];
  done: boolean;
}

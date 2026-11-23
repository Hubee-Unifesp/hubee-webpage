import { z } from "zod";
import type { AgeRating, EventCategory } from "@/lib/api/events.types";
import type { ModalidadeLote } from "@/types/lote-ingresso";
import { toDateTimeLocal, type EventFormInputs } from "./event.schema";

export const AI_DRAFT_PROMPT_MIN_LENGTH = 10;
export const AI_DRAFT_PROMPT_MAX_LENGTH = 500;

/**
 * Campos que a `hubee-api` pode listar em `missingFields` (`EventAiDraftResponseDto`).
 * Espelha `EVENT_AI_DRAFT_FIELDS` da `hubee-api`.
 */
export const EVENT_AI_DRAFT_FIELDS = [
  "name",
  "description",
  "category",
  "ageRating",
  "edition",
  "startDate",
  "endDate",
  "venueSuggestion",
  "suggestedTicketTypes",
] as const;

export type EventAiDraftField = (typeof EVENT_AI_DRAFT_FIELDS)[number];

export interface VenueSuggestion {
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

export interface SuggestedTicketType {
  batch: string;
  price: number | null;
  quantity: number | null;
  modality: ModalidadeLote | null;
}

/** Rascunho estruturado retornado por `POST /events/ai-draft` (`EventAiDraftResponseDto`). */
export interface EventAiDraft {
  name: string | null;
  description: string | null;
  category: EventCategory | null;
  ageRating: AgeRating | null;
  edition: string | null;
  startDate: string | null;
  endDate: string | null;
  venueSuggestion: VenueSuggestion | null;
  suggestedTicketTypes: SuggestedTicketType[];
  missingFields: EventAiDraftField[];
}

export interface EventAiDraftFieldMeta {
  label: string;
  inputId: string;
  obrigatorio?: boolean;
}

/** Metadados visuais e âncoras DOM de cada campo da Etapa 1 para sinalização e foco em `missingFields`. */
export const EVENT_AI_DRAFT_FIELD_META: Record<EventAiDraftField, EventAiDraftFieldMeta> = {
  name: { label: "Nome do evento", inputId: "evento-nome", obrigatorio: true },
  category: { label: "Categoria", inputId: "evento-categoria" },
  edition: { label: "Edição", inputId: "evento-edicao" },
  ageRating: { label: "Classificação indicativa", inputId: "evento-classificacao" },
  description: { label: "Descrição", inputId: "evento-descricao" },
  startDate: { label: "Início do evento", inputId: "evento-inicio", obrigatorio: true },
  endDate: { label: "Término do evento", inputId: "evento-termino", obrigatorio: true },
  venueSuggestion: { label: "Local do evento", inputId: "evento-local", obrigatorio: true },
  suggestedTicketTypes: { label: "Lotes de ingressos", inputId: "evento-nome" },
};

export const eventAiDraftPromptSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, { error: "Descreva seu evento antes de gerar o rascunho com IA." })
    .min(AI_DRAFT_PROMPT_MIN_LENGTH, {
      error: `Escreva pelo menos ${AI_DRAFT_PROMPT_MIN_LENGTH} caracteres com detalhes do evento.`,
    })
    .max(AI_DRAFT_PROMPT_MAX_LENGTH, {
      error: `A descrição deve ter no máximo ${AI_DRAFT_PROMPT_MAX_LENGTH} caracteres.`,
    }),
});

export type EventAiDraftPromptInputs = z.input<typeof eventAiDraftPromptSchema>;
export type EventAiDraftPromptValues = z.output<typeof eventAiDraftPromptSchema>;

/** Mescla o rascunho gerado pela IA nos valores do formulário mantendo campos não inferidos editáveis. */
export function toEventFormValuesFromAiDraft(
  draft: EventAiDraft,
  current: EventFormInputs,
): EventFormInputs {
  return {
    ...current,
    name: draft.name?.trim() ? draft.name.trim() : current.name,
    description: draft.description?.trim() ? draft.description.trim() : current.description,
    category: draft.category ?? current.category,
    ageRating: draft.ageRating ?? current.ageRating,
    edition: draft.edition?.trim() ? draft.edition.trim() : current.edition,
    startDate: draft.startDate ? toDateTimeLocal(draft.startDate) : current.startDate,
    endDate: draft.endDate ? toDateTimeLocal(draft.endDate) : current.endDate,
  };
}

const FORM_TRACKED_FIELDS: readonly EventAiDraftField[] = [
  "name",
  "category",
  "edition",
  "ageRating",
  "description",
  "startDate",
  "endDate",
  "venueSuggestion",
];

/** Campos da Etapa 1 que foram inferidos e preenchidos pela IA. */
export function getInferredAiFields(draft: EventAiDraft): EventAiDraftField[] {
  const missing = new Set(draft.missingFields);
  const inferred: EventAiDraftField[] = [];

  if (!missing.has("name") && Boolean(draft.name?.trim())) inferred.push("name");
  if (!missing.has("category") && draft.category !== null) inferred.push("category");
  if (!missing.has("edition") && Boolean(draft.edition?.trim())) inferred.push("edition");
  if (!missing.has("ageRating") && draft.ageRating !== null) inferred.push("ageRating");
  if (!missing.has("description") && Boolean(draft.description?.trim())) inferred.push("description");
  if (!missing.has("startDate") && Boolean(draft.startDate)) inferred.push("startDate");
  if (!missing.has("endDate") && Boolean(draft.endDate)) inferred.push("endDate");

  return inferred;
}

/**
 * Campos da Etapa 1 que exigem revisão manual (`missingFields` da API,
 * somando `venueSuggestion` quando o local ainda precisa ser selecionado no cadastro).
 */
export function getMissingFormFields(draft: EventAiDraft): EventAiDraftField[] {
  const tracked = new Set(FORM_TRACKED_FIELDS);
  const result = new Set<EventAiDraftField>();

  for (const field of draft.missingFields) {
    if (tracked.has(field)) result.add(field);
  }

  return [...result];
}

function normalizarNome(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Procura, entre os locais cadastrados, o de mesmo nome que a IA sugeriu (ignora acentos e caixa). */
export function encontrarLocalSugerido<Local extends { id: string; nome: string }>(
  suggestion: VenueSuggestion | null,
  locais: readonly Local[],
): Local | null {
  const nome = suggestion?.name ? normalizarNome(suggestion.name) : "";
  if (!nome) return null;
  return locais.find((local) => normalizarNome(local.nome) === nome) ?? null;
}

/** Formata a sugestão textual de local da IA (ex.: "Centro de Convenções Hubee — São Paulo/SP"). */
export function formatarSugestaoLocal(suggestion: VenueSuggestion | null): string | null {
  if (!suggestion) return null;
  const localidade = [suggestion.city?.trim(), suggestion.state?.trim()].filter(Boolean).join("/");
  const partes = [suggestion.name?.trim(), suggestion.address?.trim(), localidade].filter(Boolean);
  return partes.length > 0 ? partes.join(" — ") : null;
}

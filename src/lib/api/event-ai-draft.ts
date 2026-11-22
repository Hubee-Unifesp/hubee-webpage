import { isAxiosError } from "axios";
import {
  EVENT_AI_DRAFT_FIELDS,
  type EventAiDraft,
  type EventAiDraftField,
} from "@/lib/validations/event-ai-draft.schema";
import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";

/** A IA leva alguns segundos para responder, mais do que o timeout padrão de 10s das demais chamadas. */
export const AI_DRAFT_TIMEOUT_MS = 30_000;

/** Resposta de `POST /events/ai-draft` (`EventAiDraftResponseDto`). */
export type EventAiDraftResponse = EventAiDraft;

/**
 * Gera um rascunho de evento e de lotes a partir de uma descrição em linguagem natural.
 * A API só devolve a sugestão: nenhum evento é criado nem publicado.
 */
export async function generateEventAiDraft(prompt: string): Promise<EventAiDraft> {
  const { data } = await apiClient.post<EventAiDraftResponse>(
    "/events/ai-draft",
    { prompt: prompt.trim() },
    { timeout: AI_DRAFT_TIMEOUT_MS },
  );
  return normalizeDraft(data);
}

function normalizeDraft(draft: EventAiDraftResponse): EventAiDraft {
  const known = new Set<string>(EVENT_AI_DRAFT_FIELDS);
  return {
    ...draft,
    suggestedTicketTypes: Array.isArray(draft.suggestedTicketTypes) ? draft.suggestedTicketTypes : [],
    missingFields: (Array.isArray(draft.missingFields) ? draft.missingFields : []).filter(
      (field): field is EventAiDraftField => known.has(field),
    ),
  };
}

const MENSAGEM_INDISPONIVEL =
  "A geração com IA está indisponível no momento. Tente novamente em instantes ou preencha o formulário manualmente.";

/** Mensagem em pt-BR para cada falha de `POST /events/ai-draft`. */
export function getAiDraftErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return MENSAGEM_INDISPONIVEL;

  const { status, messages } = parseApiError(error);
  if (status === undefined) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "A IA demorou demais para responder. Tente novamente ou preencha o formulário manualmente."
      : "Não foi possível conectar à Hubee. Verifique sua conexão e tente novamente.";
  }

  switch (status) {
    case 400:
      return messages[0] ?? "Descreva o evento com até 2000 caracteres para gerar o rascunho.";
    case 422:
      return messages[0] ?? "Não foi possível gerar um rascunho com essa descrição. Acrescente mais detalhes do evento.";
    case 429: {
      const espera = Number(error.response?.headers?.["retry-after"]);
      return Number.isFinite(espera) && espera > 0
        ? `Você atingiu o limite de gerações com IA. Tente novamente em ${Math.ceil(espera)} segundos.`
        : "Você atingiu o limite de gerações com IA. Aguarde um pouco e tente novamente.";
    }
    case 401:
    case 403:
      return "Você não tem permissão para gerar rascunhos com IA.";
    default:
      return MENSAGEM_INDISPONIVEL;
  }
}

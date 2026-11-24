import { isAxiosError } from "axios";
import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";
import type { AssistantTurnRequest, AssistantTurnResponse } from "./event-ai-assistant.types";

export const AI_ASSISTANT_TIMEOUT_MS = 30_000;

export async function sendAssistantTurn(request: AssistantTurnRequest): Promise<AssistantTurnResponse> {
  const body: AssistantTurnRequest = { ...request };
  if (typeof body.answer === "string") body.answer = body.answer.trim();
  const { data } = await apiClient.post<AssistantTurnResponse>("/events/ai-assistant/turn", body, {
    timeout: AI_ASSISTANT_TIMEOUT_MS,
  });
  return data;
}

const MENSAGEM_INDISPONIVEL =
  "O assistente está indisponível no momento. Tente novamente em instantes ou crie o evento pelo formulário.";

export function getAssistantErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return MENSAGEM_INDISPONIVEL;

  const { status, messages } = parseApiError(error);
  if (status === undefined) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "O assistente demorou demais para responder. Envie a resposta de novo."
      : "Não foi possível conectar à Hubee. Verifique sua conexão e tente novamente.";
  }

  switch (status) {
    case 400:
      return messages[0] ?? "Não foi possível enviar essa resposta. Revise o texto e tente de novo.";
    case 429: {
      const espera = Number(error.response?.headers?.["retry-after"]);
      return Number.isFinite(espera) && espera > 0
        ? `Você atingiu o limite de mensagens para o assistente. Tente novamente em ${Math.ceil(espera)} segundos.`
        : "Você atingiu o limite de mensagens para o assistente. Aguarde um pouco e tente novamente.";
    }
    case 401:
    case 403:
      return "Você não tem permissão para usar o assistente de criação de eventos.";
    default:
      return MENSAGEM_INDISPONIVEL;
  }
}

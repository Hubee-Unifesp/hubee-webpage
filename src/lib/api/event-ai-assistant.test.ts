import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AI_ASSISTANT_TIMEOUT_MS, getAssistantErrorMessage, sendAssistantTurn } from "./event-ai-assistant";
import type { AssistantTurnResponse } from "./event-ai-assistant.types";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { post: postMock } }));

const resposta: AssistantTurnResponse = {
  draft: {
    name: "Calourada",
    description: null,
    category: null,
    ageRating: null,
    edition: null,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    salesStartDate: null,
    salesStartTime: null,
    venue: null,
    ticketTypes: [],
    skipped: [],
  },
  reply: "Anotado: Calourada.",
  question: { field: "start", text: "Em que dia e a que horas o evento começa?", skippable: false },
  missingRequired: ["start", "end", "venue"],
  done: false,
};

function httpError(status: number, message: string | string[], headers: Record<string, string> = {}) {
  const config = { headers: new AxiosHeaders() };
  const response = {
    status,
    statusText: "",
    data: { statusCode: status, message },
    headers,
    config,
  } satisfies AxiosResponse;
  return new AxiosError(String(message), AxiosError.ERR_BAD_RESPONSE, config, undefined, response);
}

describe("sendAssistantTurn", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("envia a rodada com a resposta sem espaços nas pontas e timeout maior", async () => {
    postMock.mockResolvedValue({ data: resposta });

    await expect(sendAssistantTurn({ field: "name", answer: "  Calourada  " })).resolves.toEqual(resposta);
    expect(postMock).toHaveBeenCalledWith(
      "/events/ai-assistant/turn",
      { field: "name", answer: "Calourada" },
      { timeout: AI_ASSISTANT_TIMEOUT_MS },
    );
  });

  it("envia skip sem resposta", async () => {
    postMock.mockResolvedValue({ data: resposta });

    await sendAssistantTurn({ draft: resposta.draft, field: "category", skip: true });
    expect(postMock.mock.calls[0][1]).toEqual({ draft: resposta.draft, field: "category", skip: true });
  });
});

describe("getAssistantErrorMessage", () => {
  it("usa a mensagem da API no 400", () => {
    expect(getAssistantErrorMessage(httpError(400, ["Escreva uma resposta para continuar."]))).toBe(
      "Escreva uma resposta para continuar.",
    );
  });

  it("informa a espera no 429 com Retry-After", () => {
    expect(getAssistantErrorMessage(httpError(429, "limite", { "retry-after": "42" }))).toBe(
      "Você atingiu o limite de mensagens para o assistente. Tente novamente em 42 segundos.",
    );
  });

  it("orienta a esperar no 429 sem Retry-After", () => {
    expect(getAssistantErrorMessage(httpError(429, "limite"))).toBe(
      "Você atingiu o limite de mensagens para o assistente. Aguarde um pouco e tente novamente.",
    );
  });

  it.each([401, 403])("explica a falta de permissão no %i", (status) => {
    expect(getAssistantErrorMessage(httpError(status, "x"))).toBe(
      "Você não tem permissão para usar o assistente de criação de eventos.",
    );
  });

  it("trata timeout", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    expect(getAssistantErrorMessage(error)).toBe("O assistente demorou demais para responder. Envie a resposta de novo.");
  });

  it("trata falha de rede", () => {
    expect(getAssistantErrorMessage(new AxiosError("Network Error", "ERR_NETWORK"))).toBe(
      "Não foi possível conectar à Hubee. Verifique sua conexão e tente novamente.",
    );
  });

  it.each([503, 500])("mostra indisponível no %i", (status) => {
    expect(getAssistantErrorMessage(httpError(status, "x"))).toMatch(/^O assistente está indisponível/);
  });

  it("mostra indisponível para erro que não é do axios", () => {
    expect(getAssistantErrorMessage(new Error("x"))).toMatch(/^O assistente está indisponível/);
  });
});

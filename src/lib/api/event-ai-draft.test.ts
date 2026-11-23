import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventAiDraft } from "@/lib/validations/event-ai-draft.schema";
import { AI_DRAFT_TIMEOUT_MS, generateEventAiDraft, getAiDraftErrorMessage } from "./event-ai-draft";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { post: postMock } }));

const draft: EventAiDraft = {
  name: "Festa Junina da Engenharia",
  description: "Festa junina no ginásio.",
  category: "festas",
  ageRating: "18",
  edition: "3ª edição",
  startDate: "2026-11-21T20:00:00-03:00",
  endDate: "2026-11-22T02:00:00-03:00",
  venueSuggestion: { name: "Ginásio da Unifesp", address: "Rua Talim, 330", city: "São José dos Campos", state: "SP" },
  suggestedTicketTypes: [{ batch: "1º lote", price: 30, quantity: 200, modality: "inteira" }],
  missingFields: [],
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

describe("generateEventAiDraft", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("envia o prompt sem espaços nas pontas e devolve o rascunho (200)", async () => {
    postMock.mockResolvedValue({ data: draft });

    await expect(generateEventAiDraft("  Festa junina sábado  ")).resolves.toEqual(draft);
    expect(postMock).toHaveBeenCalledWith(
      "/events/ai-draft",
      { prompt: "Festa junina sábado" },
      { timeout: AI_DRAFT_TIMEOUT_MS },
    );
  });

  it("tolera campos ausentes e descarta missingFields desconhecidos", async () => {
    postMock.mockResolvedValue({
      data: { ...draft, suggestedTicketTypes: undefined, missingFields: ["edition", "campoNovo"] },
    });

    const resultado = await generateEventAiDraft("Palestra sobre IA na sexta");
    expect(resultado.suggestedTicketTypes).toEqual([]);
    expect(resultado.missingFields).toEqual(["edition"]);
  });

  it("propaga o erro de validação (400) para quem chamou", async () => {
    const erro = httpError(400, ["Descreva o evento para gerar o rascunho."]);
    postMock.mockRejectedValue(erro);

    await expect(generateEventAiDraft("x")).rejects.toBe(erro);
  });

  it("propaga a indisponibilidade da IA (503)", async () => {
    const erro = httpError(503, "IA indisponível");
    postMock.mockRejectedValue(erro);

    await expect(generateEventAiDraft("Show de jazz")).rejects.toBe(erro);
  });
});

describe("getAiDraftErrorMessage", () => {
  it("usa o texto da API no erro de validação (400)", () => {
    const erro = httpError(400, ["A descrição do evento deve ter no máximo 2000 caracteres."]);
    expect(getAiDraftErrorMessage(erro)).toBe("A descrição do evento deve ter no máximo 2000 caracteres.");
  });

  it("explica a indisponibilidade da IA (503) e sugere o preenchimento manual", () => {
    const mensagem = getAiDraftErrorMessage(httpError(503, "Tente novamente em instantes."));
    expect(mensagem).toContain("indisponível");
    expect(mensagem).toContain("manualmente");
  });

  it("explica o timeout, quando a API nem respondeu", () => {
    const erro = new AxiosError("timeout of 30000ms exceeded", AxiosError.ECONNABORTED);
    expect(getAiDraftErrorMessage(erro)).toContain("demorou demais");
  });

  it("explica a falta de conexão", () => {
    const erro = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
    expect(getAiDraftErrorMessage(erro)).toContain("conectar");
  });

  it("informa o tempo de espera do limite de uso (429)", () => {
    const erro = httpError(429, "Too Many Requests", { "retry-after": "42" });
    expect(getAiDraftErrorMessage(erro)).toContain("42 segundos");
  });

  it("usa o texto da API quando a IA não gera rascunho (422)", () => {
    expect(getAiDraftErrorMessage(httpError(422, "A IA não gerou um rascunho."))).toBe("A IA não gerou um rascunho.");
  });

  it("cai na mensagem de indisponibilidade para erros desconhecidos", () => {
    expect(getAiDraftErrorMessage(new Error("boom"))).toContain("indisponível");
  });
});

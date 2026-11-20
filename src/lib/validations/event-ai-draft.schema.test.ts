import { describe, expect, it } from "vitest";
import { emptyEventForm } from "./event.schema";
import {
  AI_DRAFT_PROMPT_MAX_LENGTH,
  AI_DRAFT_PROMPT_MIN_LENGTH,
  eventAiDraftPromptSchema,
  formatarSugestaoLocal,
  getInferredAiFields,
  getMissingFormFields,
  toEventFormValuesFromAiDraft,
  type EventAiDraft,
} from "./event-ai-draft.schema";

const mockDraft: EventAiDraft = {
  name: "Hubee Tech Summit",
  description: "Um dia de palestras e oficinas práticas sobre tecnologia e IA.",
  category: "palestras",
  ageRating: "L",
  edition: null,
  startDate: "2027-03-20T09:00:00-03:00",
  endDate: "2027-03-20T18:00:00-03:00",
  venueSuggestion: null,
  suggestedTicketTypes: [
    { batch: "1º Lote Promocional", price: 60, quantity: 100, modality: "inteira" },
    { batch: "2º Lote Geral", price: 120, quantity: 200, modality: "inteira" },
  ],
  missingFields: ["edition", "venueSuggestion"],
};

describe("eventAiDraftPromptSchema", () => {
  it("recusa prompt vazio ou apenas espaços", () => {
    const empty = eventAiDraftPromptSchema.safeParse({ prompt: "" });
    const spaces = eventAiDraftPromptSchema.safeParse({ prompt: "     " });

    expect(empty.success).toBe(false);
    expect(spaces.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe("Descreva seu evento antes de gerar o rascunho com IA.");
    }
  });

  it("recusa prompt abaixo do tamanho mínimo após trim", () => {
    const shortPrompt = "a".repeat(AI_DRAFT_PROMPT_MIN_LENGTH - 1);
    const parsed = eventAiDraftPromptSchema.safeParse({ prompt: `  ${shortPrompt}  ` });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toContain(String(AI_DRAFT_PROMPT_MIN_LENGTH));
    }
  });

  it("recusa prompt acima do limite máximo de caracteres", () => {
    const tooLong = "a".repeat(AI_DRAFT_PROMPT_MAX_LENGTH + 1);
    const parsed = eventAiDraftPromptSchema.safeParse({ prompt: tooLong });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toContain(String(AI_DRAFT_PROMPT_MAX_LENGTH));
    }
  });

  it("aceita prompt válido dentro dos limites e aplica trim", () => {
    const parsed = eventAiDraftPromptSchema.safeParse({
      prompt: "  Hubee Tech Summit dia 20/03 das 9h às 18h com 2 lotes  ",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.prompt).toBe("Hubee Tech Summit dia 20/03 das 9h às 18h com 2 lotes");
    }
  });
});

describe("helpers do rascunho de evento com IA", () => {
  it("converte o rascunho em valores de formulário preservando campos não inferidos", () => {
    const values = toEventFormValuesFromAiDraft(mockDraft, {
      ...emptyEventForm,
      edition: "Edição manual",
      venueId: "venue-1",
    });

    expect(values.name).toBe("Hubee Tech Summit");
    expect(values.category).toBe("palestras");
    expect(values.ageRating).toBe("L");
    expect(values.description).toBe("Um dia de palestras e oficinas práticas sobre tecnologia e IA.");
    expect(values.edition).toBe("Edição manual");
    expect(values.venueId).toBe("venue-1");
    expect(values.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(values.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("identifica corretamente campos inferidos e campos pendentes da Etapa 1", () => {
    expect(getInferredAiFields(mockDraft)).toEqual([
      "name",
      "category",
      "ageRating",
      "description",
      "startDate",
      "endDate",
    ]);

    expect(
      getMissingFormFields({
        ...mockDraft,
        missingFields: ["edition", "venueSuggestion", "suggestedTicketTypes", "edition"],
      }),
    ).toEqual(["edition", "venueSuggestion"]);
  });

  it("formata sugestão de local omitindo partes nulas ou vazias", () => {
    expect(formatarSugestaoLocal(null)).toBeNull();
    expect(
      formatarSugestaoLocal({
        name: "Centro de Convenções Hubee",
        address: "Av. Paulista, 1000",
        city: "São Paulo",
        state: "SP",
      }),
    ).toBe("Centro de Convenções Hubee — Av. Paulista, 1000 — São Paulo/SP");
    expect(
      formatarSugestaoLocal({
        name: "Auditório Principal",
        address: null,
        city: "São José dos Campos",
        state: null,
      }),
    ).toBe("Auditório Principal — São José dos Campos");
  });
});

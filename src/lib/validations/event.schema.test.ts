import { describe, expect, it } from "vitest";
import {
  EVENT_EDITION_MAX_LENGTH,
  EVENT_NAME_MAX_LENGTH,
  emptyEventForm,
  eventSchema,
  toDateTimeLocal,
  toEventFormValues,
  toEventPayload,
  type EventFormInputs,
} from "./event.schema";

const valid: EventFormInputs = {
  ...emptyEventForm,
  name: "Hubee Tech Summit",
  startDate: "2027-03-20T09:00",
  endDate: "2027-03-20T18:00",
  venueId: "mock-local-centro",
};

function errors(overrides: Partial<EventFormInputs>) {
  const result = eventSchema.safeParse({ ...valid, ...overrides });
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("eventSchema", () => {
  it("aceita apenas os campos obrigatórios, com os opcionais vazios", () => {
    expect(errors({})).toEqual({});
  });

  it("aceita todos os campos preenchidos", () => {
    expect(
      errors({
        category: "palestras",
        edition: "3ª edição",
        ageRating: "L",
        description: "Um dia de palestras.",
        salesStartDate: "2026-12-01T10:00",
      }),
    ).toEqual({});
  });

  describe("name", () => {
    it("recusa nome vazio ou só com espaços", () => {
      expect(errors({ name: "   " }).name).toBe("O nome do evento é obrigatório.");
    });

    it("aceita 255 caracteres e recusa 256", () => {
      expect(errors({ name: "a".repeat(EVENT_NAME_MAX_LENGTH) })).toEqual({});
      expect(errors({ name: "a".repeat(EVENT_NAME_MAX_LENGTH + 1) }).name).toBe(
        "O nome deve ter no máximo 255 caracteres.",
      );
    });
  });

  it("recusa edição com mais de 100 caracteres", () => {
    expect(errors({ edition: "a".repeat(EVENT_EDITION_MAX_LENGTH + 1) }).edition).toBe(
      "A edição deve ter no máximo 100 caracteres.",
    );
  });

  it("recusa categoria e classificação fora da lista", () => {
    expect(errors({ category: "teatro" as EventFormInputs["category"] })).toHaveProperty("category");
    expect(errors({ ageRating: "13" as EventFormInputs["ageRating"] })).toHaveProperty("ageRating");
  });

  it("exige o local", () => {
    expect(errors({ venueId: "" }).venueId).toBe("Selecione o local do evento.");
  });

  describe("datas", () => {
    it("exige início e término", () => {
      expect(errors({ startDate: "", endDate: "" })).toEqual({
        startDate: "Informe a data e o horário de início.",
        endDate: "Informe a data e o horário de término.",
      });
    });

    it("recusa término igual ou anterior ao início", () => {
      expect(errors({ endDate: "2027-03-20T09:00" }).endDate).toBe(
        "A data de término deve ser posterior à data de início.",
      );
      expect(errors({ endDate: "2027-03-19T18:00" }).endDate).toBe(
        "A data de término deve ser posterior à data de início.",
      );
    });

    it("aceita vendas no mesmo horário do início e recusa depois dele", () => {
      expect(errors({ salesStartDate: "2027-03-20T09:00" })).toEqual({});
      expect(errors({ salesStartDate: "2027-03-21T10:00" }).salesStartDate).toBe(
        "A data de início das vendas não pode ser posterior ao início do evento.",
      );
    });

    it("mostra os erros de datas junto com os de outros campos", () => {
      expect(errors({ name: "", venueId: "", endDate: "2027-03-19T18:00" })).toEqual({
        name: "O nome do evento é obrigatório.",
        venueId: "Selecione o local do evento.",
        endDate: "A data de término deve ser posterior à data de início.",
      });
    });
  });
});

describe("toEventPayload", () => {
  it("converte as datas para ISO e omite os opcionais vazios", () => {
    const values = eventSchema.parse({ ...valid, name: "  Hubee Tech Summit  " });

    expect(toEventPayload(values, "org-1")).toEqual({
      name: "Hubee Tech Summit",
      organizerId: "org-1",
      venueId: "mock-local-centro",
      startDate: new Date("2027-03-20T09:00").toISOString(),
      endDate: new Date("2027-03-20T18:00").toISOString(),
    });
  });

  it("envia os opcionais preenchidos", () => {
    const values = eventSchema.parse({
      ...valid,
      category: "palestras",
      edition: "3ª edição",
      ageRating: "16",
      description: "Descrição",
      salesStartDate: "2026-12-01T10:00",
    });

    expect(toEventPayload(values, "org-1")).toMatchObject({
      category: "palestras",
      edition: "3ª edição",
      ageRating: "16",
      description: "Descrição",
      salesStartDate: new Date("2026-12-01T10:00").toISOString(),
    });
  });
});

describe("toEventFormValues", () => {
  it("devolve o formulário vazio sem evento", () => {
    expect(toEventFormValues(null)).toEqual(emptyEventForm);
  });

  it("volta ao mesmo horário local depois de ida e volta pela API", () => {
    expect(toDateTimeLocal(new Date("2027-03-20T09:00").toISOString())).toBe("2027-03-20T09:00");
    expect(toDateTimeLocal(null)).toBe("");
  });
});

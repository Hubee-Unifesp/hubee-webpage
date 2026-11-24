import { describe, expect, it } from "vitest";
import type { AssistantDraft } from "@/lib/api/event-ai-assistant.types";
import type { LocalComEndereco } from "@/lib/api/venues";
import {
  encontrarLocal,
  montarPayloadEvento,
  normalizarTexto,
  paraIso,
  rascunhoProntoParaCriar,
  separarEndereco,
  separarLotes,
  valoresIniciaisDoLocal,
} from "./assistente-evento-criacao";

const base: AssistantDraft = {
  name: "Calourada",
  description: null,
  category: null,
  ageRating: null,
  edition: null,
  startDate: "2026-12-12",
  startTime: "21:00",
  endDate: "2026-12-13",
  endTime: "03:00",
  salesStartDate: null,
  salesStartTime: null,
  venue: { name: "Ginásio da Unifesp", address: null, city: "São José dos Campos", state: "SP" },
  ticketTypes: [],
  skipped: [],
};

function local(overrides: Partial<LocalComEndereco>): LocalComEndereco {
  return {
    id: "local-1",
    nome: "Outro local",
    capacidade: 500,
    rua: null,
    numero: null,
    cidade: "São José dos Campos",
    uf: "SP",
    ...overrides,
  };
}

describe("paraIso", () => {
  it("monta a data com o fuso de Brasília", () => {
    expect(paraIso("2026-12-12", "21:00")).toBe("2026-12-12T21:00:00-03:00");
  });
});

describe("rascunhoProntoParaCriar", () => {
  it("exige nome, início, término e local com cidade", () => {
    expect(rascunhoProntoParaCriar(base)).toBe(true);
    expect(rascunhoProntoParaCriar(null)).toBe(false);
    expect(rascunhoProntoParaCriar({ ...base, startTime: null })).toBe(false);
    expect(rascunhoProntoParaCriar({ ...base, venue: { ...base.venue!, city: null } })).toBe(false);
  });

  it("aceita local só com endereço", () => {
    expect(
      rascunhoProntoParaCriar({
        ...base,
        venue: { name: null, address: "Av. JK, 100", city: "São José dos Campos", state: "SP" },
      }),
    ).toBe(true);
  });
});

describe("montarPayloadEvento", () => {
  it("leva só os campos preenchidos e as datas com fuso", () => {
    expect(montarPayloadEvento(base, "org-1", "venue-1")).toEqual({
      name: "Calourada",
      organizerId: "org-1",
      venueId: "venue-1",
      startDate: "2026-12-12T21:00:00-03:00",
      endDate: "2026-12-13T03:00:00-03:00",
    });
  });

  it("inclui opcionais preenchidos e ignora início das vendas sem horário", () => {
    const payload = montarPayloadEvento(
      {
        ...base,
        description: "Festa",
        category: "festas",
        edition: "3ª edição",
        ageRating: "18",
        salesStartDate: "2026-12-01",
        salesStartTime: null,
      },
      "org-1",
      "venue-1",
    );
    expect(payload).toMatchObject({ description: "Festa", category: "festas", edition: "3ª edição", ageRating: "18" });
    expect(payload).not.toHaveProperty("salesStartDate");

    expect(
      montarPayloadEvento({ ...base, salesStartDate: "2026-12-01", salesStartTime: "10:00" }, "org-1", "venue-1")
        .salesStartDate,
    ).toBe("2026-12-01T10:00:00-03:00");
  });

  it("recusa rascunho incompleto", () => {
    expect(() => montarPayloadEvento({ ...base, name: null }, "org-1", "venue-1")).toThrow();
  });
});

describe("separarLotes", () => {
  it("cria os completos, com inteira como modalidade padrão, e devolve os incompletos", () => {
    const { completos, incompletos } = separarLotes({
      ...base,
      ticketTypes: [
        { batch: "1º lote", price: 30, quantity: 100, modality: null },
        { batch: "VIP", price: 80, quantity: 20, modality: "vip" },
        { batch: "Meia", price: 15, quantity: null, modality: "meia" },
      ],
    });
    expect(completos).toEqual([
      { batch: "1º lote", modality: "inteira", price: 30, quantity: 100, salesStartDate: null, salesEndDate: null },
      { batch: "VIP", modality: "vip", price: 80, quantity: 20, salesStartDate: null, salesEndDate: null },
    ]);
    expect(incompletos).toEqual([{ batch: "Meia", price: 15, quantity: null, modality: "meia" }]);
  });
});

describe("normalizarTexto", () => {
  it("tira acentos, pontuação e expande abreviações de logradouro", () => {
    expect(normalizarTexto("Av. Presidente  Juscelino Kubitschek")).toBe("avenida presidente juscelino kubitschek");
    expect(normalizarTexto("R. São João")).toBe("rua sao joao");
    expect(normalizarTexto("Ginásio da UNIFESP")).toBe("ginasio da unifesp");
  });
});

describe("separarEndereco", () => {
  it.each([
    ["Rua Talim, 330", { rua: "Rua Talim", numero: "330", bairro: "" }],
    ["Rua Talim 330, Vila Nair", { rua: "Rua Talim", numero: "330", bairro: "Vila Nair" }],
    ["avenida presidente juscelino kubitscheck, monte castelo", {
      rua: "avenida presidente juscelino kubitscheck",
      numero: "",
      bairro: "monte castelo",
    }],
    ["Av. JK, nº 100 - Centro", { rua: "Av. JK", numero: "100", bairro: "Centro" }],
  ])("separa %s", (endereco, esperado) => {
    expect(separarEndereco(endereco)).toEqual(esperado);
  });

  it("devolve vazio sem endereço", () => {
    expect(separarEndereco(null)).toEqual({ rua: "", numero: "", bairro: "" });
  });
});

describe("encontrarLocal", () => {
  it("acha pelo nome na mesma cidade, sem diferenciar acento e maiúsculas", () => {
    const alvo = local({ id: "alvo", nome: "Ginasio da UNIFESP" });
    expect(encontrarLocal(base.venue, [local({}), alvo])).toBe(alvo);
  });

  it("não usa local de mesmo nome em outra cidade", () => {
    expect(encontrarLocal(base.venue, [local({ nome: "Ginásio da Unifesp", cidade: "Santos" })])).toBeNull();
  });

  it("acha pelo endereço quando o local não tem nome", () => {
    const alvo = local({ id: "alvo", rua: "Avenida Presidente Juscelino Kubitschek", numero: "100" });
    const venue = {
      name: null,
      address: "Av. Presidente Juscelino Kubitschek, 100",
      city: "Sao Jose dos Campos",
      state: "SP",
    };
    expect(encontrarLocal(venue, [alvo])).toBe(alvo);
    expect(encontrarLocal({ ...venue, address: "Av. Presidente Juscelino Kubitschek, 200" }, [alvo])).toBeNull();
  });

  it("sem cidade não arrisca", () => {
    expect(encontrarLocal({ ...base.venue!, city: null }, [local({ nome: "Ginásio da Unifesp" })])).toBeNull();
  });
});

describe("valoresIniciaisDoLocal", () => {
  it("preenche o cadastro com nome, endereço separado, cidade e UF", () => {
    expect(
      valoresIniciaisDoLocal({ name: "Bar do Zé", address: "Rua Talim 330, Vila Nair", city: "São José dos Campos", state: "sp" }),
    ).toEqual({
      name: "Bar do Zé",
      street: "Rua Talim",
      number: "330",
      neighborhood: "Vila Nair",
      city: "São José dos Campos",
      state: "SP",
    });
  });

  it("usa a rua como nome quando o local não tem nome e ignora UF inválida", () => {
    expect(
      valoresIniciaisDoLocal({ name: null, address: "Av. JK, 100", city: "Santos", state: "XX" }),
    ).toMatchObject({ name: "Av. JK", state: "" });
  });
});

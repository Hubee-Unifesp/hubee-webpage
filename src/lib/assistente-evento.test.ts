import { describe, expect, it } from "vitest";
import type { AssistantDraft, AssistantTurnResponse } from "@/lib/api/event-ai-assistant.types";
import {
  MENSAGEM_FINAL,
  campoCompleto,
  MENSAGEM_INICIAL,
  aplicarRodada,
  conversaInicial,
  formatarLote,
  lerConversaSalva,
  montarRequisicao,
  podePular,
  registrarEnvio,
  resumoDoRascunho,
} from "./assistente-evento";

const rascunhoVazio: AssistantDraft = {
  name: null,
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
};

function rodada(overrides: Partial<AssistantTurnResponse> = {}): AssistantTurnResponse {
  return {
    draft: { ...rascunhoVazio, name: "Calourada" },
    reply: "Anotado: Calourada.",
    question: { field: "start", text: "Em que dia e a que horas o evento começa?", skippable: false },
    missingRequired: ["start", "end", "venue"],
    done: false,
    ...overrides,
  };
}

describe("conversa do assistente", () => {
  it("começa com a mensagem inicial, sem rascunho e com todos os obrigatórios faltando", () => {
    const conversa = conversaInicial();
    expect(conversa.mensagens).toEqual([{ id: "1", autor: "assistente", texto: MENSAGEM_INICIAL }]);
    expect(conversa.draft).toBeNull();
    expect(conversa.obrigatoriosFaltando).toEqual(["name", "start", "end", "venue"]);
  });

  it("primeira requisição leva só a resposta", () => {
    expect(montarRequisicao(conversaInicial(), { tipo: "resposta", texto: "  Calourada dia 5/12  " })).toEqual({
      answer: "Calourada dia 5/12",
    });
  });

  it("requisições seguintes levam o rascunho e o campo da pergunta", () => {
    const conversa = aplicarRodada(conversaInicial(), rodada());
    expect(montarRequisicao(conversa, { tipo: "resposta", texto: "às 20h" })).toEqual({
      draft: conversa.draft,
      field: "start",
      answer: "às 20h",
    });
  });

  it("pular manda skip no lugar da resposta", () => {
    const conversa = aplicarRodada(
      conversaInicial(),
      rodada({ question: { field: "category", text: "Que tipo de evento é?", skippable: true } }),
    );
    expect(montarRequisicao(conversa, { tipo: "pular" })).toEqual({
      draft: conversa.draft,
      field: "category",
      skip: true,
    });
  });

  it("registra a mensagem do organizador", () => {
    const conversa = registrarEnvio(conversaInicial(), { tipo: "resposta", texto: " Calourada " });
    expect(conversa.mensagens.at(-1)).toEqual({ id: "2", autor: "organizador", texto: "Calourada" });
    expect(registrarEnvio(conversaInicial(), { tipo: "pular" }).mensagens.at(-1)?.texto).toBe("Pular esta pergunta");
  });

  it("aplica a rodada com a confirmação e a próxima pergunta", () => {
    const base = registrarEnvio(conversaInicial(), { tipo: "resposta", texto: "Calourada" });
    const conversa = aplicarRodada(base, rodada());

    expect(conversa.mensagens.slice(2)).toEqual([
      { id: "3", autor: "assistente", texto: "Anotado: Calourada." },
      { id: "4", autor: "assistente", texto: "Em que dia e a que horas o evento começa?" },
    ]);
    expect(conversa.draft?.name).toBe("Calourada");
    expect(conversa.pergunta?.field).toBe("start");
    expect(conversa.obrigatoriosFaltando).toEqual(["start", "end", "venue"]);
    expect(conversa.done).toBe(false);
  });

  it("sem confirmação, só acrescenta a pergunta", () => {
    const conversa = aplicarRodada(conversaInicial(), rodada({ reply: null }));
    expect(conversa.mensagens.slice(1)).toEqual([
      { id: "2", autor: "assistente", texto: "Em que dia e a que horas o evento começa?" },
    ]);
  });

  it("ao terminar, mostra a mensagem final", () => {
    const conversa = aplicarRodada(conversaInicial(), rodada({ question: null, done: true, missingRequired: [] }));
    expect(conversa.mensagens.at(-1)?.texto).toBe(MENSAGEM_FINAL);
    expect(conversa.done).toBe(true);
    expect(podePular(conversa)).toBe(false);
  });

  it("só permite pular pergunta de campo opcional", () => {
    expect(podePular(aplicarRodada(conversaInicial(), rodada()))).toBe(false);
    expect(
      podePular(
        aplicarRodada(
          conversaInicial(),
          rodada({ question: { field: "ageRating", text: "Classificação?", skippable: true } }),
        ),
      ),
    ).toBe(true);
  });
});

describe("lerConversaSalva", () => {
  it("restaura a conversa salva", () => {
    const conversa = aplicarRodada(conversaInicial(), rodada());
    expect(lerConversaSalva(JSON.stringify(conversa))).toEqual(conversa);
  });

  it.each([
    ["vazio", null],
    ["JSON inválido", "{"],
    ["sem mensagens", JSON.stringify({ ...conversaInicial(), mensagens: [] })],
    ["mensagem com autor inválido", JSON.stringify({ ...conversaInicial(), mensagens: [{ id: "1", autor: "bot", texto: "oi" }] })],
    ["pergunta com campo desconhecido", JSON.stringify({ ...conversaInicial(), pergunta: { field: "preco", text: "x", skippable: true } })],
    ["obrigatórios fora da lista", JSON.stringify({ ...conversaInicial(), obrigatoriosFaltando: ["preco"] })],
    ["rascunho sem lotes", JSON.stringify({ ...conversaInicial(), draft: { name: "x" } })],
  ])("ignora conteúdo %s", (_caso, raw) => {
    expect(lerConversaSalva(raw)).toBeNull();
  });
});

describe("resumoDoRascunho", () => {
  const rotulo = (categoria: string) => `Rótulo ${categoria}`;

  it("lista todos os campos sem valores quando ainda não há rascunho", () => {
    const resumo = resumoDoRascunho(null, rotulo);
    expect(resumo.map((item) => item.campo)).toEqual([
      "name",
      "start",
      "end",
      "venue",
      "ticketTypes",
      "salesStart",
      "category",
      "ageRating",
      "description",
    ]);
    expect(resumo.every((item) => item.valores.length === 0 && !item.pulado)).toBe(true);
  });

  it("formata datas, local, lotes, categoria e classificação", () => {
    const resumo = resumoDoRascunho(
      {
        ...rascunhoVazio,
        name: "Calourada",
        edition: "3ª edição",
        startDate: "2026-12-05",
        startTime: "20:00",
        endDate: "2026-12-06",
        venue: { name: "Ginásio", address: null, city: "Santos", state: "SP" },
        ticketTypes: [{ batch: "Pista", price: 30, quantity: 100, modality: null }],
        category: "festas",
        ageRating: "L",
        skipped: ["salesStart"],
      },
      rotulo,
    );
    const valor = (campo: string) => resumo.find((item) => item.campo === campo);

    expect(valor("name")?.valores).toEqual(["Calourada · 3ª edição"]);
    expect(valor("start")?.valores).toEqual(["05/12/2026 às 20:00"]);
    expect(valor("end")?.valores).toEqual(["06/12/2026, horário a definir"]);
    expect(valor("venue")?.valores).toEqual(["Ginásio · Santos/SP"]);
    expect(valor("ticketTypes")?.valores.map((texto) => texto.replace(/\u00a0/g, " "))).toEqual([
      "Pista · R$ 30,00 · 100 ingressos",
    ]);
    expect(valor("category")?.valores).toEqual(["Rótulo festas"]);
    expect(valor("ageRating")?.valores).toEqual(["Livre"]);
    expect(valor("salesStart")).toMatchObject({ valores: [], pulado: true, completo: false });
    expect(valor("start")?.completo).toBe(true);
    expect(valor("end")?.completo).toBe(false);
    expect(valor("ticketTypes")?.completo).toBe(true);
  });
});

describe("formatarLote", () => {
  it("indica gratuito, modalidade e o que falta definir", () => {
    expect(formatarLote({ batch: "Cortesia", price: 0, quantity: 1, modality: "cortesia" })).toBe(
      "Cortesia · cortesia · gratuito · 1 ingresso",
    );
    expect(formatarLote({ batch: "VIP", price: null, quantity: null, modality: "vip" })).toBe(
      "VIP · VIP · preço a definir · quantidade a definir",
    );
  });
});

describe("campoCompleto", () => {
  it("segue as mesmas regras da API", () => {
    expect(campoCompleto(null, "name")).toBe(false);
    expect(campoCompleto({ ...rascunhoVazio, startDate: "2026-12-05" }, "start")).toBe(false);
    expect(
      campoCompleto({ ...rascunhoVazio, venue: { name: "Ginásio", address: null, city: null, state: null } }, "venue"),
    ).toBe(false);
    expect(
      campoCompleto(
        { ...rascunhoVazio, venue: { name: null, address: "Av. JK, 100", city: "São José dos Campos", state: "SP" } },
        "venue",
      ),
    ).toBe(true);
    expect(
      campoCompleto({ ...rascunhoVazio, venue: { name: null, address: null, city: "Santos", state: "SP" } }, "venue"),
    ).toBe(false);
    expect(
      campoCompleto(
        { ...rascunhoVazio, ticketTypes: [{ batch: "Pista", price: 30, quantity: null, modality: null }] },
        "ticketTypes",
      ),
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import type { EventoEditavel, LocalEvento, LoteEvento } from "@/types/evento-editor";
import {
  CAPA_MAX_BYTES,
  canEditEvent,
  getPendenciasPublicacao,
  getResumoCapacidade,
  podePublicar,
  validarCapa,
  validarProporcaoCapa,
} from "./evento-editor.data";

function lote(overrides: Partial<LoteEvento>): LoteEvento {
  return { id: "1", batch: "Lote", price: 100, quantity: 100, ...overrides };
}

const rascunho: EventoEditavel = {
  id: "evento-1",
  organizerId: "org-1",
  status: "draft",
  name: "Hubee Tech Summit",
  description: null,
  category: "palestras",
  edition: null,
  ageRating: "L",
  photoUrl: null,
  startDate: "2027-03-20T12:00:00.000Z",
  endDate: "2027-03-20T21:00:00.000Z",
  salesStartDate: null,
  venueId: "local-1",
  lotes: [],
};
const centro: LocalEvento = { id: "local-1", nome: "Centro de Convenções Hubee", capacidade: 2000 };

describe("canEditEvent", () => {
  it("libera Administradores e Membros e bloqueia Leitura", () => {
    expect(canEditEvent("administrador", "draft")).toBe(true);
    expect(canEditEvent("membro", "published")).toBe(true);
    expect(canEditEvent("membro")).toBe(true);
    expect(canEditEvent("leitura", "draft")).toBe(false);
  });

  it("bloqueia a edição de evento cancelado para todos os papéis", () => {
    expect(canEditEvent("administrador", "cancelled")).toBe(false);
    expect(canEditEvent("membro", "cancelled")).toBe(false);
  });
});

describe("validarCapa", () => {
  it("aceita JPG e PNG de até 2MB", () => {
    expect(validarCapa({ type: "image/jpeg", size: CAPA_MAX_BYTES })).toBeNull();
    expect(validarCapa({ type: "image/png", size: 1000 })).toBeNull();
  });

  it("recusa outros formatos e arquivos maiores", () => {
    expect(validarCapa({ type: "image/webp", size: 1000 })).toBe(
      "Formato inválido. Use uma imagem .jpg, .png ou .jpeg.",
    );
    expect(validarCapa({ type: "image/png", size: CAPA_MAX_BYTES + 1 })).toBe("A imagem deve ter no máximo 2MB.");
  });
});

describe("validarProporcaoCapa", () => {
  it("aceita 16:9 com uma pequena tolerância", () => {
    expect(validarProporcaoCapa(1600, 900)).toBeNull();
    expect(validarProporcaoCapa(1920, 1080)).toBeNull();
    expect(validarProporcaoCapa(1600, 910)).toBeNull();
  });

  it("recusa outras proporções e imagens sem dimensão", () => {
    expect(validarProporcaoCapa(1000, 1000)).toBe("A imagem deve ter proporção 16:9 (ex.: 1600 × 900 px).");
    expect(validarProporcaoCapa(1200, 900)).toBe("A imagem deve ter proporção 16:9 (ex.: 1600 × 900 px).");
    expect(validarProporcaoCapa(0, 0)).toBe("Não foi possível ler a imagem. Tente outro arquivo.");
  });
});

describe("getResumoCapacidade", () => {
  it("mostra os lugares livres quando os lotes cabem", () => {
    expect(getResumoCapacidade([lote({ quantity: 300 }), lote({ quantity: 900 })], 2000)).toEqual({
      total: 1200,
      capacidade: 2000,
      livres: 800,
      excedente: 0,
      percentual: 60,
    });
  });

  it("mostra o excedente quando os lotes passam da capacidade", () => {
    expect(getResumoCapacidade([lote({ quantity: 2100 })], 2000)).toMatchObject({
      livres: 0,
      excedente: 100,
      percentual: 100,
    });
  });
});

describe("getPendenciasPublicacao", () => {
  it("bloqueia a publicação sem lote", () => {
    const pendencias = getPendenciasPublicacao(rascunho, centro);
    expect(pendencias.find((item) => item.id === "lotes")?.estado).toBe("pendente");
    expect(podePublicar(pendencias)).toBe(false);
  });

  it("libera com um lote e só recomenda a capa", () => {
    const pendencias = getPendenciasPublicacao({ ...rascunho, lotes: [lote({})] }, centro);
    expect(pendencias.map((item) => item.estado)).toEqual(["ok", "ok", "ok", "recomendado"]);
    expect(podePublicar(pendencias)).toBe(true);
  });

  it("bloqueia a publicação quando os lotes passam da capacidade", () => {
    const pendencias = getPendenciasPublicacao(
      { ...rascunho, photoUrl: "https://exemplo.com/capa.png", lotes: [lote({ quantity: 2100 })] },
      centro,
    );
    expect(pendencias.find((item) => item.id === "capacidade")?.estado).toBe("pendente");
    expect(podePublicar(pendencias)).toBe(false);
  });
});

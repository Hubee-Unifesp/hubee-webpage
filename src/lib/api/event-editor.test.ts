import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseApiError } from "./errors";
import {
  cancelarEvento,
  createEvento,
  createLocal,
  createLote,
  deleteLote,
  getEventoEditavel,
  getLocais,
  publicarEvento,
  updateEvento,
  updateLote,
} from "./event-editor";

async function resolver<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

const payload = {
  name: "Festa de Teste",
  organizerId: "org-1",
  venueId: "mock-local-centro",
  startDate: "2027-01-10T20:00:00.000Z",
  endDate: "2027-01-11T02:00:00.000Z",
};

describe("event-editor (mock da hubee-api)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("responde 404 no formato do Axios para evento inexistente", async () => {
    const resultado = getEventoEditavel("nao-existe").catch((error: unknown) => error);
    const erro = await resolver(resultado);
    expect(parseApiError(erro)).toEqual({ status: 404, messages: ["Evento não encontrado"] });
  });

  it("cria o evento como rascunho da organização e o devolve no GET", async () => {
    const criado = await resolver(createEvento(payload));
    expect(criado).toMatchObject({ status: "draft", organizerId: "org-1", name: "Festa de Teste", lotes: [] });

    const lido = await resolver(getEventoEditavel(criado.id));
    expect(lido).toEqual(criado);
  });

  it("atualiza só os campos enviados, publica e cancela", async () => {
    const criado = await resolver(createEvento({ ...payload, description: "Original" }));

    const atualizado = await resolver(updateEvento(criado.id, { name: "Novo nome" }));
    expect(atualizado).toMatchObject({ name: "Novo nome", description: "Original" });

    expect((await resolver(publicarEvento(criado.id))).status).toBe("published");

    await resolver(cancelarEvento(criado.id));
    expect((await resolver(getEventoEditavel(criado.id))).status).toBe("cancelled");
  });

  it("inclui o local cadastrado na lista de locais", async () => {
    const novo = await resolver(
      createLocal({
        name: "Auditório Central",
        maxCapacity: 300,
        address: {
          zipCode: "01310-100",
          street: "Av. Paulista",
          number: "1000",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        },
      }),
    );

    expect(novo).toMatchObject({ nome: "Auditório Central", capacidade: 300 });
    expect(await resolver(getLocais())).toContainEqual(novo);
  });

  describe("lotes", () => {
    const lotePayload = {
      batch: "1º Lote",
      modality: "inteira" as const,
      price: 80,
      quantity: 100,
      salesStartDate: null,
      salesEndDate: null,
    };

    it("grava o lote no próprio evento, que passa a devolvê-lo no GET", async () => {
      const evento = await resolver(createEvento(payload));
      const lote = await resolver(createLote(evento.id, lotePayload));

      expect(lote).toMatchObject({ ...lotePayload, available: 100 });
      expect((await resolver(getEventoEditavel(evento.id))).lotes).toEqual([lote]);
    });

    it("edita o lote preservando o já vendido", async () => {
      // O "Early Bird" do rascunho de exemplo tem 300 ingressos, 180 deles vendidos.
      const editado = await resolver(
        updateLote("mock-evento-rascunho", "mock-lote-1", { ...lotePayload, batch: "Early Bird", quantity: 400, price: 260 }),
      );

      expect(editado).toMatchObject({ batch: "Early Bird", price: 260, quantity: 400, available: 220 });
      const lido = await resolver(getEventoEditavel("mock-evento-rascunho"));
      expect(lido.lotes.find((item) => item.id === "mock-lote-1")).toEqual(editado);
    });

    it("recusa reduzir o total abaixo do já vendido com 400", async () => {
      const lido = await resolver(getEventoEditavel("mock-evento-publicado"));
      const parcial = lido.lotes.find((item) => item.id === "mock-lote-5");
      expect(parcial).toMatchObject({ quantity: 200, available: 75 });

      const resultado = updateLote("mock-evento-publicado", "mock-lote-5", {
        ...lotePayload,
        batch: "Lote Único - Meia",
        quantity: 100,
      }).catch((error: unknown) => error);
      const erro = await resolver(resultado);
      expect(parseApiError(erro)).toEqual({
        status: 400,
        messages: ["A quantidade não pode ser menor que os 125 ingressos já vendidos."],
      });
    });

    it("exclui o lote e responde 404 para lote inexistente", async () => {
      const evento = await resolver(createEvento(payload));
      const lote = await resolver(createLote(evento.id, lotePayload));

      await resolver(deleteLote(evento.id, lote.id));
      expect((await resolver(getEventoEditavel(evento.id))).lotes).toEqual([]);

      const erro = await resolver(deleteLote(evento.id, lote.id).catch((error: unknown) => error));
      expect(parseApiError(erro)).toEqual({ status: 404, messages: ["Lote não encontrado"] });
    });
  });
});

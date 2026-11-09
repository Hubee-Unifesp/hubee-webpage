import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseApiError } from "./errors";
import {
  cancelarEvento,
  createEvento,
  createLocal,
  getEventoEditavel,
  getLocais,
  publicarEvento,
  updateEvento,
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
});

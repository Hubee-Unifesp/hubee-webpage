import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}));

import {
  createDespesa,
  deleteDespesa,
  getDespesas,
  getPlanejamentoEvento,
  updateDespesa,
  updatePublicoEsperado,
  type ApiDespesa,
} from "./planning";

const apiDespesa: ApiDespesa = {
  id: "d1",
  group: "fixed",
  category: "Estrutura",
  description: "Som",
  supplierId: null,
  supplierName: null,
  quantity: "2",
  unitPrice: "750.50",
  amount: "1501",
  responsible: null,
  quoted: false,
  paymentStatus: "pendente",
  notes: null,
  dueDate: null,
};

describe("planning api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista as despesas do evento convertendo valores numéricos", async () => {
    getMock.mockResolvedValue({ data: [apiDespesa] });

    const despesas = await getDespesas("e1");

    expect(getMock).toHaveBeenCalledWith("/events/e1/expenses");
    expect(despesas[0]).toMatchObject({ quantity: 2, unitPrice: 750.5, amount: 1501 });
  });

  it("cria, atualiza parcialmente e exclui despesas", async () => {
    postMock.mockResolvedValue({ data: apiDespesa });
    patchMock.mockResolvedValue({ data: { ...apiDespesa, quoted: true } });
    deleteMock.mockResolvedValue({});
    const payload = {
      group: "fixed" as const,
      category: "Estrutura",
      description: "Som",
      supplierId: null,
      quantity: 2,
      unitPrice: 750.5,
      responsible: null,
      quoted: false,
      paymentStatus: "pendente" as const,
      notes: null,
    };

    await createDespesa("e1", payload);
    const atualizada = await updateDespesa("e1", "d1", { quoted: true });
    await deleteDespesa("e1", "d1");

    expect(postMock).toHaveBeenCalledWith("/events/e1/expenses", payload);
    expect(patchMock).toHaveBeenCalledWith("/events/e1/expenses/d1", { quoted: true });
    expect(atualizada.quoted).toBe(true);
    expect(deleteMock).toHaveBeenCalledWith("/events/e1/expenses/d1");
  });

  it("monta o evento e os lotes do planejamento a partir do resumo", async () => {
    getMock.mockImplementation(async (url: string) =>
      url.endsWith("/planning/summary")
        ? {
            data: {
              expectedAudience: 300,
              tickets: {
                lots: [{ id: "l1", batch: "1º Lote", price: "50.00", quantity: 85, modality: "inteira", sequential: true }],
              },
            },
          }
        : {
            data: {
              id: "e1",
              name: "Codeniver",
              startDate: "2026-12-01T20:00:00Z",
              endDate: "2026-12-02T03:00:00Z",
              venue: { name: "Espaço Hubee" },
            },
          },
    );

    await expect(getPlanejamentoEvento("e1")).resolves.toEqual({
      evento: {
        id: "e1",
        name: "Codeniver",
        startDate: "2026-12-01T20:00:00Z",
        endDate: "2026-12-02T03:00:00Z",
        venueName: "Espaço Hubee",
        expectedAudience: 300,
      },
      lotes: [{ id: "l1", batch: "1º Lote", price: 50, quantity: 85, modality: "inteira", sequential: true }],
    });
  });

  it("salva o público esperado no evento", async () => {
    patchMock.mockResolvedValue({});

    await updatePublicoEsperado("e1", 320);

    expect(patchMock).toHaveBeenCalledWith("/events/e1", { expectedAudience: 320 });
  });
});

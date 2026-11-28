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
  createParcela,
  deleteDespesa,
  deleteParcela,
  getParcelas,
  updateParcela,
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

  it("usa as rotas aninhadas de parcelas e o cronograma do evento", async () => {
    const apiParcela = {
      id: "p1",
      expenseId: "d1",
      expenseDescription: "Som",
      expenseGroup: "fixed",
      expenseCategory: "Estrutura",
      supplierName: null,
      dueDate: "2026-11-10T15:00:00.000Z",
      amount: "400.00",
      status: "pendente",
      paidBy: null,
      paymentMethod: null,
    };
    getMock.mockResolvedValue({ data: [apiParcela] });
    postMock.mockResolvedValue({ data: apiParcela });
    patchMock.mockResolvedValue({ data: { ...apiParcela, status: "pago" } });
    deleteMock.mockResolvedValue({});
    const payload = { dueDate: apiParcela.dueDate, amount: 400, status: "pendente" as const, paidBy: null, paymentMethod: null };

    const [parcela] = await getParcelas("e1");
    await createParcela("e1", "d1", payload);
    await updateParcela("e1", "d1", "p1", { status: "pago" });
    await deleteParcela("e1", "d1", "p1");

    expect(parcela.amount).toBe(400);
    expect(getMock).toHaveBeenCalledWith("/events/e1/installments");
    expect(postMock).toHaveBeenCalledWith("/events/e1/expenses/d1/installments", payload);
    expect(patchMock).toHaveBeenCalledWith("/events/e1/expenses/d1/installments/p1", { status: "pago" });
    expect(deleteMock).toHaveBeenCalledWith("/events/e1/expenses/d1/installments/p1");
  });

  it("salva o público esperado no evento", async () => {
    patchMock.mockResolvedValue({});

    await updatePublicoEsperado("e1", 320);

    expect(patchMock).toHaveBeenCalledWith("/events/e1", { expectedAudience: 320 });
  });
});

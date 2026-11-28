import { describe, expect, it } from "vitest";
import type { DespesaPlanejamento, LotePlanejamento } from "@/types/planejamento";
import {
  agruparPorCategoria,
  calcularIndicadores,
  calcularValorFinal,
  cenariosDePublico,
  contarPendencias,
  distribuirPublico,
  filtrarDespesas,
  loteDoEmpate,
  segmentosDeLotes,
  totaisPorCategoria,
  totalizarDespesas,
} from "./planejamento.data";
import { criarDespesasMock, LOTES_MOCK } from "./planejamento.fixtures";

function despesa(overrides: Partial<DespesaPlanejamento>): DespesaPlanejamento {
  return {
    id: "d",
    group: "fixed",
    category: "Estrutura",
    description: "Item",
    supplierId: null,
    supplierName: null,
    quantity: 1,
    unitPrice: 100,
    amount: 100,
    responsible: null,
    quoted: false,
    paymentStatus: "pendente",
    notes: null,
    dueDate: null,
    ...overrides,
  };
}

describe("planejamento financeiro", () => {
  it("reproduz os totais de despesas da planilha Codeniver", () => {
    const totais = totalizarDespesas(criarDespesasMock());

    expect(totais.porGrupo.fixed).toBe(10010);
    expect(totais.porGrupo.variable).toBe(5493.94);
    expect(totais.porGrupo.marketing).toBe(0);
    expect(totais.total).toBe(15503.94);
  });

  it("reproduz o break-even e o lucro da aba Geral com público 300", () => {
    const total = totalizarDespesas(criarDespesasMock()).total;

    expect(calcularIndicadores(LOTES_MOCK, total, 300)).toEqual({
      audience: 300,
      revenue: 15724.9,
      averageTicket: 52.42,
      breakEven: 295.78,
      costPerPerson: 51.68,
      profit: 220.96,
      breakEvenBatch: "3º Lote",
    });
  });

  it("gera os cenários de 260 a 340 somando o público extra no último lote", () => {
    const total = totalizarDespesas(criarDespesasMock()).total;
    const cenarios = cenariosDePublico(LOTES_MOCK, total, 300);

    expect(cenarios.map((cenario) => cenario.audience)).toEqual([260, 280, 300, 320, 340]);
    expect(cenarios.map((cenario) => cenario.profit)).toEqual([-2129.04, -979.04, 220.96, 1420.96, 2620.96]);
    expect(cenarios[3]).toMatchObject({ revenue: 16924.9, averageTicket: 52.89, breakEven: 293.13 });
  });

  it("tira o público que falta dos últimos lotes da fila primeiro", () => {
    const lotes: LotePlanejamento[] = [
      { id: "a", batch: "1º", price: 10, quantity: 5, modality: "inteira", sequential: true },
      { id: "b", batch: "2º", price: 20, quantity: 3, modality: "inteira", sequential: true },
    ];

    expect(distribuirPublico(lotes, 4)).toEqual([4, 0]);
    expect(distribuirPublico(lotes, 10)).toEqual([5, 5]);
  });

  it("vende as cotas paralelas junto com a fila, como a API", () => {
    const lotes: LotePlanejamento[] = [
      { id: "a", batch: "1º", price: 50, quantity: 10, modality: "inteira", sequential: true },
      { id: "m", batch: "Meia", price: 25, quantity: 4, modality: "meia", sequential: false },
      { id: "c", batch: "Cortesia", price: 0, quantity: 2, modality: "cortesia", sequential: false },
    ];

    expect(distribuirPublico(lotes, 5)).toEqual([0, 4, 1]);
    expect(distribuirPublico(lotes, 20)).toEqual([14, 4, 2]);
    expect(loteDoEmpate(lotes, 120)?.batch).toBe("1º");
  });

  it("não calcula receita nem break-even sem lotes ou sem público", () => {
    expect(calcularIndicadores([], 100, 300)).toMatchObject({ revenue: null, breakEven: null, profit: null, costPerPerson: 0.33 });
    expect(calcularIndicadores(LOTES_MOCK, 100, 0)).toMatchObject({ revenue: null, costPerPerson: null });
  });

  it("ignora despesas canceladas e separa pago de pendente", () => {
    const totais = totalizarDespesas([
      despesa({ amount: 100, paymentStatus: "pago" }),
      despesa({ amount: 50 }),
      despesa({ amount: 999, paymentStatus: "cancelado" }),
    ]);

    expect(totais).toMatchObject({ total: 150, pago: 100, pendente: 50, itens: 2 });
  });

  it("agrupa por categoria com subtotal", () => {
    const categorias = agruparPorCategoria(
      [despesa({ category: "Staff", amount: 10 }), despesa({ category: "Staff", amount: 5 }), despesa({ group: "variable" })],
      "fixed",
    );

    expect(categorias).toEqual([expect.objectContaining({ category: "Staff", subtotal: 15 })]);
  });

  it("arredonda o valor final em centavos", () => {
    expect(calcularValorFinal(3, 10.49)).toBe(31.47);
  });
});

describe("régua do break-even e filtros", () => {
  it("monta as faixas da régua na ordem de venda", () => {
    const segmentos = segmentosDeLotes(LOTES_MOCK, 300);

    expect(segmentos[0]).toMatchObject({ inicio: 0, fim: 10 });
    expect(segmentos.at(-1)).toMatchObject({ inicio: 270, fim: 300 });
    expect(segmentos.map(({ lote }) => lote.batch)).not.toContain("Trabalha");
  });

  it("ordena as categorias pelo total gasto", () => {
    const [primeira, segunda] = totaisPorCategoria(criarDespesasMock());

    expect(primeira).toMatchObject({ category: "Estrutura", total: 8040 });
    expect(segunda).toMatchObject({ category: "Open", total: 4803.47 });
  });

  it("filtra por grupo, pendência e busca", () => {
    const despesas = criarDespesasMock();

    expect(filtrarDespesas(despesas, "fixed", "todas", "").every((item) => item.group === "fixed")).toBe(true);
    expect(filtrarDespesas(despesas, "todos", "a-pagar", "").some((item) => item.paymentStatus === "pago")).toBe(false);
    expect(filtrarDespesas(despesas, "todos", "todas", "ambev").map((item) => item.description)).toEqual([
      "Vodka",
      "Cerveja",
      "Corote",
    ]);
    expect(contarPendencias(despesas)).toEqual({ aPagar: 19, semCotacao: 14 });
  });
});

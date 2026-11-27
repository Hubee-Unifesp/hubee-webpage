import { describe, expect, it } from "vitest";
import type { DespesaPlanejamento, LotePlanejamento } from "@/types/planejamento";
import {
  agruparPorCategoria,
  calcularResumo,
  calcularValorFinal,
  contarPendencias,
  distribuirPublico,
  filtrarDespesas,
  loteDoIngresso,
  publicoParaLucro,
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
    const resumo = calcularResumo(criarDespesasMock(), LOTES_MOCK, 300);

    expect(resumo.atual).toMatchObject({
      audience: 300,
      revenue: 15724.9,
      averageTicket: 52.42,
      breakEven: 295.78,
      costPerPerson: 51.68,
      profit: 220.96,
    });
    expect(publicoParaLucro(resumo)).toBe(296);
  });

  it("gera os cenários somando o público extra no último lote", () => {
    const resumo = calcularResumo(criarDespesasMock(), LOTES_MOCK, 300, 20, 4);

    expect(resumo.cenarios.map((cenario) => cenario.profit)).toEqual([220.96, 1420.96, 2620.96, 3820.96]);
    expect(resumo.cenarios[1]).toMatchObject({ revenue: 16924.9, averageTicket: 52.89, breakEven: 293.13 });
  });

  it("tira o público que falta dos últimos lotes primeiro", () => {
    const lotes: LotePlanejamento[] = [
      { id: "a", batch: "1º", price: 10, quantity: 5, salesStartDate: "2026-01-01" },
      { id: "b", batch: "2º", price: 20, quantity: 3, salesStartDate: "2026-02-01" },
    ];

    expect(distribuirPublico(lotes, 4)).toEqual([4, 0]);
    expect(distribuirPublico(lotes, 10)).toEqual([5, 5]);
  });

  it("não calcula indicadores sem lotes ou sem público esperado", () => {
    expect(calcularResumo([despesa({})], [], 300).atual).toBeNull();
    expect(calcularResumo([despesa({})], LOTES_MOCK, null).cenarios).toEqual([]);
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
  it("encontra o lote em que o evento empata", () => {
    const segmentos = segmentosDeLotes(LOTES_MOCK, 300);

    expect(segmentos.at(-1)).toMatchObject({ inicio: 270, fim: 300 });
    expect(loteDoIngresso(segmentos, 296)?.batch).toBe("3º Lote");
    expect(loteDoIngresso(segmentos, 1)?.batch).toBe("Promocional");
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

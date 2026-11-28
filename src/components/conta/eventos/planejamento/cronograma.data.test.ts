import { describe, expect, it } from "vitest";
import type { ParcelaDespesa } from "@/types/planejamento";
import {
  agruparPorSemana,
  deDataInput,
  estaAtrasada,
  inicioDaSemana,
  paraDataInput,
  rotuloSemana,
  totaisDoCronograma,
  valorDisponivel,
} from "./cronograma.data";

const local = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia, 12).toISOString();

function parcela(overrides: Partial<ParcelaDespesa>): ParcelaDespesa {
  return {
    id: "p",
    expenseId: "d1",
    expenseDescription: "Som",
    expenseGroup: "fixed",
    expenseCategory: "Estrutura",
    supplierName: null,
    dueDate: local(2026, 11, 10),
    amount: 100,
    status: "pendente",
    paidBy: null,
    paymentMethod: null,
    ...overrides,
  };
}

const hoje = new Date(2026, 10, 18, 9);

describe("cronograma de pagamentos", () => {
  it("começa a semana na segunda-feira", () => {
    expect(inicioDaSemana(new Date(2026, 10, 15)).getDate()).toBe(9);
    expect(inicioDaSemana(new Date(2026, 10, 16)).getDate()).toBe(16);
  });

  it("marca como atrasada só a parcela não paga com data anterior a hoje", () => {
    expect(estaAtrasada(parcela({ dueDate: local(2026, 11, 17) }), hoje)).toBe(true);
    expect(estaAtrasada(parcela({ dueDate: local(2026, 11, 18) }), hoje)).toBe(false);
    expect(estaAtrasada(parcela({ dueDate: local(2026, 11, 17), status: "pago" }), hoje)).toBe(false);
    expect(estaAtrasada(parcela({ dueDate: local(2026, 11, 30), status: "atrasado" }), hoje)).toBe(true);
  });

  it("agrupa por semana com totais que batem com as parcelas e ignora canceladas", () => {
    const semanas = agruparPorSemana(
      [
        parcela({ id: "a", dueDate: local(2026, 11, 12), amount: 400, status: "pago" }),
        parcela({ id: "b", dueDate: local(2026, 11, 10), amount: 150.5 }),
        parcela({ id: "c", dueDate: local(2026, 11, 11), amount: 999, status: "cancelado" }),
        parcela({ id: "d", dueDate: local(2026, 11, 30), amount: 600 }),
      ],
      local(2026, 12, 3),
      hoje,
    );

    expect(semanas).toHaveLength(2);
    expect(semanas[0]).toMatchObject({ total: 550.5, pago: 400, atrasadas: 1, semanasAteEvento: 3 });
    expect(semanas[0].parcelas.map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(semanas[1]).toMatchObject({ total: 600, semanasAteEvento: 0 });
    expect(rotuloSemana(semanas[1])).toContain("semana do evento");
    expect(rotuloSemana(semanas[0])).toContain("3 semanas antes do evento");
  });

  it("resume o cronograma em pago, a pagar e atrasado", () => {
    expect(
      totaisDoCronograma(
        [
          parcela({ amount: 400, status: "pago" }),
          parcela({ amount: 100, dueDate: local(2026, 11, 1) }),
          parcela({ amount: 50, dueDate: local(2026, 12, 1) }),
        ],
        hoje,
      ),
    ).toEqual({ total: 550, pago: 400, aPagar: 150, atrasado: 100, quantidadeAtrasadas: 1 });
  });

  it("calcula quanto da despesa ainda pode virar parcela", () => {
    const parcelas = [
      parcela({ id: "a", amount: 400.1 }),
      parcela({ id: "b", amount: 100, status: "cancelado" }),
      parcela({ id: "c", amount: 50, expenseId: "outra" }),
    ];

    expect(valorDisponivel({ id: "d1", amount: 1000 }, parcelas)).toBe(599.9);
    expect(valorDisponivel({ id: "d1", amount: 1000 }, parcelas, "a")).toBe(1000);
    expect(valorDisponivel({ id: "d1", amount: 300 }, parcelas)).toBe(0);
  });

  it("converte entre o campo de data e ISO sem trocar o dia", () => {
    expect(paraDataInput(deDataInput("2026-11-10"))).toBe("2026-11-10");
  });
});

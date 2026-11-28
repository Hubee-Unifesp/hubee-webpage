import type { DespesaPlanejamento, ParcelaDespesa } from "@/types/planejamento";
import { arredondar } from "./planejamento.data";

const DIA_MS = 24 * 60 * 60 * 1000;

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function inicioDaSemana(data: Date): Date {
  const dia = inicioDoDia(data);
  const deslocamento = (dia.getDay() + 6) % 7;
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() - deslocamento);
}

export function estaAtrasada(parcela: Pick<ParcelaDespesa, "dueDate" | "status">, hoje: Date = new Date()): boolean {
  if (parcela.status === "pago" || parcela.status === "cancelado") return false;
  if (parcela.status === "atrasado") return true;
  return inicioDoDia(new Date(parcela.dueDate)).getTime() < inicioDoDia(hoje).getTime();
}

export interface SemanaCronograma {
  inicio: Date;
  fim: Date;
  parcelas: ParcelaDespesa[];
  total: number;
  pago: number;
  atrasadas: number;
  semanasAteEvento: number | null;
}

export function agruparPorSemana(
  parcelas: readonly ParcelaDespesa[],
  dataEvento: string | null,
  hoje: Date = new Date(),
): SemanaCronograma[] {
  const semanas = new Map<number, ParcelaDespesa[]>();
  for (const parcela of parcelas) {
    const chave = inicioDaSemana(new Date(parcela.dueDate)).getTime();
    const lista = semanas.get(chave) ?? [];
    lista.push(parcela);
    semanas.set(chave, lista);
  }
  const semanaDoEvento = dataEvento ? inicioDaSemana(new Date(dataEvento)).getTime() : null;

  return [...semanas.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chave, itens]) => {
      const ativas = itens.filter((parcela) => parcela.status !== "cancelado");
      const ordenadas = [...itens].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const inicio = new Date(chave);
      return {
        inicio,
        fim: new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6),
        parcelas: ordenadas,
        total: arredondar(ativas.reduce((soma, parcela) => soma + parcela.amount, 0)),
        pago: arredondar(ativas.filter((parcela) => parcela.status === "pago").reduce((soma, parcela) => soma + parcela.amount, 0)),
        atrasadas: itens.filter((parcela) => estaAtrasada(parcela, hoje)).length,
        semanasAteEvento: semanaDoEvento === null ? null : Math.round((semanaDoEvento - chave) / (7 * DIA_MS)),
      };
    });
}

export function totaisDoCronograma(parcelas: readonly ParcelaDespesa[], hoje: Date = new Date()) {
  const ativas = parcelas.filter((parcela) => parcela.status !== "cancelado");
  const total = arredondar(ativas.reduce((soma, parcela) => soma + parcela.amount, 0));
  const pago = arredondar(ativas.filter((parcela) => parcela.status === "pago").reduce((soma, parcela) => soma + parcela.amount, 0));
  const atrasadas = ativas.filter((parcela) => estaAtrasada(parcela, hoje));
  return {
    total,
    pago,
    aPagar: arredondar(total - pago),
    atrasado: arredondar(atrasadas.reduce((soma, parcela) => soma + parcela.amount, 0)),
    quantidadeAtrasadas: atrasadas.length,
  };
}

export function valorDisponivel(
  despesa: Pick<DespesaPlanejamento, "id" | "amount">,
  parcelas: readonly ParcelaDespesa[],
  ignorarParcelaId?: string,
): number {
  const usado = parcelas
    .filter((parcela) => parcela.expenseId === despesa.id && parcela.status !== "cancelado" && parcela.id !== ignorarParcelaId)
    .reduce((soma, parcela) => soma + Math.round(parcela.amount * 100), 0);
  return Math.max(0, Math.round(despesa.amount * 100) - usado) / 100;
}

export function rotuloSemana(semana: Pick<SemanaCronograma, "inicio" | "fim" | "semanasAteEvento">): string {
  const formatar = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  const periodo = `${formatar.format(semana.inicio)} a ${formatar.format(semana.fim)}`.replace(/\./g, "");
  if (semana.semanasAteEvento === null) return periodo;
  if (semana.semanasAteEvento === 0) return `${periodo} · semana do evento`;
  if (semana.semanasAteEvento < 0) return `${periodo} · depois do evento`;
  return `${periodo} · ${semana.semanasAteEvento === 1 ? "1 semana" : `${semana.semanasAteEvento} semanas`} antes do evento`;
}

export function paraDataInput(iso: string): string {
  const data = new Date(iso);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function deDataInput(valor: string): string {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia, 12).toISOString();
}

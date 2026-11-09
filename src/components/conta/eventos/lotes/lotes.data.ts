import type { LoteIngresso, ModalidadeLote } from "@/types/lote-ingresso";

export const MODALIDADE_LABEL: Record<ModalidadeLote, string> = {
  inteira: "Inteira",
  meia: "Meia-entrada",
  estudante: "Estudante",
  vip: "VIP",
  cortesia: "Cortesia",
};

export const MODALIDADES_OPCOES = (Object.keys(MODALIDADE_LABEL) as ModalidadeLote[]).map((value) => ({
  value,
  label: MODALIDADE_LABEL[value],
}));

export type StatusVendaLote = "a-venda" | "em-breve" | "encerrado" | "esgotado";

export const STATUS_VENDA_LABEL: Record<StatusVendaLote, string> = {
  "a-venda": "À venda",
  "em-breve": "Em breve",
  encerrado: "Encerrado",
  esgotado: "Esgotado",
};

export function getVendidos(lote: Pick<LoteIngresso, "quantity" | "available">): number {
  return Math.max(0, lote.quantity - lote.available);
}

export function getStatusVenda(lote: LoteIngresso, agora: Date = new Date()): StatusVendaLote {
  if (lote.available <= 0) return "esgotado";
  const inicio = lote.salesStartDate ? new Date(lote.salesStartDate).getTime() : null;
  const fim = lote.salesEndDate ? new Date(lote.salesEndDate).getTime() : null;
  if (inicio !== null && agora.getTime() < inicio) return "em-breve";
  if (fim !== null && agora.getTime() >= fim) return "encerrado";
  return "a-venda";
}

const dataFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatarData(iso: string): string {
  return dataFormatter.format(new Date(iso)).replace(",", " às").replace(/\./g, "");
}

/** Texto do período de vendas: "10 nov 2026 às 09:00 até 20 nov 2026 às 18:00". */
export function formatarJanelaVendas(lote: Pick<LoteIngresso, "salesStartDate" | "salesEndDate">): string {
  const { salesStartDate: inicio, salesEndDate: fim } = lote;
  if (inicio && fim) return `${formatarData(inicio)} até ${formatarData(fim)}`;
  if (inicio) return `A partir de ${formatarData(inicio)}`;
  if (fim) return `Até ${formatarData(fim)}`;
  return "Sem período definido";
}

export const numeroFormatter = new Intl.NumberFormat("pt-BR");

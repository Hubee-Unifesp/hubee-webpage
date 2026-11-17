import { CalendarClock } from "lucide-react";
import { formatPrice } from "@/components/home/events/format";
import { cn } from "@/lib/utils";
import type { LoteIngresso } from "@/types/lote-ingresso";
import { LoteAcoes } from "./lote-acoes";
import {
  formatarJanelaVendas,
  getStatusVenda,
  getVendidos,
  MODALIDADE_LABEL,
  numeroFormatter,
  STATUS_VENDA_LABEL,
  type StatusVendaLote,
} from "./lotes.data";

const statusClassName: Record<StatusVendaLote, string> = {
  "a-venda":
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "em-breve":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  encerrado:
    "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300",
  esgotado: "border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300",
};

interface LoteCardProps {
  lote: LoteIngresso;
  podeGerenciar: boolean;
  onEditar: (lote: LoteIngresso) => void;
  onExcluir: (lote: LoteIngresso) => void;
}

/** Card de um lote: nome, modalidade, preço, saldo de ingressos e período de vendas. */
export function LoteCard({ lote, podeGerenciar, onEditar, onExcluir }: LoteCardProps) {
  const status = getStatusVenda(lote);
  const vendidos = getVendidos(lote);
  const percentualVendido = lote.quantity > 0 ? Math.min(100, Math.round((vendidos / lote.quantity) * 100)) : 0;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-hubee-200 bg-white p-4 shadow-sm dark:border-hubee-50/10 dark:bg-hubee-50/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="text-base font-semibold break-words">{lote.batch}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full border border-hubee-400/70 bg-hubee-100 px-2.5 py-0.5 text-xs font-semibold text-hubee-800 dark:border-hubee-500 dark:bg-hubee-800 dark:text-hubee-50">
              {MODALIDADE_LABEL[lote.modality]}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                statusClassName[status],
              )}
            >
              {STATUS_VENDA_LABEL[status]}
            </span>
          </div>
        </div>
        <LoteAcoes lote={lote} podeGerenciar={podeGerenciar} onEditar={onEditar} onExcluir={onExcluir} className="shrink-0" />
      </div>

      <p className="text-2xl font-bold">{formatPrice(lote.price)}</p>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm">
          <span className="font-semibold">{numeroFormatter.format(lote.available)}</span> disponíveis de{" "}
          <span className="font-semibold">{numeroFormatter.format(lote.quantity)}</span>
        </p>
        <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-hubee-200 dark:bg-hubee-50/15">
          <div className="h-full rounded-full bg-hubee-600 dark:bg-hubee-400" style={{ width: `${percentualVendido}%` }} />
        </div>
        <p className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
          {numeroFormatter.format(vendidos)} {vendidos === 1 ? "vendido" : "vendidos"}
        </p>
      </div>

      <p className="flex items-start gap-1.5 border-t border-hubee-200 pt-3 text-xs text-hubee-750 dark:border-hubee-50/10 dark:text-hubee-100">
        <CalendarClock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        <span>
          <span className="sr-only">Período de vendas: </span>
          {formatarJanelaVendas(lote)}
        </span>
      </p>
    </li>
  );
}

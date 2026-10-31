import { QrCode } from "lucide-react";
import { formatEventDate } from "@/components/home/events/format";
import { cn } from "@/lib/utils";
import type { IngressoPedido, StatusIngresso } from "@/types/pedido";

const statusIngressoLabel: Partial<Record<StatusIngresso, string>> = {
  usado: "Ingresso já utilizado na portaria",
  cancelado: "Ingresso cancelado",
};

const statusBadgeConfig: Record<StatusIngresso, { label: string; className: string }> = {
  emitido: { label: "Válido", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  usado: { label: "Utilizado", className: "bg-hubee-neutral-50 text-hubee-neutral-500 border-hubee-neutral-200" },
  cancelado: { label: "Cancelado", className: "bg-rose-100 text-rose-800 border-rose-300" },
};

interface IngressoCardProps {
  ingresso: IngressoPedido;
  participante: string;
}

/** Ingresso emitido: dados do participante, código e QR code (placeholder até haver biblioteca de QR). */
export function IngressoCard({ ingresso, participante }: IngressoCardProps) {
  const { evento } = ingresso;
  const statusLabel = statusIngressoLabel[ingresso.status];
  const badge = statusBadgeConfig[ingresso.status];
  const inativo = ingresso.status !== "emitido";

  return (
    <article className={cn("flex flex-col gap-5 rounded-xl border border-hubee-300 bg-hubee-100 p-5 text-hubee-750 md:flex-row md:items-center md:justify-between", inativo && "opacity-75")}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", badge.className)}>
            {badge.label}
          </span>
          <span className="text-xs font-medium text-hubee-neutral-300 dark:text-hubee-200">
            {ingresso.tipo}
          </span>
        </div>
        <h3 className="font-heading text-2xl leading-tight font-bold text-hubee-800">{evento?.nome ?? "Ingresso"}</h3>
        {participante && <p className="font-heading text-lg font-semibold text-hubee-600">{participante}</p>}
        {evento && (
          <p className="mt-2 text-xs font-medium">
            {evento.local && `${evento.local} - `}
            {formatEventDate(evento.dataInicio, evento.dataFim)}
          </p>
        )}
        <p className="mt-4 text-sm font-bold text-hubee-600">Código: {ingresso.codigo}</p>
        <p className="text-xs">{statusLabel ?? "Apresente este código na entrada do evento."}</p>
      </div>

      {/* TODO(orders-api): gerar o QR code real a partir do código do ingresso. */}
      <div
        role="img"
        aria-label={`QR code do ingresso ${ingresso.codigo}`}
        className="flex aspect-square w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-hubee-600/60 bg-hubee-300 text-hubee-600 md:w-44"
      >
        <QrCode aria-hidden="true" className="size-1/2" strokeWidth={1.5} />
      </div>
    </article>
  );
}

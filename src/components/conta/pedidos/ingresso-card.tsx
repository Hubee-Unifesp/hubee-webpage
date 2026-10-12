import { QrCode } from "lucide-react";
import { formatEventDate } from "@/components/home/events/format";
import type { EventoPedido, IngressoPedido, StatusIngresso } from "@/types/pedido";

const statusIngressoLabel: Partial<Record<StatusIngresso, string>> = {
  usado: "Ingresso já utilizado",
  cancelado: "Ingresso cancelado",
};

interface IngressoCardProps {
  ingresso: IngressoPedido;
  /** `null` quando os dados do evento não puderam ser carregados. */
  evento: EventoPedido | null;
  participante: string;
}

/** Ingresso emitido: dados do participante, código e QR code (placeholder até haver biblioteca de QR). */
export function IngressoCard({ ingresso, evento, participante }: IngressoCardProps) {
  const statusLabel = statusIngressoLabel[ingresso.status];

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-hubee-300 bg-hubee-100 p-5 text-hubee-750 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-heading text-2xl leading-tight font-bold text-hubee-800">{evento?.nome ?? "Ingresso"}</h3>
        {participante && <p className="font-heading text-lg font-semibold text-hubee-600">{participante}</p>}
        <p className="font-heading text-base">{ingresso.tipo}</p>
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

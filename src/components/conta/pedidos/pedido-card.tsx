import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { categoryConfig } from "@/components/home/events/categories.config";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import { cn } from "@/lib/utils";
import type { Pedido } from "@/types/pedido";
import { formatOrderDateTime, formatPaymentMethod } from "./format";
import { StatusBadge } from "./status-pedido";

/** Linha compacta de pedido da lista "Meus pedidos": a linha inteira leva ao detalhe. */
export function PedidoCard({ pedido }: { pedido: Pedido }) {
  // Um pedido pode ter ingressos de mais de um evento: a linha mostra o primeiro e conta os outros.
  const [evento = null] = pedido.eventos;
  const outrosEventos = pedido.eventos.length - 1;
  const href = `/conta/pedidos/${pedido.id}`;
  const categoria = categoryConfig[evento?.categoria ?? "outros"];
  const Icone = evento ? categoria.icon : ShoppingBag;
  const qtdIngressos = pedido.itens.reduce((total, item) => total + item.quantidade, 0) || pedido.ingressos.length;

  const meta = [
    `#${pedido.numero}`,
    formatOrderDateTime(pedido.criadoEm),
    pedido.metodoPagamento ? formatPaymentMethod(pedido.metodoPagamento) : null,
    qtdIngressos > 0 ? `${qtdIngressos} ${qtdIngressos === 1 ? "ingresso" : "ingressos"}` : null,
  ].filter(Boolean);

  return (
    <Link
      href={href}
      aria-label={`Pedido ${pedido.numero}${evento ? `, ${evento.nome}` : ""}, ${formatPrice(pedido.total)}`}
      className="group flex items-center gap-3 px-3 py-3 text-hubee-750 outline-none transition-colors hover:bg-hubee-200/60 focus-visible:bg-hubee-200/60 focus-visible:ring-3 focus-visible:ring-hubee-800 focus-visible:ring-inset md:gap-4 md:px-4"
    >
      <span
        aria-hidden="true"
        className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg md:size-12", categoria.mediaClassName)}
      >
        <Icone strokeWidth={1.5} className="size-5 md:size-6" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-heading text-base leading-tight font-bold text-hubee-800">
            {evento ? evento.nome : `Pedido #${pedido.numero}`}
          </h3>
          {outrosEventos > 0 && (
            <span className="shrink-0 rounded-full bg-hubee-200 px-2 py-0.5 text-[10px] font-semibold text-hubee-800">
              +{outrosEventos}
            </span>
          )}
        </div>
        {evento && (
          <p className="truncate text-xs font-medium text-hubee-800">
            {evento.local && `${evento.local} · `}
            {formatEventDate(evento.dataInicio, evento.dataFim)}
          </p>
        )}
        <p className="truncate text-xs text-hubee-neutral-300">{meta.join(" · ")}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-bold text-hubee-800 md:text-base">{formatPrice(pedido.total)}</span>
        <StatusBadge status={pedido.status} />
      </div>

      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-hubee-600 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

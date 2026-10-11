import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryPill, EventMedia } from "@/components/home/events/event-media";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import type { Pedido } from "@/types/pedido";
import { StatusBadge } from "./status-pedido";

/** Cartão de pedido da lista "Meus pedidos". */
export function PedidoCard({ pedido }: { pedido: Pedido }) {
  const { evento } = pedido;
  const href = `/conta/pedidos/${pedido.id}`;

  return (
    <article className="flex h-full overflow-hidden rounded-xl border border-hubee-400 bg-hubee-100 text-hubee-750 shadow-sm">
      <EventMedia category={evento.categoria} startDate={evento.dataInicio} className="min-h-36 w-2/5 shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <CategoryPill category={evento.categoria} />
          <StatusBadge status={pedido.status} />
        </div>

        <h3 className="mt-1 font-heading text-lg leading-tight font-bold text-hubee-800">{evento.nome}</h3>
        <p className="line-clamp-1 text-xs">{evento.descricao}</p>
        <p className="line-clamp-2 text-xs font-medium text-hubee-800">
          {evento.local} · {formatEventDate(evento.dataInicio, evento.dataFim)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="flex flex-col leading-tight">
            <span className="text-[10px]">valor</span>
            <span className="text-base font-bold text-hubee-800">{formatPrice(pedido.total)}</span>
          </p>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-hubee-750 px-3 text-xs text-hubee-50 hover:bg-hubee-800 focus-visible:ring-hubee-800"
          >
            <Link href={href} aria-label={`Mais detalhes do pedido ${pedido.numero}, ${evento.nome}`}>
              mais detalhes
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

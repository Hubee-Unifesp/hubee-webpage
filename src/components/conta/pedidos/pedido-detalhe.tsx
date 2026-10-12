import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import type { Pedido } from "@/types/pedido";
import { IngressoCard } from "./ingresso-card";
import { StatusBadge } from "./status-pedido";

/** Detalhe do pedido: resumo da compra e ingressos. */
export function PedidoDetalhe({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/conta/pedidos"
          aria-label="Voltar para Meus pedidos"
          className="rounded-md p-1 outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <ContaPageTitle>Pedido #{pedido.numero}</ContaPageTitle>
        <StatusBadge status={pedido.status} />
      </div>

      <ContaCard title="Detalhes da Compra">
        <ul className="flex flex-col gap-3">
          {pedido.itens.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 text-xs">
              <div>
                <p className="font-medium">
                  {item.descricao} × {item.quantidade}
                </p>
                <p className="text-hubee-neutral-300 dark:text-hubee-200">{pedido.evento.nome}</p>
              </div>
              <p className="font-medium">{formatPrice(item.valorUnitario * item.quantidade)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-hubee-200 pt-4 dark:border-hubee-50/15">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-base font-bold text-hubee-600 dark:text-hubee-400">{formatPrice(pedido.total)}</p>
        </div>
      </ContaCard>

      <ContaCard title="Seus Ingressos">
        {pedido.ingressos.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {pedido.ingressos.map((ingresso) => (
              <li key={ingresso.id}>
                <IngressoCard ingresso={ingresso} evento={pedido.evento} />
              </li>
            ))}
          </ul>
        ) : (
          // Estado não desenhado no Figma: ingressos só existem para pedidos pagos.
          <p className="text-sm text-hubee-neutral-300 dark:text-hubee-200">
            Os ingressos ficam disponíveis aqui quando o pagamento do pedido é confirmado.
          </p>
        )}
      </ContaCard>
    </div>
  );
}

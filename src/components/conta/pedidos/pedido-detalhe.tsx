import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import type { Pedido } from "@/types/pedido";
import { formatOrderDateTime, formatPaymentMethod } from "./format";
import { IngressoCard } from "./ingresso-card";
import { StatusBadge } from "./status-pedido";

const mutedClassName = "text-sm text-hubee-neutral-300 dark:text-hubee-200";

/** Detalhe do pedido: resumo da compra e ingressos. */
export function PedidoDetalhe({ pedido, participante }: { pedido: Pedido; participante: string }) {
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
      <p className="-mt-3 text-xs text-hubee-neutral-300 dark:text-hubee-200">
        Pedido feito em {formatOrderDateTime(pedido.criadoEm)}
      </p>

      <ContaCard title="Detalhes da Compra">
        <div className="grid grid-cols-1 gap-2 pb-4 text-xs sm:grid-cols-2 text-hubee-750 dark:text-hubee-200 border-b border-hubee-200 dark:border-hubee-50/15">
          <p>
            Forma de pagamento:{" "}
            <strong className="font-semibold text-hubee-800 dark:text-hubee-50">
              {formatPaymentMethod(pedido.metodoPagamento)}
            </strong>
          </p>
          <p>
            Status do pedido:{" "}
            <strong className="font-semibold text-hubee-800 dark:text-hubee-50 capitalize">
              {pedido.status}
            </strong>
          </p>
          {pedido.pagoEm && (
            <p>
              Pagamento aprovado em:{" "}
              <strong className="font-semibold text-hubee-800 dark:text-hubee-50">
                {formatOrderDateTime(pedido.pagoEm)}
              </strong>
            </p>
          )}
          {participante && (
            <p>
              Comprador:{" "}
              <strong className="font-semibold text-hubee-800 dark:text-hubee-50">
                {participante}
              </strong>
            </p>
          )}
        </div>

        <div className="pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hubee-neutral-300 dark:text-hubee-200">
            Itens do Pedido
          </h4>
          {pedido.itens.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {pedido.itens.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 text-xs">
                  <div>
                    <p className="font-medium text-hubee-800 dark:text-hubee-50">
                      {item.descricao} × {item.quantidade}
                    </p>
                    {item.eventoNome && <p className="text-hubee-neutral-300 dark:text-hubee-200">{item.eventoNome}</p>}
                    <p className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                      {formatPrice(item.valorUnitario)} cada
                    </p>
                  </div>
                  <p className="font-semibold text-hubee-800 dark:text-hubee-50">
                    {formatPrice(item.valorUnitario * item.quantidade)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            // A API não guarda os itens do pedido: só dá para listá-los a partir dos ingressos emitidos.
            <p className={mutedClassName}>
              Os itens aparecem aqui depois que o pagamento do pedido é confirmado e os ingressos são emitidos.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-hubee-200 pt-4 dark:border-hubee-50/15">
          <p className="text-sm font-semibold">{pedido.status === "pago" ? "Total Pago" : "Total"}</p>
          <p className="text-base font-bold text-hubee-600 dark:text-hubee-400">{formatPrice(pedido.total)}</p>
        </div>
      </ContaCard>

      <ContaCard title="Seus Ingressos">
        {pedido.ingressos.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {pedido.ingressos.map((ingresso) => (
              <li key={ingresso.id}>
                <IngressoCard ingresso={ingresso} participante={participante} />
              </li>
            ))}
          </ul>
        ) : (
          // Estado não desenhado no Figma: ingressos só existem para pedidos pagos.
          <p className={mutedClassName}>
            {pedido.status === "pago"
              ? "Os ingressos deste pedido ainda não foram emitidos. Volte em instantes."
              : "Os ingressos ficam disponíveis aqui quando o pagamento do pedido é confirmado."}
          </p>
        )}
      </ContaCard>
    </div>
  );
}

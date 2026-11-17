"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/api/orders";
import type { Pedido } from "@/types/pedido";
import { formatOrderDateTime, formatPaymentMethod } from "./format";
import { IngressoCard } from "./ingresso-card";
import { StatusBadge } from "./status-pedido";

const mutedClassName = "text-sm text-hubee-neutral-300 dark:text-hubee-200";

/** Detalhe do pedido: resumo da compra, ações e ingressos. */
export function PedidoDetalhe({ pedido, participante }: { pedido: Pedido; participante: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [evento = null] = pedido.eventos;

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(pedido.id);
      router.refresh();
      window.location.reload();
    } catch {
      setCancelError("Não foi possível cancelar o pedido. Tente novamente.");
      setCancelling(false);
    }
  };

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

      {evento && (
        <ContaCard title="Evento">
          <div className="flex flex-col gap-1 text-xs">
            <h4 className="font-heading text-base font-bold text-hubee-800 dark:text-hubee-50">
              {evento.nome}
            </h4>
            {evento.dataInicio && (
              <p className="text-hubee-neutral-300 dark:text-hubee-200">
                {evento.local && `${evento.local} · `}
                {formatEventDate(evento.dataInicio, evento.dataFim)}
              </p>
            )}
          </div>
        </ContaCard>
      )}

      {pedido.status === "pendente" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-hubee-200 bg-hubee-50/50 p-4 dark:border-hubee-50/15 dark:bg-hubee-750/30">
          <Button
            variant="hubee_800"
            className="cursor-pointer"
            onClick={() => router.push("/checkout")}
          >
            <CheckCircle2 className="size-4 mr-2" />
            Concluir Pagamento
          </Button>

          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={cancelling}
            onClick={handleCancel}
          >
            <XCircle className="size-4 mr-2" />
            {cancelling ? "Cancelando..." : "Cancelar Pedido"}
          </Button>

          {cancelError && (
            <p className="w-full text-xs text-red-600 dark:text-red-400">{cancelError}</p>
          )}
        </div>
      )}

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
            <p className={mutedClassName}>
              Nenhum item encontrado neste pedido.
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, QrCode, Ticket } from "lucide-react";
import { TicketQrModal } from "./ticket-qr-modal";
import { Button } from "@/components/ui/button";
import { categoryConfig } from "@/components/home/events/categories.config";
import { eventCardClassName } from "@/components/home/events/event-card";
import { CategoryPill, EventMedia, HexPattern } from "@/components/home/events/event-media";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import { eventHref } from "@/components/home/events/links";
import { cn } from "@/lib/utils";
import type { MeuIngresso } from "@/types/ingresso";
import type { StatusIngresso } from "@/types/pedido";

type StatusCartao = StatusIngresso | "encerrado";

const statusConfig: Record<StatusCartao, { label: string; className: string }> = {
  emitido: { label: "Válido", className: "bg-emerald-100 text-emerald-800" },
  usado: { label: "Utilizado", className: "bg-hubee-neutral-50 text-hubee-neutral-500" },
  cancelado: { label: "Cancelado", className: "bg-rose-100 text-rose-800" },
  encerrado: { label: "Encerrado", className: "bg-hubee-neutral-50 text-hubee-neutral-500" },
};

interface MeuIngressoCardProps {
  ingresso: MeuIngresso;
  /** Ingresso válido de um evento que já terminou. */
  encerrado?: boolean;
}

/** Cartão de ingresso no formato do cartão de evento da busca, com o picote e os dados do ingresso. */
export function MeuIngressoCard({ ingresso, encerrado = false }: MeuIngressoCardProps) {
  const { evento } = ingresso;
  const status = statusConfig[ingresso.status === "emitido" && encerrado ? "encerrado" : ingresso.status];
  const inativo = ingresso.status !== "emitido" || encerrado;
  const nome = evento?.nome ?? "Evento indisponível";
  const [qrModalOpen, setQrModalOpen] = useState(false);

  return (
    <article className={cn(eventCardClassName, "w-full min-w-0")}>
      <div className={cn("relative", inativo && "opacity-60")}>
        {evento ? (
          <EventMedia
            category={evento.categoria}
            startDate={evento.dataInicio}
            className="h-24 md:h-32"
          />
        ) : (
          // Sem o evento não há data nem categoria: mostra o padrão neutro com o ícone de ingresso.
          <div
            aria-hidden="true"
            className={cn(
              "relative flex h-24 items-center justify-center overflow-hidden md:h-32",
              categoryConfig.outros.mediaClassName,
            )}
          >
            <HexPattern className={categoryConfig.outros.patternClassName} />
            <Ticket strokeWidth={1.5} className="relative size-9" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-3 md:p-4", inativo && "opacity-70")}>
        <div className="flex flex-wrap gap-1.5">
          {evento && <CategoryPill category={evento.categoria} />}
          <span className="inline-flex w-fit rounded-full bg-hubee-750 px-2.5 py-0.5 text-xs font-medium text-hubee-50 dark:bg-hubee-400 dark:text-hubee-800">
            {ingresso.tipo}
          </span>
        </div>
        <h3 className="mt-3 font-sans text-sm leading-snug font-semibold md:text-base">
          {evento ? (
            <Link
              href={eventHref(evento.id)}
              className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400"
            >
              {nome}
            </Link>
          ) : (
            nome
          )}
        </h3>
        {evento && (
          <>
            <p className="mt-2 truncate text-xs text-hubee-neutral-300 dark:text-hubee-100">
              {formatEventDate(evento.dataInicio, evento.dataFim)}
            </p>
            {evento.local && (
              <p className="mt-0.5 truncate text-xs text-hubee-neutral-300 dark:text-hubee-100">{evento.local}</p>
            )}
          </>
        )}
      </div>

      {/* Picote: as meias-luas usam a cor de fundo da página para "recortar" o cartão. */}
      <div aria-hidden="true" className="relative flex h-4 items-center overflow-hidden">
        <span className="absolute -left-2 size-4 rounded-full border border-hubee-400 bg-hubee-50 dark:border-hubee-500 dark:bg-hubee-800" />
        <span className="mx-4 w-full border-t border-dashed border-hubee-400 dark:border-hubee-500" />
        <span className="absolute -right-2 size-4 rounded-full border border-hubee-400 bg-hubee-50 dark:border-hubee-500 dark:bg-hubee-800" />
      </div>

      <div className="flex min-w-0 flex-col gap-2 p-3 pt-2 md:p-4 md:pt-2">
        <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[10px] font-semibold tracking-wide uppercase">Código</span>
            <span
              title={ingresso.codigo}
              className="block max-w-full truncate font-mono text-xs font-bold text-hubee-800 sm:text-sm dark:text-hubee-50"
            >
              {ingresso.codigo}
            </span>
            <span className="mt-1 truncate text-[11px] text-hubee-neutral-300 dark:text-hubee-100">
              Pedido #{ingresso.pedidoNumero}
              {ingresso.valor !== null && ` · ${formatPrice(ingresso.valor)}`}
            </span>
          </div>
          <Button
            variant="hubee_750"
            size="sm"
            className="w-full shrink-0 hover:text-hubee-400 focus-visible:ring-hubee-400 sm:w-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:hover:text-hubee-800"
            type="button"
            onClick={() => setQrModalOpen(true)}
            aria-label={`Exibir QR Code do ingresso de ${nome}`}
          >
            <QrCode aria-hidden="true" className="size-4" />
            Exibir QR Code
          </Button>
        </div>

        <div className="flex justify-end border-t border-hubee-200/60 pt-1.5 dark:border-hubee-700/60">
          <Link
            href={`/conta/pedidos/${ingresso.pedidoId}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-hubee-neutral-300 hover:text-hubee-800 hover:underline dark:text-hubee-200 dark:hover:text-hubee-50"
          >
            Ver detalhes do pedido
            <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </div>

      <TicketQrModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        ingresso={ingresso}
        statusLabel={status.label}
        statusClassName={status.className}
      />
    </article>
  );
}

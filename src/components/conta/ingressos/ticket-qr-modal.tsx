"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, QrCode } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { CategoryPill } from "@/components/home/events/event-media";
import { formatEventDate } from "@/components/home/events/format";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { MeuIngresso } from "@/types/ingresso";

interface TicketQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso: MeuIngresso;
  statusLabel?: string;
  statusClassName?: string;
}

/** Modal com o QR Code de entrada e o código alfanumérico validador do ingresso (GOL-189). */
export function TicketQrModal({
  open,
  onOpenChange,
  ingresso,
  statusLabel = "Válido",
  statusClassName = "bg-emerald-100 text-emerald-800",
}: TicketQrModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { evento } = ingresso;
  const nomeEvento = evento?.nome ?? "Evento";

  async function handleCopyCode() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(ingresso.codigo);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="QR Code do Ingresso"
      description="Apresente este código na portaria para validação e check-in."
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Link
            href={`/conta/pedidos/${ingresso.pedidoId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-hubee-neutral-300 hover:text-hubee-800 hover:underline dark:text-hubee-200 dark:hover:text-hubee-50"
          >
            Ver detalhes do pedido
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-center">
        {/* Informações do Evento e Titular */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {evento && <CategoryPill category={evento.categoria} />}
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", statusClassName)}>
              {statusLabel}
            </span>
          </div>
          <h4 className="mt-1 font-heading text-lg font-bold text-hubee-800 dark:text-hubee-50 sm:text-xl">
            {nomeEvento}
          </h4>
          {user?.fullName && (
            <p className="text-xs font-semibold text-hubee-600 dark:text-hubee-300">
              Titular: {user.fullName}
            </p>
          )}
          <p className="text-xs font-medium text-hubee-750 dark:text-hubee-200">
            {ingresso.tipo}
          </p>
          {evento && (
            <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
              {evento.local && `${evento.local} · `}
              {formatEventDate(evento.dataInicio, evento.dataFim)}
            </p>
          )}
        </div>

        {/* QR Code visual central */}
        <div
          role="img"
          aria-label={`QR code do ingresso ${ingresso.codigo}`}
          className="mx-auto flex aspect-square w-48 max-w-full items-center justify-center rounded-2xl border-2 border-dashed border-hubee-400 bg-white p-4 shadow-inner dark:border-hubee-500 dark:bg-hubee-800"
        >
          <QrCode
            aria-hidden="true"
            className="size-36 text-hubee-800 dark:text-hubee-50"
            strokeWidth={1.5}
          />
        </div>

        {/* Código Alfanumérico e Ação de Copiar */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-hubee-neutral-300 dark:text-hubee-200">
            Código Validador
          </p>
          <div className="rounded-lg border border-hubee-300 bg-hubee-100 p-2.5 font-mono text-[11px] leading-relaxed break-all text-hubee-800 select-all dark:border-hubee-600 dark:bg-hubee-900 dark:text-hubee-100">
            {ingresso.codigo}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="mx-auto flex h-8 items-center gap-1.5 px-3 text-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check aria-hidden="true" className="size-3.5 text-emerald-600" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="size-3.5" />
                Copiar código
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

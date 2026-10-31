"use client";

import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Clock, Copy, QrCode } from "lucide-react";
import { ContaCard } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import {
  formatPixCountdown,
  type CheckoutBuyerSummary,
  type CheckoutOrderData,
} from "./checkout.data";

interface CheckoutPixPaymentViewProps {
  order: CheckoutOrderData;
  buyer: CheckoutBuyerSummary;
  secondsRemaining: number;
  onConfirmPixPayment: () => void;
  onBackToForm: () => void;
}

/** Etapa dedicada pós-confirmação para pagamento via PIX com QR Code e timer regressivo real (GOL-180). */
export function CheckoutPixPaymentView({
  order,
  buyer,
  secondsRemaining,
  onConfirmPixPayment,
  onBackToForm,
}: CheckoutPixPaymentViewProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyPixKey() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(order.pix.copyPasteKey);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <section
      aria-labelledby="checkout-pix-titulo"
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
    >
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-hubee-600 dark:text-hubee-400">
          Checkout · Pagamento via PIX
        </p>
        <h1
          id="checkout-pix-titulo"
          className="font-heading text-2xl leading-tight font-bold tracking-tight text-hubee-800 sm:text-3xl dark:text-hubee-50"
        >
          Aprovação imediata, sem complicação.
        </h1>
        <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
          Total a pagar:{" "}
          <strong className="font-semibold text-hubee-800 dark:text-hubee-50">
            {formatPrice(order.totalAmount)}
          </strong>{" "}
          • Comprador: {buyer.fullName} ({buyer.email})
        </p>
      </header>

      <ContaCard title="2. Forma de Pagamento">
        <div className="flex flex-col gap-5 rounded-xl border border-hubee-300 bg-hubee-100 p-4 text-hubee-750 sm:flex-row sm:items-center sm:p-6">
          <div
            role="img"
            aria-label="QR Code dinâmico para pagamento via PIX"
            className="mx-auto flex aspect-square w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-hubee-600/60 bg-hubee-300 text-hubee-600 sm:mx-0"
          >
            <QrCode aria-hidden="true" className="size-20" strokeWidth={1.5} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span
              role="timer"
              aria-label={`Tempo restante para pagamento PIX: ${formatPixCountdown(secondsRemaining)}`}
              className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800 tabular-nums"
            >
              <Clock aria-hidden="true" className="size-3" />
              Expira em {formatPixCountdown(secondsRemaining)}
            </span>

            <h3 className="text-sm font-bold text-hubee-800 sm:text-base">
              Escaneie o QR Code ou copie a chave PIX
            </h3>

            <p className="text-xs leading-relaxed text-hubee-750">
              Abra o app do seu banco, escolha PIX Copia e Cola ou leitor de QR Code. A confirmação
              é instantânea.
            </p>

            <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div
                aria-label="Chave PIX Copia e Cola"
                className="min-w-0 flex-1 rounded-lg border border-hubee-200 bg-white px-3 py-2.5 font-mono text-[11px] leading-snug break-all text-hubee-800 select-all"
              >
                {order.pix.displayKey}
              </div>

              <Button
                type="button"
                variant="hubee_800"
                onClick={handleCopyPixKey}
                className="h-10 shrink-0 cursor-pointer px-4 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check aria-hidden="true" className="size-3.5" />
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
        </div>
      </ContaCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={onConfirmPixPayment}
          className="h-10 w-full cursor-pointer bg-hubee-400 px-5 text-xs font-bold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400 sm:w-auto"
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Já realizei o pagamento (Simular aprovação)
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBackToForm}
          className="h-10 w-full cursor-pointer border-hubee-200 bg-white px-5 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 sm:w-auto dark:border-hubee-750 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750/60"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar / Alterar forma de pagamento
        </Button>
      </div>
    </section>
  );
}


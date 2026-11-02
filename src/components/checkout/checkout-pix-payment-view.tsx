"use client";

import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Clock, Copy, Info, Loader2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ContaCard } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import {
  formatPixCountdown,
  type CheckoutBuyerSummary,
  type PedidoAguardandoPix,
} from "./checkout.data";

interface CheckoutPixPaymentViewProps {
  pedido: PedidoAguardandoPix;
  buyer: CheckoutBuyerSummary;
  secondsRemaining: number;
  /** Enquanto `POST /payments` ou o cancelamento estão em andamento. */
  isProcessing: boolean;
  onConfirmPixPayment: () => void;
  onBackToForm: () => void;
  onRegeneratePix: () => void;
}

/**
 * Etapa de pagamento PIX entre a criação do pedido e o pagamento (layout da GOL-180).
 * A cobrança é simulada: a API não tem gateway, então o pagamento só é registrado quando a
 * pessoa clica em "Já realizei o pagamento".
 */
export function CheckoutPixPaymentView({
  pedido,
  buyer,
  secondsRemaining,
  isProcessing,
  onConfirmPixPayment,
  onBackToForm,
  onRegeneratePix,
}: CheckoutPixPaymentViewProps) {
  const [copied, setCopied] = useState(false);
  const expirado = secondsRemaining <= 0;

  async function handleCopyPixKey() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(pedido.pixCopiaECola);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Sem permissão para o clipboard: o código continua selecionável na tela.
    }
  }

  return (
    <section aria-labelledby="checkout-pix-titulo" className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-hubee-600 dark:text-hubee-400">
          Pedido #{pedido.numero} · Pagamento via PIX
        </p>
        <h1
          id="checkout-pix-titulo"
          className="font-heading text-2xl leading-tight font-bold tracking-tight text-hubee-800 sm:text-3xl dark:text-hubee-50"
        >
          Aprovação imediata, sem complicação.
        </h1>
        <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
          Total a pagar:{" "}
          <strong className="font-semibold text-hubee-800 dark:text-hubee-50">{formatPrice(pedido.total)}</strong> •
          Comprador: {buyer.fullName} ({buyer.email})
        </p>
      </header>

      <p
        role="note"
        className="flex items-start gap-2 rounded-lg border border-hubee-300 bg-hubee-100 p-3 text-xs leading-relaxed text-hubee-750 dark:border-hubee-700 dark:bg-hubee-900/70 dark:text-hubee-200"
      >
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Ambiente de demonstração: esta cobrança PIX é simulada e não pode ser paga em um banco. Use o botão
          &quot;Já realizei o pagamento&quot; para confirmar.
        </span>
      </p>

      <ContaCard title="Pagamento via PIX">
        <div className="flex flex-col gap-5 rounded-xl border border-hubee-300 bg-hubee-100 p-4 text-hubee-750 sm:flex-row sm:items-center sm:p-6">
          {/* Fundo branco e traço preto fixos, como nos ingressos: QR invertido não é lido. */}
          <div
            role="img"
            aria-label="QR Code da cobrança PIX simulada"
            className="mx-auto flex aspect-square w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-hubee-600/60 bg-white p-3 sm:mx-0"
          >
            <QRCodeSVG
              value={pedido.pixCopiaECola}
              level="M"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#000000"
              className={expirado ? "size-full opacity-20" : "size-full"}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span
              role="timer"
              aria-label={`Tempo restante para pagamento PIX: ${formatPixCountdown(secondsRemaining)}`}
              className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800 tabular-nums"
            >
              <Clock aria-hidden="true" className="size-3" />
              {expirado ? "Cobrança expirada" : `Expira em ${formatPixCountdown(secondsRemaining)}`}
            </span>

            <h3 className="text-sm font-bold text-hubee-800 sm:text-base">
              {expirado ? "O prazo para pagamento terminou" : "Escaneie o QR Code ou copie o código PIX"}
            </h3>

            <p className="text-xs leading-relaxed text-hubee-750">
              {expirado
                ? "O pedido foi cancelado e os ingressos voltaram ao estoque. Gere um novo PIX para tentar de novo."
                : "Num pagamento real você abriria o app do banco e usaria PIX Copia e Cola ou o leitor de QR Code."}
            </p>

            {!expirado && (
              <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div
                  aria-label="Código PIX Copia e Cola"
                  className="min-w-0 flex-1 rounded-lg border border-hubee-200 bg-white px-3 py-2.5 font-mono text-[11px] leading-snug break-all text-hubee-800 select-all"
                >
                  {pedido.pixCopiaECola}
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
            )}
          </div>
        </div>
      </ContaCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {expirado ? (
          <Button
            type="button"
            onClick={onRegeneratePix}
            disabled={isProcessing}
            className="h-10 w-full cursor-pointer bg-hubee-400 px-5 text-xs font-bold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400 disabled:opacity-60 sm:w-auto"
          >
            {isProcessing ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="size-4" />
            )}
            Gerar novo PIX
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onConfirmPixPayment}
            disabled={isProcessing}
            className="h-10 w-full cursor-pointer bg-hubee-400 px-5 text-xs font-bold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400 disabled:opacity-60 sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Confirmando pagamento...
              </>
            ) : (
              <>
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Já realizei o pagamento
              </>
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onBackToForm}
          disabled={isProcessing}
          className="h-10 w-full cursor-pointer border-hubee-200 bg-white px-5 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 disabled:opacity-60 sm:w-auto dark:border-hubee-750 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750/60"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar / Alterar forma de pagamento
        </Button>
      </div>
    </section>
  );
}

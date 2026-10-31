"use client";

import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { CheckoutSimulationMode } from "./checkout.data";

interface CheckoutFeedbackModalsProps {
  mode: CheckoutSimulationMode;
  onCloseModal: () => void;
  onRegeneratePix: () => void;
  onSwitchToPix: () => void;
  onRetryCard: () => void;
  onBackToEvents: () => void;
}

/** Modais de feedback do Checkout: Processando, Timeout do PIX e Falha na Transação (GOL-180). */
export function CheckoutFeedbackModals({
  mode,
  onCloseModal,
  onRegeneratePix,
  onSwitchToPix,
  onRetryCard,
  onBackToEvents,
}: CheckoutFeedbackModalsProps) {
  return (
    <>
      <Modal
        open={mode === "processing"}
        onOpenChange={() => undefined}
        dismissible={false}
        tone="default"
        title="Processando seu pagamento..."
        description="Estamos confirmando a transação junto à operadora. Por favor, não feche nem atualize esta página."
        className="text-center sm:max-w-md [&_[data-slot=dialog-title]]:text-center [&_[data-slot=dialog-description]]:text-center"
      >
        <div className="-order-1 flex justify-center pb-1">
          <Loader2 aria-hidden="true" className="size-8 animate-spin text-hubee-500" />
        </div>
      </Modal>

      <Modal
        open={mode === "pix-timeout"}
        onOpenChange={(open) => {
          if (!open) onCloseModal();
        }}
        tone="warning"
        title="O tempo para pagamento expirou"
        description="O código PIX gerado ou a reserva temporária do seu lote atingiu o limite de 15 minutos."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToEvents}
              className="h-9 cursor-pointer px-3.5 text-xs font-semibold text-hubee-800 hover:bg-hubee-300/60"
            >
              Voltar ao evento
            </Button>
            <Button
              type="button"
              variant="hubee_800"
              onClick={onRegeneratePix}
              className="h-9 cursor-pointer px-4 text-xs font-semibold"
            >
              Gerar novo código PIX
            </Button>
          </>
        }
      >
        <div className="-order-1 flex items-center">
          <AlertTriangle aria-hidden="true" className="size-5 text-hubee-750" />
        </div>
      </Modal>

      <Modal
        open={mode === "payment-error"}
        onOpenChange={(open) => {
          if (!open) onCloseModal();
        }}
        tone="default"
        title="Falha no processamento do pagamento"
        description="A transação foi recusada pelo emissor ou ocorreu uma instabilidade temporária. Nenhuma cobrança foi efetuada."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToPix}
              className="h-9 cursor-pointer border-hubee-200 bg-white px-3.5 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-600 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-800"
            >
              Trocar para PIX
            </Button>
            <Button
              type="button"
              variant="hubee_800"
              onClick={onRetryCard}
              className="h-9 cursor-pointer px-4 text-xs font-semibold"
            >
              Tentar novamente
            </Button>
          </>
        }
      >
        <div className="-order-1 flex items-center">
          <XCircle aria-hidden="true" className="size-5 text-red-600 dark:text-red-400" />
        </div>
      </Modal>
    </>
  );
}


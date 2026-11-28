"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { DespesaPlanejamento } from "@/types/planejamento";

interface ExcluirDespesaModalProps {
  despesa: DespesaPlanejamento | null;
  onClose: () => void;
  onConfirm: (despesa: DespesaPlanejamento) => Promise<void>;
}

export function ExcluirDespesaModal({ despesa, onClose, onConfirm }: ExcluirDespesaModalProps) {
  const [excluindo, setExcluindo] = useState(false);
  const [ultima, setUltima] = useState<DespesaPlanejamento | null>(despesa);
  if (despesa && despesa !== ultima) setUltima(despesa);

  async function confirmar() {
    if (!despesa) return;
    setExcluindo(true);
    try {
      await onConfirm(despesa);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Modal
      open={despesa !== null}
      onOpenChange={(open) => !open && onClose()}
      dismissible={!excluindo}
      tone="warning"
      title="Excluir item?"
      description={`"${ultima?.description ?? ""}" sai do orçamento e o resumo é recalculado.`}
      footer={
        <>
          <Button
            type="button"
            disabled={excluindo}
            onClick={onClose}
            className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={excluindo}
            aria-busy={excluindo}
            onClick={() => void confirmar()}
            className="h-10 cursor-pointer rounded-lg bg-red-600 px-5 font-semibold text-white hover:bg-red-700 focus-visible:ring-red-700"
          >
            Excluir item
          </Button>
        </>
      }
    />
  );
}

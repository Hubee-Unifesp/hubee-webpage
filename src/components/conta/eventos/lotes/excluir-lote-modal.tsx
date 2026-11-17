"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { LoteIngresso } from "@/types/lote-ingresso";
import { getVendidos } from "./lotes.data";

interface ExcluirLoteModalProps {
  /** Lote a excluir. `null` fecha o modal. */
  lote: LoteIngresso | null;
  onClose: () => void;
  /** Deve resolver depois da exclusão. Em caso de erro, o modal continua aberto. */
  onConfirm: (lote: LoteIngresso) => Promise<void>;
}

/** Confirmação de exclusão de lote (modal amarelo de ação destrutiva). */
export function ExcluirLoteModal({ lote, onClose, onConfirm }: ExcluirLoteModalProps) {
  const [excluindo, setExcluindo] = useState(false);
  // Mantém o nome visível durante a animação de saída, quando `lote` já é `null`.
  const [ultimo, setUltimo] = useState<LoteIngresso | null>(lote);
  if (lote && lote !== ultimo) setUltimo(lote);

  const vendidos = ultimo ? getVendidos(ultimo) : 0;

  async function confirmar() {
    if (!lote) return;
    setExcluindo(true);
    try {
      await onConfirm(lote);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Modal
      open={lote !== null}
      onOpenChange={(open) => !open && onClose()}
      dismissible={!excluindo}
      tone="warning"
      title="Excluir lote?"
      description={`"${ultimo?.batch ?? ""}" deixa de ser vendido e será removido do evento. Esta ação não pode ser desfeita.`}
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
            {excluindo && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {excluindo ? "Excluindo..." : "Excluir lote"}
          </Button>
        </>
      }
    >
      {vendidos > 0 && (
        <p role="note" className="font-medium">
          Atenção: {vendidos} {vendidos === 1 ? "ingresso já foi vendido" : "ingressos já foram vendidos"} neste lote.
        </p>
      )}
    </Modal>
  );
}

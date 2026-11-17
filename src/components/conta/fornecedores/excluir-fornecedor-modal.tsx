"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { Fornecedor } from "@/types/fornecedor";

interface ExcluirFornecedorModalProps {
  /** Fornecedor a excluir. `null` fecha o modal. */
  fornecedor: Fornecedor | null;
  onClose: () => void;
  /** Deve resolver depois da exclusão. Em caso de erro, o modal continua aberto. */
  onConfirm: (fornecedor: Fornecedor) => Promise<void>;
}

/** Confirmação de exclusão de fornecedor (modal amarelo de ação destrutiva). */
export function ExcluirFornecedorModal({ fornecedor, onClose, onConfirm }: ExcluirFornecedorModalProps) {
  const [excluindo, setExcluindo] = useState(false);
  // Mantém o nome visível durante a animação de saída, quando `fornecedor` já é `null`.
  const [ultimo, setUltimo] = useState<Fornecedor | null>(fornecedor);
  if (fornecedor && fornecedor !== ultimo) setUltimo(fornecedor);

  async function confirmar() {
    if (!fornecedor) return;
    setExcluindo(true);
    try {
      await onConfirm(fornecedor);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Modal
      open={fornecedor !== null}
      onOpenChange={(open) => !open && onClose()}
      dismissible={!excluindo}
      tone="warning"
      title="Excluir fornecedor?"
      description={`"${ultimo?.companyName ?? ""}" será removido da lista de fornecedores.`}
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
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </>
      }
    />
  );
}

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { MembroOrganizacao } from "@/types/membro-organizacao";

interface RemoverMembroModalProps {
  /** Membro a remover (ou convite pendente a cancelar). `null` fecha o modal. */
  membro: MembroOrganizacao | null;
  organizationName: string;
  onClose: () => void;
  onConfirm: (membro: MembroOrganizacao) => Promise<void>;
}

/** Modal de confirmação de remoção de membro ou cancelamento de convite pendente (GOL-274 / GOL-277). */
export function RemoverMembroModal({
  membro,
  organizationName,
  onClose,
  onConfirm,
}: RemoverMembroModalProps) {
  const [removendo, setRemovendo] = useState(false);
  // Mantém o nome visível durante a animação de fechamento do modal.
  const [ultimo, setUltimo] = useState<MembroOrganizacao | null>(membro);
  if (membro && membro !== ultimo) setUltimo(membro);

  const isPendente = ultimo?.inviteStatus === "PENDING";

  async function confirmar() {
    if (!membro) return;
    setRemovendo(true);
    try {
      await onConfirm(membro);
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <Modal
      open={membro !== null}
      onOpenChange={(open) => !open && onClose()}
      dismissible={!removendo}
      tone="warning"
      title={isPendente ? "Cancelar convite?" : "Remover membro?"}
      description={
        isPendente
          ? `O convite pendente enviado para "${ultimo?.email ?? ""}" em ${organizationName} será cancelado.`
          : `"${ultimo?.fullName ?? ""}" (${ultimo?.email ?? ""}) perderá o acesso aos recursos de ${organizationName}.`
      }
      footer={
        <>
          <Button
            type="button"
            disabled={removendo}
            onClick={onClose}
            className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={removendo}
            aria-busy={removendo}
            onClick={() => void confirmar()}
            className="h-10 cursor-pointer rounded-lg bg-red-600 px-5 font-semibold text-white hover:bg-red-700 focus-visible:ring-red-700"
          >
            {removendo && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {removendo
              ? isPendente
                ? "Cancelando..."
                : "Removendo..."
              : isPendente
                ? "Cancelar convite"
                : "Remover"}
          </Button>
        </>
      }
    />
  );
}

"use client";

import { useState } from "react";
import { ContaCard } from "@/components/conta/conta-card";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { deleteMe } from "@/lib/api/users";
import { submitButtonClassName } from "./perfil-styles";

export function ExcluirContaCard() {
  const toast = useToast();
  const { logoutState } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    try {
      await deleteMe();
    } catch {
      toast.error("Não foi possível excluir sua conta. Tente novamente.");
      setExcluindo(false);
      return;
    }
    // Conta excluída: encerra a sessão e vai para a home. O modal fica aberto até a página sair.
    await logoutState();
  }

  return (
    <>
      <ContaCard title="Excluir Conta" tone="danger">
        <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
          Ao excluir sua conta, todos os seus dados serão apagados permanentemente.
        </p>
        <Button type="button" onClick={() => setAberto(true)} className={`${submitButtonClassName} mt-4`}>
          Excluir Conta
        </Button>
      </ContaCard>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        dismissible={!excluindo}
        title="Você deseja excluir sua conta permanentemente?"
        description="Esta ação não pode ser desfeita."
        tone="warning"
        footer={
          <>
            <Button
              type="button"
              disabled={excluindo}
              onClick={() => setAberto(false)}
              className="h-9 bg-hubee-800 px-5 text-xs font-semibold text-hubee-50 hover:bg-hubee-900"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={excluindo}
              aria-busy={excluindo}
              onClick={() => void confirmar()}
              className="h-9 bg-red-600 px-5 text-xs font-semibold text-white hover:bg-red-700"
            >
              {excluindo ? "Excluindo..." : "Excluir Conta"}
            </Button>
          </>
        }
      />
    </>
  );
}

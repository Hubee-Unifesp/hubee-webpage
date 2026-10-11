"use client";

import { useState } from "react";
import { ContaCard } from "@/components/conta/conta-card";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { submitButtonClassName } from "./campo";

export function ExcluirContaCard() {
  const toast = useToast();
  const [aberto, setAberto] = useState(false);

  function confirmar() {
    // TODO(auth-api): excluir a conta na API e encerrar a sessão.
    setAberto(false);
    toast.success("Conta excluída (simulação, sem integração com a API).");
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
        title="Você deseja excluir sua conta permanentemente?"
        description="Esta ação não pode ser desfeita."
        className="border-hubee-400 bg-hubee-200 text-hubee-750 dark:border-hubee-400 dark:bg-hubee-200 dark:text-hubee-750"
        footer={
          <>
            <Button
              type="button"
              onClick={() => setAberto(false)}
              className="h-9 bg-hubee-800 px-5 text-xs font-semibold text-hubee-50 hover:bg-hubee-900"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmar}
              className="h-9 bg-red-600 px-5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Excluir Conta
            </Button>
          </>
        }
      />
    </>
  );
}

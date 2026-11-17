"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { botaoPrimarioClassName, botaoSecundarioClassName } from "./estilos";

export type AcaoEvento = "publicar" | "cancelar";

const textos: Record<
  AcaoEvento,
  { titulo: string; descricao: (nome: string) => string; confirmar: string; andamento: string }
> = {
  publicar: {
    titulo: "Publicar evento?",
    descricao: (nome) =>
      `"${nome}" passa a aparecer na busca e os ingressos poderão ser comprados a partir do início das vendas.`,
    confirmar: "Publicar evento",
    andamento: "Publicando...",
  },
  cancelar: {
    titulo: "Cancelar evento?",
    descricao: (nome) =>
      `"${nome}" sai da busca e deixa de vender ingressos. Depois de cancelado, o evento não pode mais ser editado nem publicado.`,
    confirmar: "Cancelar evento",
    andamento: "Cancelando...",
  },
};

interface ConfirmarAcaoEventoModalProps {
  acao: AcaoEvento | null;
  nomeEvento: string;
  onClose: () => void;
  onConfirm: (acao: AcaoEvento) => Promise<void>;
}

export function ConfirmarAcaoEventoModal({ acao, nomeEvento, onClose, onConfirm }: ConfirmarAcaoEventoModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [ultima, setUltima] = useState<AcaoEvento>(acao ?? "publicar");
  if (acao && acao !== ultima) setUltima(acao);

  const texto = textos[ultima];
  const destrutiva = ultima === "cancelar";

  async function confirmar() {
    if (!acao) return;
    setEnviando(true);
    try {
      await onConfirm(acao);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={acao !== null}
      onOpenChange={(open) => !open && onClose()}
      dismissible={!enviando}
      tone={destrutiva ? "warning" : "default"}
      title={texto.titulo}
      description={texto.descricao(nomeEvento)}
      footer={
        <>
          <Button
            type="button"
            disabled={enviando}
            onClick={onClose}
            className={
              destrutiva
                ? "h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800"
                : botaoSecundarioClassName
            }
          >
            {destrutiva ? "Manter evento" : "Voltar"}
          </Button>
          <Button
            type="button"
            disabled={enviando}
            aria-busy={enviando}
            onClick={() => void confirmar()}
            className={
              destrutiva
                ? "h-10 cursor-pointer rounded-lg bg-red-600 px-5 font-semibold text-white hover:bg-red-700 focus-visible:ring-red-700"
                : botaoPrimarioClassName
            }
          >
            {enviando && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {enviando ? texto.andamento : texto.confirmar}
          </Button>
        </>
      }
    />
  );
}

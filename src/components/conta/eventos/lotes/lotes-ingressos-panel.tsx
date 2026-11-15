"use client";

import { useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { LoteIngresso, LotePayload } from "@/types/lote-ingresso";
import { botaoPrimarioClassName, cartaoClassName, hintClassName } from "../editor/estilos";
import { ExcluirLoteModal } from "./excluir-lote-modal";
import { LoteCard } from "./lote-card";
import { LoteFormModal } from "./lote-form-modal";

interface LotesIngressosPanelProps {
  /** Lotes do evento (`evento.lotes`), a mesma fonte lida pela Revisão. */
  lotes: readonly LoteIngresso[];
  /** Papel Leitura ou evento cancelado: esconde a ação de criar e desabilita editar e excluir. */
  somenteLeitura: boolean;
  /** Devem resolver depois de salvar. Se rejeitarem, o modal continua aberto (criar/editar) ou mostra o erro (excluir). */
  onCriar: (payload: LotePayload) => Promise<void>;
  onEditar: (loteId: string, payload: LotePayload) => Promise<void>;
  onExcluir: (loteId: string) => Promise<void>;
}

/** Seção "Lotes de ingressos" da gestão do evento: lista, criação, edição e remoção. */
export function LotesIngressosPanel({ lotes, somenteLeitura, onCriar, onEditar, onExcluir }: LotesIngressosPanelProps) {
  const toast = useToast();
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<LoteIngresso | null>(null);
  const [emExclusao, setEmExclusao] = useState<LoteIngresso | null>(null);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEdicao(lote: LoteIngresso) {
    setEmEdicao(lote);
    setFormAberto(true);
  }

  async function salvar(payload: LotePayload) {
    if (emEdicao) {
      await onEditar(emEdicao.id, payload);
      toast.success("Lote atualizado com sucesso.");
    } else {
      await onCriar(payload);
      toast.success("Lote criado com sucesso.");
    }
    setFormAberto(false);
  }

  async function confirmarExclusao(lote: LoteIngresso) {
    try {
      await onExcluir(lote.id);
      toast.success("Lote excluído.");
      setEmExclusao(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o lote. Tente novamente."));
    }
  }

  return (
    <section aria-labelledby="lotes-titulo" className={cartaoClassName}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 id="lotes-titulo" className="text-base font-semibold">
            Lotes de ingressos
          </h2>
          <p className={cn("mt-0.5", hintClassName)}>
            {somenteLeitura
              ? "Você pode consultar os lotes, mas não alterá-los."
              : "Configure modalidades, preços, quantidades e o período de vendas de cada lote."}
          </p>
        </div>
        {!somenteLeitura && lotes.length > 0 && (
          <Button type="button" onClick={abrirCriacao} className={cn(botaoPrimarioClassName, "self-start")}>
            <Plus aria-hidden="true" className="size-4" />
            Novo lote
          </Button>
        )}
      </div>

      {lotes.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Nenhum lote criado"
          description={
            somenteLeitura
              ? "Este evento ainda não possui lotes de ingressos."
              : "O evento precisa de pelo menos um lote para ser publicado. Crie o primeiro lote para começar."
          }
          action={somenteLeitura ? undefined : { label: "Criar primeiro lote", onClick: abrirCriacao }}
          className="mt-4"
        />
      ) : (
        <ul aria-label="Lotes do evento" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lotes.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              podeGerenciar={!somenteLeitura}
              onEditar={abrirEdicao}
              onExcluir={setEmExclusao}
            />
          ))}
        </ul>
      )}

      <LoteFormModal open={formAberto} onOpenChange={setFormAberto} lote={emEdicao} onSubmit={salvar} />
      <ExcluirLoteModal lote={emExclusao} onClose={() => setEmExclusao(null)} onConfirm={confirmarExclusao} />
    </section>
  );
}

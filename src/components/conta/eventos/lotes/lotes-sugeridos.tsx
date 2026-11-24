"use client";

import { useState } from "react";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { LoteSugerido } from "@/lib/lotes-sugeridos";
import type { LotePayload } from "@/types/lote-ingresso";
import { botaoSecundarioClassName, hintClassName } from "../editor/estilos";
import { MODALIDADE_LABEL } from "./lotes.data";
import { LoteFormModal } from "./lote-form-modal";

interface LotesSugeridosProps {
  sugestoes: readonly LoteSugerido[];
  /** Cria o lote no evento. Deve rejeitar se a API falhar, para o modal continuar aberto. */
  onCriar: (payload: LotePayload) => Promise<void>;
  /** Tira a sugestão da lista, depois de criada ou descartada. */
  onResolver: (sugestao: LoteSugerido) => void;
}

function descreverSugestao(sugestao: LoteSugerido): string {
  const partes: string[] = [];
  if (sugestao.modality) partes.push(MODALIDADE_LABEL[sugestao.modality]);
  if (sugestao.price !== null) {
    partes.push(sugestao.price === 0 ? "Gratuito" : sugestao.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  }
  if (sugestao.quantity !== null) {
    partes.push(`${sugestao.quantity.toLocaleString("pt-BR")} ${sugestao.quantity === 1 ? "ingresso" : "ingressos"}`);
  }
  return partes.join(" · ");
}

function camposFaltando(sugestao: LoteSugerido): string[] {
  const faltando: string[] = [];
  if (sugestao.price === null) faltando.push("preço");
  if (sugestao.quantity === null) faltando.push("quantidade");
  return faltando;
}

/**
 * Lotes que o assistente sugeriu para o evento recém-criado. Nada é criado sozinho: cada sugestão
 * abre o formulário de lote já preenchido, para o organizador revisar, completar e confirmar.
 */
export function LotesSugeridos({ sugestoes, onCriar, onResolver }: LotesSugeridosProps) {
  const toast = useToast();
  const [emRevisao, setEmRevisao] = useState<LoteSugerido | null>(null);

  if (sugestoes.length === 0) return null;

  async function confirmar(payload: LotePayload) {
    if (!emRevisao) return;
    await onCriar(payload);
    onResolver(emRevisao);
    toast.success("Lote criado com sucesso.");
    setEmRevisao(null);
  }

  return (
    <section
      aria-labelledby="lotes-sugeridos-titulo"
      className="rounded-xl border border-hubee-400 bg-[#FFF9E6] p-5 shadow-sm md:p-6 dark:border-hubee-400/35 dark:bg-hubee-850"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hubee-200 text-hubee-800 dark:bg-hubee-400/15 dark:text-hubee-400"
        >
          <Sparkles className="size-4.5" />
        </span>
        <div>
          <h2 id="lotes-sugeridos-titulo" className="text-base font-semibold">
            Lotes sugeridos pelo assistente
          </h2>
          <p className={hintClassName}>
            Revise cada sugestão antes de criar o lote. Nada é criado ou publicado automaticamente.
          </p>
        </div>
      </div>

      <ul aria-label="Lotes sugeridos pelo assistente" className="mt-4 grid gap-3 md:grid-cols-2">
        {sugestoes.map((sugestao, indice) => {
          const faltando = camposFaltando(sugestao);
          return (
            <li
              key={`${sugestao.batch}-${indice}`}
              className="flex flex-col gap-2 rounded-lg border border-hubee-200 bg-white p-3.5 dark:border-hubee-50/10 dark:bg-hubee-900"
            >
              <div>
                <p className="text-sm font-semibold">{sugestao.batch}</p>
                {descreverSugestao(sugestao) && <p className="text-xs">{descreverSugestao(sugestao)}</p>}
              </div>
              {faltando.length > 0 && (
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                  <AlertTriangle aria-hidden="true" className="size-3 shrink-0" />
                  Não identificado: {faltando.join(" e ")}. Complete ao revisar.
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2">
                <Button type="button" onClick={() => setEmRevisao(sugestao)} className={botaoSecundarioClassName}>
                  Revisar e criar
                </Button>
                <Button
                  type="button"
                  onClick={() => onResolver(sugestao)}
                  aria-label={`Descartar sugestão ${sugestao.batch}`}
                  className="h-10 cursor-pointer rounded-lg bg-transparent px-3 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 dark:text-hubee-50 dark:hover:bg-hubee-800"
                >
                  <X aria-hidden="true" className="size-3.5" />
                  Descartar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <LoteFormModal
        open={emRevisao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEmRevisao(null);
        }}
        lote={null}
        sugestao={emRevisao}
        onSubmit={confirmar}
      />
    </section>
  );
}

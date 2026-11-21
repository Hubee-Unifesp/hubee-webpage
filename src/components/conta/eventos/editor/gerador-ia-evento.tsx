"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AuthField, fieldA11y } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AI_DRAFT_PROMPT_MAX_LENGTH,
  EVENT_AI_DRAFT_FIELD_META,
  eventAiDraftPromptSchema,
  getInferredAiFields,
  getMissingFormFields,
  type EventAiDraft,
  type EventAiDraftField,
  type EventAiDraftPromptInputs,
  type EventAiDraftPromptValues,
  type SuggestedTicketType,
} from "@/lib/validations/event-ai-draft.schema";
import { botaoPrimarioClassName, labelClassName } from "./estilos";

export type GeradorIaStatus = "idle" | "loading" | "applied" | "error";

export interface GeradorIaEventoProps {
  status: GeradorIaStatus;
  rascunho: EventAiDraft | null;
  erro: string | null;
  /** Campos de `missingFields` ainda pendentes de revisão no formulário. */
  camposPendentes?: readonly EventAiDraftField[];
  desabilitado?: boolean;
  inicialmenteAberto?: boolean;
  onGerar: (prompt: string) => void | Promise<void>;
  onLimpar?: () => void;
  onFocarCampo?: (campo: EventAiDraftField) => void;
}

const MODALIDADE_LABEL: Record<string, string> = {
  inteira: "Inteira",
  meia: "Meia",
  estudante: "Estudante",
  vip: "VIP",
  cortesia: "Cortesia",
};

function formatarLoteSugerido(lote: SuggestedTicketType): string {
  const partes: string[] = [lote.batch];
  if (lote.modality && MODALIDADE_LABEL[lote.modality]) {
    partes.push(MODALIDADE_LABEL[lote.modality]);
  }
  if (typeof lote.price === "number") {
    partes.push(
      lote.price === 0
        ? "Gratuito"
        : lote.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    );
  }
  if (typeof lote.quantity === "number" && lote.quantity > 0) {
    partes.push(`${lote.quantity} ${lote.quantity === 1 ? "ingresso" : "ingressos"}`);
  }
  return partes.join(" · ");
}

/** Selo visual compacto exibido ao lado do rótulo do campo após preenchimento por IA (GOL-265). */
export function CampoIaBadge({ tipo }: { tipo: "inferred" | "missing" }) {
  if (tipo === "missing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:border-amber-500 dark:bg-amber-950/90 dark:text-amber-200">
        <AlertTriangle aria-hidden="true" className="size-3 shrink-0" />
        Não identificado · Revise
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-500/60 dark:bg-emerald-950/70 dark:text-emerald-200">
      <Sparkles aria-hidden="true" className="size-2.5 shrink-0" />
      Preenchido pela IA
    </span>
  );
}

/**
 * Bloco retrátil "Criar rascunho com IA" exibido no topo da Etapa 1 de `/meus-eventos/novo` (GOL-262 / GOL-265).
 * Inicia fechado por padrão para preservar a fluidez do preenchimento manual e nunca salva nem publica sozinho.
 */
export function GeradorIaEvento({
  status,
  rascunho,
  erro,
  camposPendentes,
  desabilitado = false,
  inicialmenteAberto = false,
  onGerar,
  onLimpar,
  onFocarCampo,
}: GeradorIaEventoProps) {
  const painelId = useId();
  const promptId = useId();
  const [aberto, setAberto] = useState(inicialmenteAberto);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventAiDraftPromptInputs, unknown, EventAiDraftPromptValues>({
    resolver: zodResolver(eventAiDraftPromptSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { prompt: "" },
  });

  const promptValue = useWatch({ control, name: "prompt" }) ?? "";
  const carregando = status === "loading";
  const bloqueado = desabilitado || carregando;
  const expandido = aberto || carregando;

  const camposInferidos = rascunho ? getInferredAiFields(rascunho) : [];
  const pendentes = camposPendentes ?? (rascunho ? getMissingFormFields(rascunho) : []);
  const lotesSugeridos = rascunho?.suggestedTicketTypes ?? [];

  async function enviar(values: EventAiDraftPromptValues) {
    await onGerar(values.prompt);
  }

  function limpar() {
    reset({ prompt: "" });
    onLimpar?.();
  }

  const promptError = errors.prompt?.message;
  const textoBotao = carregando
    ? "Gerando rascunho..."
    : status === "applied"
      ? "Regerar rascunho com IA"
      : status === "error"
        ? "Tentar novamente com IA"
        : "Gerar rascunho com IA";

  return (
    <section
      aria-label="Criar rascunho com IA"
      aria-busy={carregando}
      className="rounded-xl border border-hubee-400 bg-[#FFF9E6] shadow-sm transition-colors dark:border-hubee-400/35 dark:bg-hubee-850"
    >
      <button
        type="button"
        aria-expanded={expandido}
        aria-controls={painelId}
        disabled={carregando}
        onClick={() => setAberto((atual) => !atual)}
        className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 disabled:cursor-wait md:px-6 md:py-4 dark:focus-visible:ring-hubee-400"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hubee-200 text-hubee-800 dark:bg-hubee-400/15 dark:text-hubee-400"
          >
            <Sparkles className="size-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-hubee-800 md:text-base dark:text-hubee-50">
              Criar rascunho com IA
            </span>
            <span className="block truncate text-xs text-hubee-neutral-300 dark:text-hubee-200">
              {expandido
                ? "Descreva seu evento em linguagem natural. A IA preenche os campos para você revisar."
                : "Opcional · Descreva o evento em linguagem natural e deixe a IA preencher os campos para revisão"}
            </span>
          </span>
        </span>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-hubee-300 bg-hubee-100 px-2.5 py-1.5 text-xs font-semibold text-hubee-800 dark:border-hubee-50/15 dark:bg-hubee-50/10 dark:text-hubee-200">
          <span className="hidden sm:inline">{expandido ? "Recolher" : "Usar assistente"}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              expandido && "rotate-180",
            )}
          />
        </span>
      </button>

      {expandido && (
        <div
          id={painelId}
          className="flex flex-col gap-4 border-t border-hubee-200/80 px-4 pt-4 pb-5 md:px-6 md:pb-6 dark:border-hubee-50/10"
        >
          <form noValidate onSubmit={handleSubmit(enviar)} className="flex flex-col gap-3.5">
            <AuthField
              id={promptId}
              label="Descreva seu evento"
              labelClassName={labelClassName}
              error={promptError}
              description={
                <span className="flex justify-end text-[11px] tabular-nums" aria-live="polite">
                  {promptValue.length} / {AI_DRAFT_PROMPT_MAX_LENGTH}
                </span>
              }
            >
              <Textarea
                {...fieldA11y(promptId, promptError)}
                rows={3}
                disabled={bloqueado}
                maxLength={AI_DRAFT_PROMPT_MAX_LENGTH}
                placeholder="Ex.: Hubee Tech Summit no dia 20/03/2027 das 09h às 18h, palestras e oficinas sobre tecnologia e carreira, classificação livre, com 1º lote promocional a R$ 60 (100 vagas) e 2º lote a R$ 120 (200 vagas)..."
                className={cn(
                  "min-h-24 rounded-lg border-hubee-300 bg-white text-sm text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 disabled:opacity-70 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-300",
                  status === "error" && "border-red-600 dark:border-red-400",
                )}
                {...register("prompt")}
              />
            </AuthField>

            {carregando && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-lg border border-hubee-400 bg-hubee-100 px-3.5 py-3 text-xs text-hubee-800 dark:border-hubee-400/35 dark:bg-hubee-900 dark:text-hubee-100"
              >
                <Loader2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 animate-spin text-hubee-700 motion-reduce:animate-none dark:text-hubee-400"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Interpretando descrição e estruturando rascunho...</span>
                  <span className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                    Extraindo nome, categoria, datas, classificação indicativa e sugestões de lotes.
                  </span>
                </div>
              </div>
            )}

            {status === "applied" && rascunho && (
              <div aria-live="polite" className="flex flex-col gap-2.5">
                {pendentes.length > 0 ? (
                  <div className="flex flex-col gap-2 rounded-lg border border-amber-500 bg-amber-50 px-3.5 py-3 text-xs text-amber-900 dark:border-amber-500 dark:bg-amber-950/70 dark:text-amber-100">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold">
                          Rascunho aplicado! {camposInferidos.length}{" "}
                          {camposInferidos.length === 1 ? "campo preenchido" : "campos preenchidos"} ·{" "}
                          {pendentes.length}{" "}
                          {pendentes.length === 1
                            ? "campo precisa da sua revisão"
                            : "campos precisam da sua revisão"}
                        </span>
                        <span className="text-[11px]">
                          A IA não identificou os campos destacados em âmbar abaixo. Revise ou complete antes de salvar.
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pl-6">
                      {pendentes.map((campo) => {
                        const meta = EVENT_AI_DRAFT_FIELD_META[campo];
                        return (
                          <button
                            key={campo}
                            type="button"
                            onClick={() => onFocarCampo?.(campo)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-amber-500 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-amber-500 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-900"
                          >
                            <ArrowDown aria-hidden="true" className="size-3" />
                            Ir para {meta.label}
                            {meta.obrigatorio ? " *" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/80 bg-emerald-50 px-3.5 py-3 text-xs text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">
                        Rascunho aplicado! Revise os campos preenchidos abaixo antes de salvar.
                      </span>
                      <span className="text-[11px]">
                        Todos os dados preenchidos continuam 100% editáveis e nada é publicado automaticamente.
                      </span>
                    </div>
                  </div>
                )}

                {lotesSugeridos.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/80 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/60 dark:text-emerald-100">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-bold">
                        {lotesSugeridos.length}{" "}
                        {lotesSugeridos.length === 1
                          ? "lote sugerido pela IA pré-carregado para a Etapa 2 (Ingressos):"
                          : "lotes sugeridos pela IA pré-carregados para a Etapa 2 (Ingressos):"}
                      </span>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                        {lotesSugeridos.map((lote, index) => (
                          <li key={`${lote.batch}-${index}`}>• {formatarLoteSugerido(lote)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === "error" && erro && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-600 bg-red-50 px-3.5 py-3 text-xs text-red-900 dark:border-red-400 dark:bg-red-950/70 dark:text-red-100"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{erro}</span>
                  <span className="text-[11px]">
                    Sua descrição foi preservada. Você pode tentar gerar novamente ou preencher o formulário manualmente abaixo.
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {promptValue.trim().length > 0 || status !== "idle" ? (
                <button
                  type="button"
                  disabled={bloqueado}
                  onClick={limpar}
                  className="cursor-pointer self-start rounded-md px-1 py-1 text-xs font-semibold text-hubee-neutral-300 transition-colors hover:text-hubee-800 focus-visible:ring-2 focus-visible:ring-hubee-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-hubee-200 dark:hover:text-hubee-50 dark:focus-visible:ring-hubee-400"
                >
                  Limpar descrição
                </button>
              ) : (
                <p className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                  ✦ Nenhum evento é salvo ou publicado automaticamente.
                </p>
              )}

              <Button
                type="submit"
                disabled={bloqueado}
                aria-busy={carregando}
                className={cn(botaoPrimarioClassName, "w-full sm:w-auto")}
              >
                {carregando ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Sparkles aria-hidden="true" className="size-4" />
                )}
                {textoBotao}
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

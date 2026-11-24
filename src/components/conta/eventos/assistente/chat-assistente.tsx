"use client";

import { useEffect, useId, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AlertTriangle, Loader2, RotateCcw, SendHorizontal, SkipForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ASSISTANT_ANSWER_MAX_LENGTH } from "@/lib/api/event-ai-assistant.types";
import type { EnvioAssistente, MensagemAssistente } from "@/lib/assistente-evento";
import { cn } from "@/lib/utils";
import {
  respostaAssistenteSchema,
  type RespostaAssistenteInputs,
  type RespostaAssistenteValues,
} from "@/lib/validations/assistente-evento.schema";
import { botaoPrimarioClassName, botaoTextoClassName, cartaoClassName } from "../editor/estilos";

interface ChatAssistenteProps {
  mensagens: MensagemAssistente[];
  enviando: boolean;
  erro: string | null;
  podePular: boolean;
  podeTentarDeNovo: boolean;
  concluido: boolean;
  onEnviar: (envio: EnvioAssistente) => void;
  onTentarDeNovo: () => void;
}

function Balao({ mensagem }: { mensagem: MensagemAssistente }) {
  const doAssistente = mensagem.autor === "assistente";
  return (
    <li className={cn("flex gap-2.5", doAssistente ? "justify-start" : "justify-end")}>
      {doAssistente && (
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-hubee-400 text-hubee-800"
        >
          <Sparkles className="size-3.5" />
        </span>
      )}
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
          doAssistente
            ? "rounded-tl-sm bg-hubee-100 text-hubee-800 dark:bg-hubee-850 dark:text-hubee-50"
            : "rounded-tr-sm bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-800",
        )}
      >
        <span className="sr-only">{doAssistente ? "Assistente: " : "Você: "}</span>
        {mensagem.texto}
      </p>
    </li>
  );
}

export function ChatAssistente({
  mensagens,
  enviando,
  erro,
  podePular,
  podeTentarDeNovo,
  concluido,
  onEnviar,
  onTentarDeNovo,
}: ChatAssistenteProps) {
  const campoId = useId();
  const fimRef = useRef<HTMLDivElement>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespostaAssistenteInputs, unknown, RespostaAssistenteValues>({
    resolver: zodResolver(respostaAssistenteSchema),
    mode: "onSubmit",
    defaultValues: { resposta: "" },
  });

  const resposta = useWatch({ control, name: "resposta" }) ?? "";
  const erroCampo = errors.resposta?.message;

  useEffect(() => {
    fimRef.current?.scrollIntoView?.({ block: "end", behavior: "smooth" });
  }, [mensagens.length, enviando, erro]);

  function enviar({ resposta: texto }: RespostaAssistenteValues) {
    onEnviar({ tipo: "resposta", texto });
    reset({ resposta: "" });
  }

  return (
    <section aria-label="Conversa com o assistente" className={cn(cartaoClassName, "flex flex-col gap-4 p-0 md:p-0")}>
      <div className="max-h-[60vh] min-h-72 overflow-y-auto px-4 pt-5 md:px-6">
        <ol aria-live="polite" aria-relevant="additions" className="flex flex-col gap-3">
          {mensagens.map((mensagem) => (
            <Balao key={mensagem.id} mensagem={mensagem} />
          ))}
        </ol>

        {enviando && (
          <div role="status" className="mt-3 flex items-center gap-2 text-xs text-hubee-neutral-300 dark:text-hubee-200">
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" />
            O assistente está lendo sua resposta...
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="mt-3 flex flex-col gap-2 rounded-lg border border-red-600/50 bg-red-50 px-3.5 py-3 text-xs text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-400/50 dark:bg-red-950/50 dark:text-red-200"
          >
            <span className="flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {erro}
            </span>
            {podeTentarDeNovo && (
              <Button
                type="button"
                onClick={onTentarDeNovo}
                className="h-8 shrink-0 cursor-pointer rounded-lg bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Tentar de novo
              </Button>
            )}
          </div>
        )}
        <div ref={fimRef} className="h-4" />
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(enviar)}
        className="flex flex-col gap-2 border-t border-hubee-200 px-4 pt-4 pb-5 md:px-6 dark:border-hubee-50/10"
      >
        <label htmlFor={campoId} className="sr-only">
          {concluido ? "Quer mudar algo no evento?" : "Sua resposta"}
        </label>
        <Textarea
          id={campoId}
          aria-invalid={erroCampo ? true : undefined}
          aria-describedby={`${campoId}-ajuda${erroCampo ? ` ${campoId}-erro` : ""}`}
          rows={2}
          maxLength={ASSISTANT_ANSWER_MAX_LENGTH}
          disabled={enviando}
          placeholder={concluido ? "Quer mudar algo? Ex.: o 2º lote custa R$ 60" : "Escreva sua resposta..."}
          className="min-h-16 resize-none rounded-lg border-hubee-300 bg-white text-sm dark:border-hubee-50/15 dark:bg-hubee-900"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void handleSubmit(enviar)();
            }
          }}
          {...register("resposta")}
        />
        {erroCampo && (
          <p id={`${campoId}-erro`} className="text-xs text-red-700 dark:text-red-300">
            {erroCampo}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span id={`${campoId}-ajuda`} className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
            Enter envia, Shift+Enter quebra a linha · {resposta.length} / {ASSISTANT_ANSWER_MAX_LENGTH}
          </span>
          <div className="flex gap-2 sm:justify-end">
            {podePular && (
              <Button
                type="button"
                disabled={enviando}
                onClick={() => onEnviar({ tipo: "pular" })}
                className={cn(botaoTextoClassName, "flex-1 bg-transparent sm:flex-none")}
              >
                <SkipForward aria-hidden="true" className="size-4" />
                Pular
              </Button>
            )}
            <Button type="submit" disabled={enviando} className={cn(botaoPrimarioClassName, "flex-1 sm:flex-none")}>
              <SendHorizontal aria-hidden="true" className="size-4" />
              Enviar
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

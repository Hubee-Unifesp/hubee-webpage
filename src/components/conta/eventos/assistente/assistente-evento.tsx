"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, RotateCcw } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAssistenteEvento, type EnviarRodada } from "@/hooks/useAssistenteEvento";
import { podePular } from "@/lib/assistente-evento";
import { canCreateEvents } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { botaoTextoClassName } from "../editor/estilos";
import { ChatAssistente } from "./chat-assistente";
import { ResumoRascunho } from "./resumo-rascunho";

function VoltarParaMeusEventos() {
  return (
    <Link
      href="/meus-eventos"
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-hubee-750 hover:underline dark:text-hubee-200"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Meus eventos
    </Link>
  );
}

export function AssistenteEvento({ enviarRodada }: { enviarRodada?: EnviarRodada }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { conversa, carregado, enviando, erro, podeTentarDeNovo, enviar, tentarDeNovo, recomecar } =
    useAssistenteEvento(enviarRodada);

  if (isLoading || !carregado) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4">
        <span className="sr-only">Carregando o assistente...</span>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!canCreateEvents(user)) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EmptyState
          icon={Lock}
          title="Você ainda não pode criar eventos"
          description="O assistente é para Administradores e Membros de uma organização. Crie uma organização ou peça acesso a uma existente."
          action={{ label: "Criar organização", onClick: () => router.push("/organizacoes/nova") }}
        />
      </div>
    );
  }

  const iniciada = conversa.mensagens.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <VoltarParaMeusEventos />
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <ContaPageTitle>Criar evento com assistente</ContaPageTitle>
          {iniciada && (
            <Button
              type="button"
              disabled={enviando}
              onClick={recomecar}
              className={cn(botaoTextoClassName, "self-start bg-transparent sm:self-auto")}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Recomeçar
            </Button>
          )}
        </div>
        <p className="text-sm text-hubee-750/80 dark:text-hubee-200">
          Responda às perguntas como numa conversa. Nada é salvo nem publicado até você confirmar.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ChatAssistente
          mensagens={conversa.mensagens}
          enviando={enviando}
          erro={erro}
          podePular={podePular(conversa)}
          podeTentarDeNovo={podeTentarDeNovo}
          concluido={conversa.done}
          onEnviar={enviar}
          onTentarDeNovo={tentarDeNovo}
        />
        <div className="order-first lg:sticky lg:top-24 lg:order-none">
          <ResumoRascunho
            draft={conversa.draft}
            campoAtual={conversa.pergunta?.field ?? null}
            obrigatoriosFaltando={conversa.obrigatoriosFaltando.length}
          />
        </div>
      </div>
    </div>
  );
}

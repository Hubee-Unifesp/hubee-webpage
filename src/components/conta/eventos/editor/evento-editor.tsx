"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Building2, CalendarX, CloudOff, Info, Lock } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useEventoEditor } from "@/hooks/useEventoEditor";
import { canCancelEvent } from "@/types/organizacao";
import type { EventoPayload, LocalEvento, LocalPayload } from "@/types/evento-editor";
import { StatusEventoBadge } from "../status-evento-badge";
import { ConfirmarAcaoEventoModal, type AcaoEvento } from "./confirmar-acao-evento-modal";
import { DadosEventoForm } from "./dados-evento-form";
import { EtapasEvento } from "./etapas-evento";
import { canEditEvent, type EtapaEvento } from "./evento-editor.data";
import { IngressosEvento } from "./ingressos-evento";
import { RevisaoEvento } from "./revisao-evento";

const ERRO_GENERICO = "Não foi possível concluir a ação. Tente novamente.";

const avisoClassName =
  "flex items-center gap-2.5 rounded-xl border border-hubee-400/60 bg-hubee-100 px-4 py-3 text-xs font-medium text-hubee-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200";

function VoltarParaMeusEventos() {
  return (
    <Link
      href="/meus-eventos"
      className="inline-flex min-h-8 items-center gap-1.5 self-start rounded-md text-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Meus Eventos
    </Link>
  );
}

function EditorSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando evento…</span>
      <Skeleton className="h-9 w-72 rounded-full" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}

interface EventoEditorProps {
  eventoId?: string;
  etapaInicial?: EtapaEvento;
}

export function EventoEditor({ eventoId, etapaInicial = "dados" }: EventoEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const [etapa, setEtapa] = useState<EtapaEvento>(etapaInicial);
  const [acao, setAcao] = useState<AcaoEvento | null>(null);
  const [acabouDePublicar, setAcabouDePublicar] = useState(false);
  const {
    status,
    organizacoes,
    organizacaoAtiva,
    evento,
    local,
    locais,
    retry,
    criarLocal,
    salvarDados,
    publicar,
    cancelar,
  } = useEventoEditor(eventoId);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EditorSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EmptyState
          icon={CloudOff}
          title="Não foi possível carregar o evento"
          description="Verifique sua conexão e tente novamente."
          action={{ label: "Tentar novamente", onClick: retry }}
        />
      </div>
    );
  }

  if (!organizacaoAtiva || organizacoes.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EmptyState
          icon={Building2}
          title="Você ainda não faz parte de nenhuma organização"
          description="Crie uma organização ou vincule-se a uma existente no seu perfil para criar e gerenciar eventos."
          action={{ label: "Criar organização", onClick: () => router.push("/conta/perfil?criarOrganizacao=1") }}
        />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EmptyState
          icon={CalendarX}
          title="Evento não encontrado"
          description="O evento não existe ou não pertence à organização ativa."
          action={{ label: "Voltar para Meus Eventos", onClick: () => router.push("/meus-eventos") }}
        />
      </div>
    );
  }

  const papel = organizacaoAtiva.papel;

  if (!evento && !canEditEvent(papel)) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaMeusEventos />
        <EmptyState
          icon={Lock}
          title="Apenas Administradores e Membros podem criar eventos"
          description="Seu papel nesta organização é de leitura. Peça a um Administrador para alterar sua permissão."
          action={{ label: "Voltar para Meus Eventos", onClick: () => router.push("/meus-eventos") }}
        />
      </div>
    );
  }

  const somenteLeitura = !canEditEvent(papel, evento?.status);
  const podeCancelar = evento !== null && canCancelEvent(papel, evento.status);

  async function handleSalvarDados(payload: EventoPayload, capa: File | null) {
    const criando = evento === null;
    try {
      const salvo = await salvarDados(payload, capa);
      toast.success(criando ? "Rascunho criado com sucesso." : "Dados do evento salvos.");
      if (criando) {
        router.replace(`/meus-eventos/${salvo.id}/editar?etapa=lotes`);
        return;
      }
      setEtapa("lotes");
    } catch {
      toast.error(ERRO_GENERICO);
    }
  }

  async function handleCriarLocal(payload: LocalPayload): Promise<LocalEvento | null> {
    try {
      const novo = await criarLocal(payload);
      toast.success("Local cadastrado com sucesso.");
      return novo;
    } catch {
      toast.error(ERRO_GENERICO);
      return null;
    }
  }

  async function confirmarAcao(escolhida: AcaoEvento) {
    try {
      if (escolhida === "publicar") {
        await publicar();
        setAcabouDePublicar(true);
        toast.success("Evento publicado com sucesso.");
      } else {
        await cancelar();
        setAcabouDePublicar(false);
        toast.success("Evento cancelado.");
      }
      setAcao(null);
    } catch {
      toast.error(ERRO_GENERICO);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <VoltarParaMeusEventos />
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ContaPageTitle>{evento ? evento.name : "Novo evento"}</ContaPageTitle>
            {evento && <StatusEventoBadge status={evento.status} />}
          </div>
          {podeCancelar && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAcao("cancelar")}
              className="h-10 cursor-pointer self-start rounded-lg border-red-600/60 bg-transparent px-4 font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-700 sm:self-auto dark:border-red-400/60 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              <Ban aria-hidden="true" className="size-4" />
              Cancelar evento
            </Button>
          )}
        </div>
        <p className="text-sm text-hubee-750/80 dark:text-hubee-200">
          Organização: <span className="font-medium text-hubee-800 dark:text-hubee-50">{organizacaoAtiva.nome}</span>
        </p>
      </div>

      {evento?.status === "cancelled" ? (
        <div role="note" className={avisoClassName}>
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <span>Evento cancelado não pode ser alterado.</span>
        </div>
      ) : (
        somenteLeitura && (
          <div role="note" className={avisoClassName}>
            <Info aria-hidden="true" className="size-4 shrink-0" />
            <span>Seu papel nesta organização é de leitura. Você pode consultar o evento, mas não alterá-lo.</span>
          </div>
        )
      )}

      <EtapasEvento atual={etapa} onChange={setEtapa} bloquearSeguintes={evento === null} />

      {etapa === "dados" && (
        <DadosEventoForm
          evento={evento}
          locais={locais}
          organizerId={organizacaoAtiva.orgId}
          somenteLeitura={somenteLeitura}
          onCriarLocal={handleCriarLocal}
          onSubmit={handleSalvarDados}
          onContinuar={() => setEtapa("lotes")}
        />
      )}

      {etapa === "lotes" && evento && (
        <IngressosEvento
          evento={evento}
          somenteLeitura={somenteLeitura}
          onVoltar={() => setEtapa("dados")}
          onContinuar={() => setEtapa("revisao")}
        />
      )}

      {etapa === "revisao" && evento && (
        <RevisaoEvento
          evento={evento}
          local={local}
          somenteLeitura={somenteLeitura}
          acabouDePublicar={acabouDePublicar}
          onVoltar={() => setEtapa("lotes")}
          onPublicar={() => setAcao("publicar")}
        />
      )}

      {evento && (
        <ConfirmarAcaoEventoModal
          acao={acao}
          nomeEvento={evento.name}
          onClose={() => setAcao(null)}
          onConfirm={confirmarAcao}
        />
      )}
    </div>
  );
}

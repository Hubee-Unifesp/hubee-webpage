"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Building2, CalendarX, CloudOff, Info, Lock, Sparkles } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useEventoEditor } from "@/hooks/useEventoEditor";
import { getApiErrorMessage } from "@/lib/api/errors";
import { carregarLotesSugeridos, salvarLotesSugeridos, type LoteSugerido } from "@/lib/lotes-sugeridos";
import { canCancelEvent } from "@/types/organizacao";
import type { EventoPayload, LocalEvento, LocalPayload } from "@/types/evento-editor";
import { StatusEventoBadge } from "../status-evento-badge";
import { ConfirmarAcaoEventoModal, type AcaoEvento } from "./confirmar-acao-evento-modal";
import { DadosEventoForm } from "./dados-evento-form";
import { EtapasEvento } from "./etapas-evento";
import { canEditEvent, type EtapaEvento } from "./evento-editor.data";
import { IngressosEvento } from "./ingressos-evento";
import { RevisaoEvento } from "./revisao-evento";

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

function AtalhoAssistente() {
  return (
    <Link
      href="/meus-eventos/novo/assistente"
      className="group flex items-center gap-3 rounded-xl border border-hubee-400 bg-[#FFF9E6] px-4 py-3.5 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 md:px-6 dark:border-hubee-400/35 dark:bg-hubee-850 dark:focus-visible:ring-hubee-400"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hubee-200 text-hubee-800 dark:bg-hubee-400/15 dark:text-hubee-400"
      >
        <Sparkles className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-hubee-800 md:text-base dark:text-hubee-50">
          Prefere criar conversando?
        </span>
        <span className="block text-xs text-hubee-neutral-300 dark:text-hubee-200">
          O assistente pergunta o que precisa e monta o rascunho do evento para você.
        </span>
      </span>
      <span className="shrink-0 rounded-lg bg-hubee-800 px-3 py-2 text-xs font-semibold text-hubee-50 group-hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-800">
        Criar com assistente
      </span>
    </Link>
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
  // Sobrevivem à troca de rota feita ao criar o rascunho. A página remonta o editor por evento (`key`) e
  // só mostra o painel depois do carregamento, então ler a sessão aqui não diverge do HTML do servidor.
  const [lotesSugeridos, setLotesSugeridos] = useState<LoteSugerido[]>(() =>
    eventoId && typeof window !== "undefined" ? carregarLotesSugeridos(eventoId) : [],
  );
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
    criarLote,
    editarLote,
    excluirLote,
  } = useEventoEditor(eventoId);

  const handleResolverLoteSugerido = useCallback(
    (sugestao: LoteSugerido) => {
      setLotesSugeridos((atuais) => {
        const restantes = atuais.filter((item) => item !== sugestao);
        if (eventoId) salvarLotesSugeridos(eventoId, restantes);
        return restantes;
      });
    },
    [eventoId],
  );

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
          action={{ label: "Criar organização", onClick: () => router.push("/organizacoes/nova") }}
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
      const { evento: salvo, erroCapa } = await salvarDados(payload, capa);
      if (erroCapa) {
        toast.error(`${criando ? "Rascunho criado" : "Dados salvos"}, mas a capa não foi enviada: ${erroCapa}`);
      } else {
        toast.success(criando ? "Rascunho criado com sucesso." : "Dados do evento salvos.");
      }
      if (criando) {
        router.replace(`/meus-eventos/${salvo.id}/editar?etapa=lotes`);
        return;
      }
      setEtapa("lotes");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleCriarLocal(payload: LocalPayload): Promise<LocalEvento | null> {
    try {
      const novo = await criarLocal(payload);
      toast.success("Local cadastrado com sucesso.");
      return novo;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cadastrar o local. Tente novamente."));
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
    } catch (error) {
      toast.error(getApiErrorMessage(error));
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
        <div className="flex flex-col gap-4">
          {!evento && !somenteLeitura && <AtalhoAssistente />}
          <DadosEventoForm
            evento={evento}
            locais={locais}
            organizerId={organizacaoAtiva.orgId}
            somenteLeitura={somenteLeitura}
            onCriarLocal={handleCriarLocal}
            onSubmit={handleSalvarDados}
            onContinuar={() => setEtapa("lotes")}
          />
        </div>
      )}

      {etapa === "lotes" && evento && (
        <IngressosEvento
          evento={evento}
          somenteLeitura={somenteLeitura}
          onCriarLote={criarLote}
          onEditarLote={editarLote}
          onExcluirLote={excluirLote}
          lotesSugeridos={lotesSugeridos}
          onResolverLoteSugerido={handleResolverLoteSugerido}
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

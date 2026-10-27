"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, Info, ListFilter, Lock, Plus, Search } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeusEventos } from "@/hooks/useMeusEventos";
import { cn } from "@/lib/utils";
import {
  canCreateOrEditEvent,
  formatOrganizerRoleLabel,
  type PapelOrganizador,
} from "@/types/organizacao";
import { EventoOrganizadorCard } from "./evento-organizador-card";
import { MeusEventosSkeleton } from "./meus-eventos-skeleton";
import { filtroStatusEventoOrdem, getFiltroStatusLabel } from "./status-evento-badge";

const papelBadgeStyle: Record<PapelOrganizador, string> = {
  administrador:
    "border-hubee-400/70 bg-hubee-100 text-hubee-800 dark:border-hubee-400 dark:bg-hubee-400/20 dark:text-hubee-200",
  membro:
    "border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200",
  leitura:
    "border-hubee-300 bg-hubee-neutral-25 text-hubee-750 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

/** Painel "Meus Eventos" para membros de organizações com convite aceito. */
export function MeusEventosContent() {
  const router = useRouter();
  const toast = useToast();
  const searchInputId = useId();
  const {
    status,
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao,
    todosEventos,
    eventosFiltrados,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    limparFiltros,
    retry,
  } = useMeusEventos();

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <ContaPageTitle>Meus Eventos</ContaPageTitle>
        <MeusEventosSkeleton />
      </div>
    );
  }

  if (!organizacaoAtiva || organizacoes.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <ContaPageTitle>Meus Eventos</ContaPageTitle>
        <EmptyState
          icon={Building2}
          title="Acesso restrito a membros de organizações"
          description="Você ainda não faz parte de nenhuma organização com convite aceito. Solicite um convite ao administrador da sua organização para acessar o painel de eventos."
          action={{ label: "Ver eventos públicos", onClick: () => router.push("/#eventos") }}
        />
      </div>
    );
  }

  const papel = organizacaoAtiva.papel;
  const podeCriarEvento = canCreateOrEditEvent(papel);
  const temFiltroAtivo = filtroStatus !== "all" || busca.trim() !== "";

  const handleCriarEvento = () => {
    toast.success("O fluxo de criação de eventos será disponibilizado em breve.");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1.5">
          <ContaPageTitle>Meus Eventos</ContaPageTitle>
          <p className="text-sm text-hubee-750/80 dark:text-hubee-200">
            Organização: <span className="font-medium text-hubee-800 dark:text-hubee-50">{organizacaoAtiva.nome}</span> •{" "}
            {todosEventos.length} {todosEventos.length === 1 ? "evento" : "eventos"}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                papelBadgeStyle[papel],
              )}
            >
              {formatOrganizerRoleLabel(papel)}
            </span>

            {organizacoes.length > 1 && (
              <div className="md:hidden">
                <Select value={organizacaoAtiva.orgId} onValueChange={selecionarOrganizacao}>
                  <SelectTrigger
                    size="sm"
                    aria-label="Organização ativa"
                    className="border-hubee-300 bg-hubee-neutral-25 text-xs font-semibold text-hubee-800 dark:border-hubee-50/15 dark:bg-hubee-50/5 dark:text-hubee-50"
                  >
                    <SelectValue placeholder="Selecione a organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizacoes.map((org) => (
                      <SelectItem key={org.orgId} value={org.orgId}>
                        {org.nome} ({formatOrganizerRoleLabel(org.papel)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {podeCriarEvento ? (
          <Button
            type="button"
            variant="hubee_750"
            onClick={handleCriarEvento}
            className="h-10 self-start rounded-lg px-4 font-semibold sm:self-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
          >
            <Plus aria-hidden="true" className="size-4" />
            Criar Novo Evento
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled
            aria-disabled="true"
            title="Apenas Administradores e Membros podem criar eventos"
            className="h-10 self-start rounded-lg border-stone-300 bg-stone-200/70 px-4 font-semibold text-stone-500 sm:self-auto dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
          >
            <Lock aria-hidden="true" className="size-4" />
            Criar Novo Evento
          </Button>
        )}
      </div>

      {papel === "leitura" && (
        <div
          role="note"
          className="flex items-center gap-2.5 rounded-xl border border-hubee-400/60 bg-hubee-100 px-4 py-3 text-xs font-medium text-hubee-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
        >
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <span>Apenas Administradores e Membros podem criar eventos</span>
        </div>
      )}

      {status === "error" ? (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar os eventos da organização"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={retry}
        />
      ) : todosEventos.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento criado ainda"
          description={
            podeCriarEvento
              ? "Comece criando o primeiro evento da sua organização para divulgar e vender ingressos na Hubee."
              : "Nenhum evento nesta organização. Quando um Administrador ou Membro criar um evento, você poderá visualizá-lo aqui."
          }
          action={
            podeCriarEvento
              ? { label: "+ Criar Novo Evento", onClick: handleCriarEvento }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div
              role="group"
              aria-label="Filtrar eventos por status"
              className="flex flex-wrap items-center gap-2"
            >
              <ListFilter aria-hidden="true" className="size-4 shrink-0" />
              {filtroStatusEventoOrdem.map((itemStatus) => {
                const ativo = filtroStatus === itemStatus;
                return (
                  <button
                    key={itemStatus}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() =>
                      setFiltroStatus(ativo && itemStatus !== "all" ? "all" : itemStatus)
                    }
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400",
                      ativo
                        ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                        : "border-hubee-300 bg-hubee-neutral-25 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:hover:bg-hubee-750",
                    )}
                  >
                    {getFiltroStatusLabel(itemStatus)}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <label htmlFor={searchInputId} className="sr-only">
                Buscar por nome do evento
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hubee-neutral-300 dark:text-hubee-200"
              />
              <Input
                id={searchInputId}
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome do evento"
                className="rounded-lg border-hubee-300 bg-hubee-neutral-25 pl-9 text-hubee-800 placeholder:text-hubee-neutral-300 dark:border-hubee-50/20 dark:bg-hubee-800 dark:text-hubee-50"
              />
            </div>
          </div>

          <p role="status" className="text-xs text-hubee-750/75 dark:text-hubee-200">
            Exibindo {eventosFiltrados.length} de {todosEventos.length}{" "}
            {todosEventos.length === 1 ? "evento" : "eventos"}
          </p>

          {eventosFiltrados.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nenhum evento encontrado"
              description="Não encontramos eventos com os filtros selecionados."
              action={
                temFiltroAtivo ? { label: "Limpar filtros", onClick: limparFiltros } : undefined
              }
            />
          ) : (
            <ul className="grid gap-4 xl:grid-cols-2">
              {eventosFiltrados.map((evento) => (
                <li key={evento.id}>
                  <EventoOrganizadorCard evento={evento} papel={papel} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

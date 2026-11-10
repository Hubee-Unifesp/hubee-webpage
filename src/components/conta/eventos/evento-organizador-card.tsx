"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Copy, ExternalLink, MoreHorizontal, Pencil, Send, Ticket } from "lucide-react";
import { CategoryPill, EventMedia } from "@/components/home/events/event-media";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  canCancelEvent,
  canCreateOrEditEvent,
  canDuplicateEvent,
  canViewPublicPage,
  getPrimaryEventActionLabel,
  type EventoOrganizador,
  type PapelOrganizador,
} from "@/types/organizacao";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cancelarEvento, duplicarEvento, publicarEvento } from "@/lib/api/organizer-events";
import { ConfirmarAcaoEventoModal, type AcaoEvento } from "./editor/confirmar-acao-evento-modal";
import { canEditEvent } from "./editor/evento-editor.data";
import { StatusEventoBadge } from "./status-evento-badge";

interface EventoOrganizadorCardProps {
  evento: EventoOrganizador;
  papel: PapelOrganizador;
  /** Chamado depois de publicar, duplicar ou cancelar, para a listagem buscar os dados novos. */
  onAlterado: () => void;
}

/** Cartão de evento na listagem do painel do organizador ("Meus Eventos"). */
export function EventoOrganizadorCard({ evento, papel, onAlterado }: EventoOrganizadorCardProps) {
  const router = useRouter();
  const toast = useToast();
  const [acao, setAcao] = useState<AcaoEvento | null>(null);
  const primaryLabel = getPrimaryEventActionLabel(papel, evento.status);
  const showQuickActionsMenu = canCreateOrEditEvent(papel);
  const showPublicLink = canViewPublicPage(evento.status);
  const showEdit = canEditEvent(papel, evento.status);
  const showPublish = showEdit && evento.status === "draft";
  const showDuplicate = canDuplicateEvent(papel);
  const showCancel = canCancelEvent(papel, evento.status);
  const editarHref = `/meus-eventos/${evento.id}/editar`;

  const handlePrimaryAction = () => {
    router.push(evento.status === "draft" ? editarHref : `${editarHref}?etapa=lotes`);
  };

  const handleDuplicate = async () => {
    try {
      const copia = await duplicarEvento(evento.id);
      toast.success(`"${evento.nome}" duplicado como rascunho.`);
      onAlterado();
      router.push(`/meus-eventos/${copia.id}/editar`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível duplicar o evento. Tente novamente."));
    }
  };

  /** Erro sobe para o modal continuar aberto; o toast explica o motivo (ex.: evento sem lotes). */
  const confirmarAcao = async (escolhida: AcaoEvento) => {
    try {
      if (escolhida === "publicar") {
        await publicarEvento(evento.id, []);
        toast.success(`"${evento.nome}" publicado com sucesso.`);
      } else {
        await cancelarEvento(evento.id);
        toast.success(`"${evento.nome}" cancelado.`);
      }
      setAcao(null);
      onAlterado();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <article className="flex h-full overflow-hidden rounded-xl border border-hubee-400 bg-hubee-100 text-hubee-750 shadow-sm dark:border-hubee-500/60 dark:bg-hubee-750/35 dark:text-hubee-100">
      <EventMedia
        category={evento.categoria}
        startDate={evento.dataInicio}
        soldOut={evento.capacidade > 0 && evento.ingressosVendidos >= evento.capacidade}
        className="min-h-44 w-2/5 shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <CategoryPill category={evento.categoria} />
          <StatusEventoBadge status={evento.status} />
        </div>

        <h3 className="mt-0.5 line-clamp-1 font-heading text-lg leading-tight font-bold text-hubee-800 dark:text-hubee-50">
          {evento.nome}
        </h3>

        {evento.descricao && (
          <p className="line-clamp-1 text-xs text-hubee-750 dark:text-hubee-200">{evento.descricao}</p>
        )}

        <p className="line-clamp-2 text-xs font-medium text-hubee-800 dark:text-hubee-100">
          {evento.local} · {formatEventDate(evento.dataInicio, evento.dataFim)}
        </p>

        <div className="mt-1 flex flex-col gap-1">
          <div
            role="progressbar"
            aria-label={`Ingressos vendidos de ${evento.nome}`}
            aria-valuenow={evento.percentualVendido}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-hubee-200 dark:bg-hubee-800"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 6"
              preserveAspectRatio="none"
              className="block size-full text-hubee-600 dark:text-hubee-400"
            >
              <rect x={0} y={0} width={evento.percentualVendido} height={6} fill="currentColor" />
            </svg>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-hubee-750 dark:text-hubee-200">
            <span>
              {evento.capacidade > 0
                ? `${evento.ingressosVendidos} / ${evento.capacidade} vendidos`
                : "0 / 0 vendidos (sem lotes)"}
            </span>
            <span className="font-semibold text-hubee-800 dark:text-hubee-50">
              {evento.percentualVendido}%
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="flex flex-col leading-tight">
            <span className="text-[10px]">
              {evento.loteMinimo ? `a partir de (${evento.loteMinimo})` : "a partir de"}
            </span>
            <span className="text-base font-bold text-hubee-800 dark:text-hubee-50">
              {formatPrice(evento.precoMinimo)}
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            {papel === "leitura" ? (
              <Button
                asChild
                size="sm"
                aria-label={`${primaryLabel} evento ${evento.nome}`}
                className="rounded-full bg-hubee-750 px-3.5 text-xs font-semibold text-hubee-50 hover:bg-hubee-800 focus-visible:ring-hubee-800 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
              >
                <Link href={`/eventos/${evento.id}`}>{primaryLabel}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handlePrimaryAction}
                aria-label={`${primaryLabel} evento ${evento.nome}`}
                className="rounded-full bg-hubee-750 px-3.5 text-xs font-semibold text-hubee-50 hover:bg-hubee-800 focus-visible:ring-hubee-800 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
              >
                {primaryLabel}
              </Button>
            )}

            {showQuickActionsMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Mais opções para ${evento.nome}`}
                    className="rounded-full border-hubee-400 bg-hubee-50 text-hubee-800 hover:bg-hubee-200 dark:border-hubee-500 dark:bg-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-750"
                  >
                    <MoreHorizontal aria-hidden="true" className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  {showPublicLink && (
                    <DropdownMenuItem asChild>
                      <Link href={`/eventos/${evento.id}`}>
                        <ExternalLink aria-hidden="true" />
                        Ver página pública
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {showEdit && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={editarHref}>
                          <Pencil aria-hidden="true" />
                          Editar evento
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`${editarHref}?etapa=lotes`}>
                          <Ticket aria-hidden="true" />
                          Gerenciar lotes
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {showPublish && (
                    <DropdownMenuItem onSelect={() => setAcao("publicar")}>
                      <Send aria-hidden="true" />
                      Publicar evento
                    </DropdownMenuItem>
                  )}
                  {showDuplicate && (
                    <DropdownMenuItem onSelect={handleDuplicate}>
                      <Copy aria-hidden="true" />
                      Duplicar evento
                    </DropdownMenuItem>
                  )}
                  {showCancel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => setAcao("cancelar")}>
                        <Ban aria-hidden="true" />
                        Cancelar evento
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      <ConfirmarAcaoEventoModal
        acao={acao}
        nomeEvento={evento.nome}
        onClose={() => setAcao(null)}
        onConfirm={confirmarAcao}
      />
    </article>
  );
}


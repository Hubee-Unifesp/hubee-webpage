"use client";

import { CheckCheck } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { formatBadgeCount } from "@/components/layout/logged/account-nav.config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FILTRO_NAO_LIDAS,
  FILTRO_TODAS_NOTIFICACOES,
  type FiltroNotificacoes,
} from "./notificacoes.data";

export interface NotificacoesHeaderProps {
  filtro: FiltroNotificacoes;
  onFiltroChange: (filtro: FiltroNotificacoes) => void;
  totalCount: number;
  unreadCount: number;
  onMarcarTodasComoLidas?: () => void;
  marcandoTodas?: boolean;
  exibirControles?: boolean;
}

const pillBaseClassName =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hubee-500 dark:focus-visible:ring-hubee-400";

const pillActiveClassName =
  "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800";

const pillInactiveClassName =
  "border-hubee-300 bg-hubee-neutral-25 font-medium text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-50/10";

/** Cabeçalho da central de notificações (`/notificacoes`): título, subtítulo, abas de filtro e ação em massa. */
export function NotificacoesHeader({
  filtro,
  onFiltroChange,
  totalCount,
  unreadCount,
  onMarcarTodasComoLidas,
  marcandoTodas = false,
  exibirControles = true,
}: NotificacoesHeaderProps) {
  const todasAtiva = filtro === FILTRO_TODAS_NOTIFICACOES;
  const naoLidasAtiva = filtro === FILTRO_NAO_LIDAS;
  const podeMarcarTodas = unreadCount > 0 && !marcandoTodas;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ContaPageTitle>Notificações</ContaPageTitle>
        <p className="mt-1 text-sm text-hubee-750 dark:text-hubee-100">
          Acompanhe atualizações dos seus pedidos, ingressos e eventos.
        </p>
      </div>

      {exibirControles && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="Filtrar notificações" className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={todasAtiva}
              onClick={() => onFiltroChange(FILTRO_TODAS_NOTIFICACOES)}
              className={cn(pillBaseClassName, todasAtiva ? pillActiveClassName : pillInactiveClassName)}
            >
              <span>Todas</span>
              {totalCount > 0 && (
                <span className="tabular-nums opacity-80">({totalCount})</span>
              )}
            </button>

            <button
              type="button"
              aria-pressed={naoLidasAtiva}
              onClick={() => onFiltroChange(FILTRO_NAO_LIDAS)}
              className={cn(pillBaseClassName, naoLidasAtiva ? pillActiveClassName : pillInactiveClassName)}
            >
              <span>Não lidas</span>
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] leading-none font-bold tabular-nums",
                  naoLidasAtiva
                    ? "bg-hubee-400 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50"
                    : "bg-hubee-200 text-hubee-800 dark:bg-hubee-50/15 dark:text-hubee-50",
                )}
              >
                {formatBadgeCount(unreadCount)}
              </span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!podeMarcarTodas}
            onClick={onMarcarTodasComoLidas}
            className="h-9 cursor-pointer self-start rounded-lg border-hubee-300 bg-hubee-neutral-25 px-3.5 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto dark:border-hubee-50/20 dark:bg-hubee-50/5 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
          >
            <CheckCheck aria-hidden="true" className="size-4" />
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  );
}

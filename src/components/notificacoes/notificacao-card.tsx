"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarX2,
  RotateCcw,
  ShoppingBag,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatRelativeNotificationTime,
  getNotificacaoActionLabel,
  isNotificacaoNaoLida,
  type NotificacaoItem,
  type NotificacaoTipo,
} from "./notificacoes.data";

export interface NotificacaoCardProps {
  notificacao: NotificacaoItem;
  onMarcarComoLida?: (id: string) => void;
  referenceDate?: Date;
}

interface NotificacaoIconAppearance {
  icon: LucideIcon;
  containerClassName: string;
}

function getNotificacaoIconAppearance(type: NotificacaoTipo): NotificacaoIconAppearance {
  switch (type) {
    case "ORDER_PAID":
      return {
        icon: Ticket,
        containerClassName:
          "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/70 dark:text-emerald-300",
      };
    case "TICKET_TYPE_SOLD_OUT":
      return {
        icon: AlertCircle,
        containerClassName:
          "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/70 dark:text-amber-300",
      };
    case "NEW_SALE":
      return {
        icon: ShoppingBag,
        containerClassName:
          "border-hubee-400 bg-hubee-200 text-hubee-800 dark:border-hubee-400/40 dark:bg-hubee-400/20 dark:text-hubee-300",
      };
    case "ORDER_CANCELLED":
      return {
        icon: RotateCcw,
        containerClassName:
          "border-stone-300 bg-stone-200 text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200",
      };
    case "EVENT_CANCELLED":
      return {
        icon: CalendarX2,
        containerClassName:
          "border-red-300 bg-red-100 text-red-800 dark:border-red-800/60 dark:bg-red-950/70 dark:text-red-300",
      };
    default:
      return {
        icon: Bell,
        containerClassName:
          "border-hubee-300 bg-hubee-100 text-hubee-800 dark:border-hubee-50/20 dark:bg-hubee-50/10 dark:text-hubee-50",
      };
  }
}

/** Card individual de notificação em `/notificacoes`, diferenciando visual e semanticamente não lida vs. lida. */
export function NotificacaoCard({
  notificacao,
  onMarcarComoLida,
  referenceDate,
}: NotificacaoCardProps) {
  const naoLida = isNotificacaoNaoLida(notificacao);
  const { icon: Icon, containerClassName } = getNotificacaoIconAppearance(notificacao.type);
  const tempoRelativo = formatRelativeNotificationTime(notificacao.createdAt, referenceDate);
  const actionLabel = getNotificacaoActionLabel(notificacao.type, notificacao.href);

  function handleNavigateClick() {
    if (naoLida && onMarcarComoLida) {
      onMarcarComoLida(notificacao.id);
    }
  }

  return (
    <article
      aria-label={`${notificacao.title}${naoLida ? " (Não lida)" : ""}`}
      className={cn(
        "flex items-start gap-3.5 rounded-xl border p-4 transition-colors md:gap-4 md:p-5",
        naoLida
          ? "border-hubee-400 bg-hubee-100/80 hover:bg-hubee-100 dark:border-hubee-400/50 dark:bg-hubee-850 dark:hover:border-hubee-400"
          : "border-hubee-200 bg-hubee-neutral-25 hover:border-hubee-400 hover:bg-hubee-100/60 dark:border-hubee-50/10 dark:bg-hubee-50/7 dark:hover:border-hubee-400/40 dark:hover:bg-hubee-50/12",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
          containerClassName,
        )}
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "text-sm md:text-base",
                naoLida
                  ? "font-bold text-hubee-800 dark:text-hubee-50"
                  : "font-semibold text-hubee-750 dark:text-hubee-100",
              )}
            >
              {notificacao.href ? (
                <Link
                  href={notificacao.href}
                  onClick={handleNavigateClick}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-hubee-500 dark:focus-visible:ring-hubee-400"
                >
                  {notificacao.title}
                </Link>
              ) : (
                notificacao.title
              )}
            </h2>
            {naoLida && (
              <>
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full bg-hubee-500 dark:bg-hubee-400"
                />
                <span className="sr-only">Não lida</span>
              </>
            )}
          </div>

          {tempoRelativo && (
            <time
              dateTime={notificacao.createdAt}
              className="shrink-0 text-xs font-medium tabular-nums text-hubee-neutral-300 dark:text-hubee-200"
            >
              {tempoRelativo}
            </time>
          )}
        </div>

        <p className="mt-1 text-sm leading-5 text-hubee-750 dark:text-hubee-100">
          {notificacao.message}
        </p>

        {(notificacao.href || (naoLida && onMarcarComoLida)) && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            {notificacao.href ? (
              <Link
                href={notificacao.href}
                onClick={handleNavigateClick}
                className="inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-hubee-800 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-hubee-500 dark:text-hubee-300 dark:focus-visible:ring-hubee-400"
              >
                <span>{actionLabel}</span>
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            ) : (
              <span />
            )}

            {naoLida && onMarcarComoLida && (
              <button
                type="button"
                onClick={() => onMarcarComoLida(notificacao.id)}
                className="cursor-pointer rounded-sm text-xs font-semibold text-hubee-750 underline-offset-4 outline-none hover:text-hubee-800 hover:underline focus-visible:ring-2 focus-visible:ring-hubee-500 dark:text-hubee-300 dark:hover:text-hubee-50 dark:focus-visible:ring-hubee-400"
              >
                Marcar como lida
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

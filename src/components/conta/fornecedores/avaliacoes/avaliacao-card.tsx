import { CalendarDays, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatOrderDate } from "@/components/conta/pedidos/format";
import { cn } from "@/lib/utils";
import type { AvaliacaoFornecedor } from "@/types/avaliacao-fornecedor";
import { CRITERIOS, formatarNota } from "./avaliacoes.data";
import { EstrelasNota } from "./estrelas";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

/** Uma avaliação: autor, evento, nota geral, notas por critério, recomendação e comentário. */
export function AvaliacaoCard({ avaliacao }: { avaliacao: AvaliacaoFornecedor }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 shadow-sm md:p-5 dark:border-hubee-750 dark:bg-hubee-neutral-500">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hubee-400 text-sm font-bold text-hubee-800"
          >
            {iniciais(avaliacao.authorName)}
          </span>
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-sm font-semibold">{avaliacao.authorName}</h3>
            <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Avaliado em <time dateTime={avaliacao.createdAt}>{formatOrderDate(avaliacao.createdAt)}</time>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EstrelasNota nota={avaliacao.nota} />
          <span className="text-sm font-bold tabular-nums">{formatarNota(avaliacao.nota)}</span>
        </div>
      </header>

      <p className="inline-flex items-center gap-2 self-start rounded-lg bg-hubee-100 px-2.5 py-1.5 text-xs font-medium text-hubee-800 dark:bg-hubee-750 dark:text-hubee-50">
        <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="sr-only">Evento:</span>
        <span className="line-clamp-1">{avaliacao.eventName}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={avaliacao.eventDate} className="whitespace-nowrap">
          {formatOrderDate(avaliacao.eventDate)}
        </time>
      </p>

      {avaliacao.comentario && (
        <blockquote className="border-l-2 border-hubee-400 pl-3 text-sm leading-relaxed">
          {avaliacao.comentario}
        </blockquote>
      )}

      <footer className="flex flex-col gap-3 border-t border-hubee-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-hubee-750">
        <dl className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {CRITERIOS.map((criterio) => (
            <div key={criterio.id} className="flex items-center gap-1.5">
              <dt className="text-hubee-neutral-300 dark:text-hubee-200">{criterio.label}</dt>
              <dd className="font-semibold tabular-nums">{avaliacao.notas[criterio.id]}/5</dd>
            </div>
          ))}
        </dl>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap sm:self-auto",
            avaliacao.recomenda
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300",
          )}
        >
          {avaliacao.recomenda ? (
            <ThumbsUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ThumbsDown aria-hidden="true" className="size-3.5" />
          )}
          {avaliacao.recomenda ? "Recomenda" : "Não recomenda"}
        </span>
      </footer>
    </article>
  );
}

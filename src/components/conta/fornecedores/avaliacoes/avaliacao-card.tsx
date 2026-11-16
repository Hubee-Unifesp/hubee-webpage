import { formatOrderDate } from "@/components/conta/pedidos/format";
import type { AvaliacaoFornecedor } from "@/types/avaliacao-fornecedor";
import { formatarNota } from "./avaliacoes.data";
import { EstrelasNota } from "./estrelas";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

/** Uma avaliação: autor, nota e comentário. */
export function AvaliacaoCard({ avaliacao }: { avaliacao: AvaliacaoFornecedor }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 shadow-sm md:p-5 dark:border-hubee-750 dark:bg-hubee-neutral-500">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hubee-400 text-sm font-bold text-hubee-800"
          >
            {iniciais(avaliacao.userName)}
          </span>
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate text-sm font-semibold">{avaliacao.userName}</h3>
            <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Avaliado em <time dateTime={avaliacao.createdAt}>{formatOrderDate(avaliacao.createdAt)}</time>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EstrelasNota nota={avaliacao.rating} />
          <span className="text-sm font-bold tabular-nums">{formatarNota(avaliacao.rating)}</span>
        </div>
      </header>

      {avaliacao.comment && (
        <blockquote className="border-l-2 border-hubee-400 pl-3 text-sm leading-relaxed">
          {avaliacao.comment}
        </blockquote>
      )}
    </article>
  );
}

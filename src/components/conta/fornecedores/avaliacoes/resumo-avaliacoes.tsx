import { ThumbsUp } from "lucide-react";
import type { ResumoAvaliacoes as Resumo } from "@/types/avaliacao-fornecedor";
import { CRITERIOS, formatarNota, formatarTotalAvaliacoes, NOTAS } from "./avaliacoes.data";
import { EstrelasNota } from "./estrelas";

const cardClassName =
  "rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm dark:border-hubee-50/10 dark:bg-hubee-50/7";
const tituloClassName = "text-sm font-semibold";
const barraFundoClassName = "h-2 flex-1 overflow-hidden rounded-full bg-hubee-100 dark:bg-hubee-800";
const barraClassName = "h-full rounded-full bg-hubee-500 dark:bg-hubee-400";

/** Painel com média geral, distribuição por estrelas, médias por critério e % de recomendação. */
export function ResumoAvaliacoes({ resumo }: { resumo: Resumo }) {
  return (
    <section aria-label="Resumo das avaliações" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className={`${cardClassName} grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center`}>
        <div className="flex flex-col items-center gap-1.5 sm:border-r sm:border-hubee-200 sm:pr-6 dark:sm:border-hubee-50/10">
          <span className="font-heading text-5xl leading-none font-bold tabular-nums">{formatarNota(resumo.media)}</span>
          <EstrelasNota nota={resumo.media} />
          <span className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
            {formatarTotalAvaliacoes(resumo.total)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="sr-only">Distribuição das notas</h2>
          {NOTAS.map((nota) => {
            const quantidade = resumo.distribuicao[nota];
            const percentual = resumo.total ? (quantidade / resumo.total) * 100 : 0;
            return (
              <div key={nota} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 tabular-nums">
                  {nota} {nota === 1 ? "estrela" : "estrelas"}
                </span>
                <div
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percentual)}
                  aria-label={`${quantidade} de ${resumo.total} avaliações com ${nota} ${nota === 1 ? "estrela" : "estrelas"}`}
                  className={barraFundoClassName}
                >
                  <div className={barraClassName} style={{ width: `${percentual}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right tabular-nums">{quantidade}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${cardClassName} flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={tituloClassName}>Médias por critério</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ThumbsUp aria-hidden="true" className="size-3.5" />
            {resumo.percentualRecomenda}% recomendam
          </span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {CRITERIOS.map((criterio) => {
            const media = resumo.mediasPorCriterio[criterio.id];
            return (
              <div key={criterio.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <dt className="font-semibold">{criterio.label}</dt>
                  <dd className="font-semibold tabular-nums">{formatarNota(media)}</dd>
                </div>
                <div aria-hidden="true" className={barraFundoClassName}>
                  <div className={barraClassName} style={{ width: `${(media / 5) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

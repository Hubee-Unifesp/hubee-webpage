import type { ResumoAvaliacoes as Resumo } from "@/types/avaliacao-fornecedor";
import { formatarNota, formatarTotalAvaliacoes, NOTAS } from "./avaliacoes.data";
import { EstrelasNota } from "./estrelas";

const cardClassName =
  "rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm dark:border-hubee-50/10 dark:bg-hubee-50/7";
const barraFundoClassName = "h-2 flex-1 overflow-hidden rounded-full bg-hubee-100 dark:bg-hubee-850";
const barraClassName = "h-full rounded-full bg-hubee-500 dark:bg-hubee-400";

/** Painel com média geral e distribuição das notas por estrelas. */
export function ResumoAvaliacoes({ resumo }: { resumo: Resumo }) {
  return (
    <section aria-label="Resumo das avaliações" className={`${cardClassName} grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center`}>
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
    </section>
  );
}

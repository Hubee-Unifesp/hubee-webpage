"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DespesaPlanejamento, TotaisDespesas } from "@/types/planejamento";
import { painelClassName, textoSecundarioClassName } from "./estilos";
import {
  contarPendencias,
  formatarMoeda,
  GRUPOS_DESPESA,
  totaisPorCategoria,
  type FiltroDespesas,
} from "./planejamento.data";

interface DestinoDinheiroProps {
  despesas: readonly DespesaPlanejamento[];
  totais: TotaisDespesas;
  onFiltrar: (filtro: FiltroDespesas) => void;
}

const rotuloGrupo = Object.fromEntries(GRUPOS_DESPESA.map(({ id, curto }) => [id, curto]));

export function DestinoDinheiro({ despesas, totais, onFiltrar }: DestinoDinheiroProps) {
  const categorias = totaisPorCategoria(despesas);
  const maior = categorias[0]?.total ?? 0;
  const pendencias = contarPendencias(despesas);
  const percentualPago = totais.total > 0 ? (totais.pago / totais.total) * 100 : 0;

  return (
    <section aria-labelledby="destino-titulo" className={cn(painelClassName, "flex flex-col gap-4")}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="destino-titulo" className="text-sm font-semibold text-hubee-neutral-300 dark:text-hubee-neutral-200">
          Para onde vai o dinheiro
        </h2>
        <span className="text-lg font-semibold tabular-nums">{formatarMoeda(totais.total)}</span>
      </div>

      <ul className="flex flex-col gap-2">
        {categorias.map(({ category, group, total }, index) => (
          <li key={category} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-medium">{category}</span>
                <span className={cn("ml-1.5 text-xs", textoSecundarioClassName)}>{rotuloGrupo[group]}</span>
              </span>
              <span className={cn("tabular-nums", total === 0 && textoSecundarioClassName)}>{formatarMoeda(total)}</span>
            </span>
            {total > 0 && (
              <span aria-hidden="true" className="h-0.5 w-full">
                <span
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
                    index === 0 ? "bg-hubee-800 dark:bg-hubee-50" : "bg-hubee-neutral-200 dark:bg-white/25",
                  )}
                  style={{ width: `${(total / maior) * 100}%` }}
                />
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t border-hubee-neutral-50 pt-4 dark:border-white/10">
        <h3 className="text-sm font-semibold">Pagamentos</h3>
        <div
          role="progressbar"
          aria-label="Despesas já pagas"
          aria-valuenow={Math.round(percentualPago)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full bg-hubee-100 dark:bg-white/10"
        >
          <div
            className="h-full rounded-full bg-hubee-500 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percentualPago}%` }}
          />
        </div>
        <p className="flex justify-between gap-3 text-xs tabular-nums">
          <span>
            <span className="font-semibold">{formatarMoeda(totais.pago)}</span> pagos
          </span>
          <span className={textoSecundarioClassName}>{formatarMoeda(totais.pendente)} a pagar</span>
        </p>
      </div>

      <div className="flex flex-col">
        {[
          { filtro: "a-pagar" as const, quantidade: pendencias.aPagar, texto: "a pagar" },
          { filtro: "sem-cotacao" as const, quantidade: pendencias.semCotacao, texto: "sem cotação" },
        ].map(({ filtro, quantidade, texto }) => (
          <button
            key={filtro}
            type="button"
            onClick={() => onFiltrar(filtro)}
            disabled={quantidade === 0}
            className="group flex min-h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-2 -mx-2 text-left text-sm outline-none hover:bg-hubee-50 focus-visible:ring-3 focus-visible:ring-hubee-800 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-white/5"
          >
            <span>
              <span className="font-semibold tabular-nums">{quantidade}</span> {quantidade === 1 ? "item" : "itens"} {texto}
            </span>
            {quantidade > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-hubee-750 dark:text-hubee-neutral-200">
                Ver
                <ChevronRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

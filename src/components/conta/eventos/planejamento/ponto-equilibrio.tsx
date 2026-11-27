"use client";

import { useId, useMemo } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicadoresPublico, LotePlanejamento } from "@/types/planejamento";
import { cenariosDePublico, formatarMoeda, formatarNumero, type SegmentoLote } from "./planejamento.data";
import { painelClassName } from "./estilos";

interface PontoEquilibrioProps {
  eventoId: string;
  lotes: readonly LotePlanejamento[];
  segmentos: readonly SegmentoLote[];
  simulacao: IndicadoresPublico;
  despesaTotal: number;
  publicoEsperado: number | null;
  onPublicoChange: (publico: number) => void;
  onDefinirEsperado: (publico: number) => Promise<void>;
}

function arredondarEscala(valor: number): number {
  return Math.max(50, Math.ceil(valor / 50) * 50);
}

function percentual(valor: number, maximo: number): string {
  return `${Math.min(100, Math.max(0, (valor / maximo) * 100))}%`;
}

function Figura({ rotulo, valor, tom }: { rotulo: string; valor: string; tom?: "positivo" | "negativo" }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 py-3 last:col-span-2 sm:px-3 sm:first:pl-0 sm:last:col-span-1">
      <dt className="text-xs font-medium text-hubee-neutral-300 dark:text-hubee-neutral-200">{rotulo}</dt>
      <dd
        className={cn(
          "truncate text-base font-semibold tabular-nums",
          tom === "positivo" && "text-[#247b50] dark:text-[#4fc98a]",
          tom === "negativo" && "text-[#c4242a] dark:text-[#f07186]",
        )}
      >
        {valor}
      </dd>
    </div>
  );
}

export function PontoEquilibrio({
  eventoId,
  lotes,
  segmentos,
  simulacao,
  despesaTotal,
  publicoEsperado,
  onPublicoChange,
  onDefinirEsperado,
}: PontoEquilibrioProps) {
  const sliderId = useId();
  const numeroId = useId();
  const publico = simulacao.audience;
  const breakEven = simulacao.breakEven;
  const minimo = breakEven === null ? null : Math.ceil(breakEven);
  const esperado = publicoEsperado ?? 0;
  const escala = arredondarEscala(Math.max(esperado * 1.35, (minimo ?? 0) * 1.25, publico, 100));
  const semLotes = lotes.length === 0;
  const lucro = (simulacao.profit ?? 0) >= 0;
  const loteDoEmpate = simulacao.breakEvenBatch;
  const diferente = publicoEsperado !== null && publico !== publicoEsperado;
  const moedaOuTraco = (valor: number | null) => (valor === null ? "—" : formatarMoeda(valor));

  const cenarios = useMemo(
    () => (semLotes ? [] : cenariosDePublico(lotes, despesaTotal, publicoEsperado ?? publico)),
    [semLotes, lotes, despesaTotal, publicoEsperado, publico],
  );

  const achado =
    minimo === null || simulacao.profit === null
      ? null
      : lucro
        ? `Com ${formatarNumero(publico)} pessoas sobram ${formatarMoeda(simulacao.profit)}: ${formatarNumero(Math.max(0, publico - minimo))} ingressos de folga.`
        : `Com ${formatarNumero(publico)} pessoas faltam ${formatarMoeda(-simulacao.profit)}: venda mais ${formatarNumero(Math.max(1, minimo - publico))} ingressos para empatar.`;

  return (
    <section aria-labelledby="equilibrio-titulo" className={cn(painelClassName, "flex h-full flex-col gap-6")}>
      <div className="flex flex-col gap-1">
        <h2 id="equilibrio-titulo" className="text-sm font-semibold text-hubee-neutral-300 dark:text-hubee-neutral-200">
          Ponto de equilíbrio
        </h2>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-heading text-4xl font-bold tabular-nums">
            {minimo === null ? "—" : formatarNumero(minimo)}
          </span>
          <span className="text-base font-medium">ingressos pagam o evento</span>
        </p>
        <p
          aria-live="polite"
          className={cn("text-sm", lucro ? "text-hubee-800 dark:text-hubee-50" : "text-[#c4242a] dark:text-[#f07186]")}
        >
          {achado ?? (
            <>
              {semLotes ? "Cadastre os lotes para calcular quantos ingressos pagam o evento. " : "Informe o público para simular o resultado. "}
              {semLotes && (
                <Link
                  href={`/meus-eventos/${eventoId}/editar?etapa=lotes`}
                  className="rounded-sm font-semibold underline outline-none focus-visible:ring-3 focus-visible:ring-hubee-800"
                >
                  Ir para Ingressos
                </Link>
              )}
            </>
          )}
          {achado && loteDoEmpate && lucro && minimo !== null && (
            <span className="text-hubee-neutral-300 dark:text-hubee-neutral-200"> O {formatarNumero(minimo)}º sai no {loteDoEmpate}.</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative pt-6">
          {minimo !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-10 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300 motion-reduce:transition-none"
              style={{ left: percentual(minimo, escala) }}
            >
              <span className="text-[11px] font-semibold whitespace-nowrap">Empata em {formatarNumero(minimo)}</span>
              <span className="w-0 flex-1 border-l border-dashed border-hubee-800 dark:border-hubee-50" />
            </div>
          )}

          <div className="relative h-12 overflow-hidden rounded-md bg-hubee-neutral-50/50 dark:bg-white/[0.03]">
            {segmentos.map(({ lote, inicio, fim }, index) => {
              const largura = ((fim - inicio) / escala) * 100;
              return (
                <div
                  key={lote.id}
                  title={`${lote.batch}: ${formatarNumero(fim - inicio)} ingressos a ${formatarMoeda(lote.price)}`}
                  className={cn(
                    "absolute inset-y-0 flex items-center overflow-hidden border-r-2 border-white px-1.5 transition-[left,width] duration-300 motion-reduce:transition-none dark:border-hubee-900",
                    index % 2 === 0 ? "bg-hubee-100 dark:bg-white/8" : "bg-hubee-200 dark:bg-white/14",
                  )}
                  style={{ left: percentual(inicio, escala), width: `${largura}%` }}
                >
                  {largura >= 7 && <span className="truncate text-[11px] font-medium text-hubee-750 dark:text-hubee-100">{lote.batch}</span>}
                </div>
              );
            })}
          </div>

          <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-hubee-neutral-50/60 dark:bg-white/10">
            {minimo !== null && (
              <>
                <div
                  className="absolute inset-y-0 left-0 bg-hubee-neutral-200 transition-[width] duration-300 motion-reduce:transition-none dark:bg-hubee-neutral-200/60"
                  style={{ width: percentual(Math.min(publico, minimo), escala) }}
                />
                {lucro ? (
                  <div
                    className="absolute inset-y-0 bg-hubee-500 transition-[left,width] duration-300 motion-reduce:transition-none"
                    style={{ left: percentual(minimo, escala), width: percentual(publico - minimo, escala) }}
                  />
                ) : (
                  <div
                    className="absolute inset-y-0 bg-[#ffd5cf] transition-[left,width] duration-300 motion-reduce:transition-none dark:bg-[#f07186]/30"
                    style={{ left: percentual(publico, escala), width: percentual(minimo - publico, escala) }}
                  />
                )}
              </>
            )}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-6 bottom-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-hubee-800 transition-[left] duration-150 motion-reduce:transition-none dark:bg-hubee-400"
            style={{ left: percentual(publico, escala) }}
          />
          <label htmlFor={sliderId} className="sr-only">
            Simular público
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={escala}
            step={1}
            value={publico}
            aria-valuetext={`${formatarNumero(publico)} pessoas`}
            onChange={(event) => onPublicoChange(Number(event.target.value))}
            className={cn(
              "absolute inset-x-0 top-6 bottom-0 z-20 m-0 w-full cursor-ew-resize appearance-none bg-transparent outline-none",
              "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:bg-transparent",
              "[&::-webkit-slider-thumb]:mt-3.5 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-hubee-800 [&::-webkit-slider-thumb]:bg-white",
              "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-hubee-800 [&::-moz-range-thumb]:bg-white",
              "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-hubee-500/40",
            )}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-hubee-neutral-300 dark:text-hubee-neutral-200">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-3 rounded-sm bg-hubee-neutral-200" />
              Cobre as despesas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-3 rounded-sm bg-hubee-500" />
              Lucro
            </span>
          </span>
          <span className="flex items-center gap-2">
            <label htmlFor={numeroId} className="font-medium text-hubee-800 dark:text-hubee-50">
              Simular
            </label>
            <input
              id={numeroId}
              type="number"
              min={0}
              max={99999}
              value={publico}
              onChange={(event) => onPublicoChange(Math.max(0, Math.min(99999, Number(event.target.value) || 0)))}
              className="h-8 w-20 rounded-md border border-hubee-neutral-50 bg-white px-2 text-right text-sm font-semibold text-hubee-800 tabular-nums outline-none focus-visible:border-hubee-600 focus-visible:ring-3 focus-visible:ring-hubee-500/30 dark:border-white/15 dark:bg-black/20 dark:text-hubee-50"
            />
            <span>pessoas</span>
            {diferente && (
              <>
                <button
                  type="button"
                  onClick={() => onPublicoChange(publicoEsperado!)}
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 font-semibold text-hubee-800 outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:text-hubee-50 dark:hover:bg-white/10"
                >
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  Voltar para {formatarNumero(publicoEsperado!)}
                </button>
                <button
                  type="button"
                  onClick={() => void onDefinirEsperado(publico)}
                  className="h-8 cursor-pointer rounded-md border border-hubee-neutral-50 bg-white px-2.5 font-semibold text-hubee-800 outline-none hover:bg-hubee-50 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:border-white/15 dark:bg-black/20 dark:text-hubee-50"
                >
                  Usar como esperado
                </button>
              </>
            )}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 divide-hubee-neutral-50 border-y border-hubee-neutral-50 sm:grid-cols-5 sm:divide-x dark:divide-white/10 dark:border-white/10">
        <Figura rotulo="Receita" valor={moedaOuTraco(simulacao.revenue)} />
        <Figura rotulo="Despesas" valor={formatarMoeda(despesaTotal)} />
        <Figura rotulo="Ticket médio" valor={moedaOuTraco(simulacao.averageTicket)} />
        <Figura rotulo="Custo por pessoa" valor={moedaOuTraco(simulacao.costPerPerson)} />
        <Figura
          rotulo={lucro ? "Lucro" : "Prejuízo"}
          valor={moedaOuTraco(simulacao.profit)}
          tom={simulacao.profit === null ? undefined : lucro ? "positivo" : "negativo"}
        />
      </dl>

      {cenarios.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">E se vier mais ou menos gente?</h3>
          <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
            {cenarios.map((cenario) => {
              const ativo = cenario.audience === publico;
              const resultado = cenario.profit ?? 0;
              const positivo = resultado >= 0;
              return (
                <li key={cenario.audience} className="w-36 shrink-0 snap-start sm:w-auto">
                  <button
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => onPublicoChange(cenario.audience)}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400",
                      ativo
                        ? "border-hubee-800 bg-hubee-100 dark:border-hubee-400 dark:bg-hubee-400/10"
                        : "border-hubee-neutral-50 bg-white hover:border-hubee-400 dark:border-white/10 dark:bg-black/20 dark:hover:border-hubee-400/60",
                    )}
                  >
                    <span className="text-xs whitespace-nowrap text-hubee-neutral-300 dark:text-hubee-neutral-200">
                      {formatarNumero(cenario.audience)}
                      {cenario.audience === publicoEsperado ? " · esperado" : " pessoas"}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        positivo ? "text-[#247b50] dark:text-[#4fc98a]" : "text-[#c4242a] dark:text-[#f07186]",
                      )}
                    >
                      {positivo ? "+" : "−"}
                      {formatarMoeda(Math.abs(resultado))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

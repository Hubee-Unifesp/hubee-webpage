"use client";

import { forwardRef } from "react";
import { Check, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DespesaPlanejamento, GrupoDespesa, TotaisDespesas } from "@/types/planejamento";
import { botaoPrimarioClassName, botaoTextoClassName, painelClassName, textoSecundarioClassName } from "./estilos";
import {
  agruparPorCategoria,
  contarPendencias,
  filtrarDespesas,
  formatarMoeda,
  formatarNumero,
  GRUPOS_DESPESA,
  type FiltroDespesas,
} from "./planejamento.data";

export type AbaDespesas = GrupoDespesa | "todos";

interface DespesasListaProps {
  className?: string;
  despesas: readonly DespesaPlanejamento[];
  totais: TotaisDespesas;
  aba: AbaDespesas;
  filtro: FiltroDespesas;
  busca: string;
  onAbaChange: (aba: AbaDespesas) => void;
  onFiltroChange: (filtro: FiltroDespesas) => void;
  onBuscaChange: (busca: string) => void;
  onAdicionar: (grupo: GrupoDespesa, categoria?: string) => void;
  onEditar: (despesa: DespesaPlanejamento) => void;
  onExcluir: (despesa: DespesaPlanejamento) => void;
  onAlternarCotado: (id: string, quoted: boolean) => void;
  onAlternarPago: (id: string, pago: boolean) => void;
}

const colunas =
  "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)_6.5rem_6.5rem_2.25rem] md:gap-x-4";

const pillBase =
  "inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400";

function Toggle({
  ativo,
  rotuloAtivo,
  rotuloInativo,
  descricao,
  tomInativo,
  onClick,
}: {
  ativo: boolean;
  rotuloAtivo: string;
  rotuloInativo: string;
  descricao: string;
  tomInativo: "neutro" | "pendente";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={descricao}
      onClick={onClick}
      className={cn(
        pillBase,
        ativo
          ? "bg-[#dcfae5] text-[#04250e] hover:bg-[#c5f2d3] dark:bg-[#4fc98a]/12 dark:text-[#7fdcab]"
          : tomInativo === "pendente"
            ? "bg-hubee-100 text-hubee-750 hover:bg-hubee-200 dark:bg-hubee-400/12 dark:text-hubee-300"
            : "border border-dashed border-hubee-neutral-200 text-hubee-neutral-300 hover:border-hubee-600 hover:text-hubee-800 dark:border-white/20 dark:text-hubee-neutral-200 dark:hover:border-hubee-400 dark:hover:text-hubee-50",
      )}
    >
      {ativo && <Check aria-hidden="true" className="size-3.5" />}
      {ativo ? rotuloAtivo : rotuloInativo}
    </button>
  );
}

export const DespesasLista = forwardRef<HTMLElement, DespesasListaProps>(function DespesasLista(
  {
    className,
    despesas,
    totais,
    aba,
    filtro,
    busca,
    onAbaChange,
    onFiltroChange,
    onBuscaChange,
    onAdicionar,
    onEditar,
    onExcluir,
    onAlternarCotado,
    onAlternarPago,
  },
  ref,
) {
  const visiveis = filtrarDespesas(despesas, aba, filtro, busca);
  const daAba = aba === "todos" ? despesas : despesas.filter((despesa) => despesa.group === aba);
  const pendencias = contarPendencias(daAba);
  const grupos = GRUPOS_DESPESA.filter(({ id }) => aba === "todos" || aba === id);
  const abas: { id: AbaDespesas; rotulo: string; total: number }[] = [
    { id: "todos", rotulo: "Todas", total: totais.total },
    ...GRUPOS_DESPESA.map(({ id, curto }) => ({ id, rotulo: curto, total: totais.porGrupo[id] })),
  ];
  const filtros: { id: FiltroDespesas; rotulo: string; quantidade?: number }[] = [
    { id: "todas", rotulo: "Todos os itens" },
    { id: "a-pagar", rotulo: "A pagar", quantidade: pendencias.aPagar },
    { id: "sem-cotacao", rotulo: "Sem cotação", quantidade: pendencias.semCotacao },
  ];
  const grupoParaAdicionar: GrupoDespesa = aba === "todos" ? "fixed" : aba;

  return (
    <section ref={ref} aria-labelledby="despesas-titulo" className={cn(painelClassName, "scroll-mt-6 flex min-w-0 flex-col gap-4 px-0 md:px-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-6">
        <div>
          <h2 id="despesas-titulo" className="text-lg font-semibold">
            Despesas
          </h2>
          <p className={cn("text-sm", textoSecundarioClassName)}>
            {totais.itens} itens no orçamento · {totais.cotados} cotados
          </p>
        </div>
        <button type="button" onClick={() => onAdicionar(grupoParaAdicionar)} className={botaoPrimarioClassName}>
          <Plus aria-hidden="true" className="size-4" />
          Adicionar despesa
        </button>
      </div>

      <div role="tablist" aria-label="Grupo de despesas" className="flex gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] border-b border-hubee-neutral-50 px-5 md:px-6 dark:border-white/10">
        {abas.map(({ id, rotulo, total }) => {
          const selecionada = aba === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selecionada}
              onClick={() => onAbaChange(id)}
              className={cn(
                "-mb-px flex shrink-0 cursor-pointer items-baseline gap-1.5 border-b-2 pt-1 pb-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-hubee-800",
                selecionada
                  ? "border-hubee-800 font-semibold dark:border-hubee-400"
                  : "border-transparent text-hubee-neutral-300 hover:text-hubee-800 dark:text-hubee-neutral-200 dark:hover:text-hubee-50",
              )}
            >
              {rotulo}
              <span className="text-xs font-normal tabular-nums text-hubee-neutral-300 dark:text-hubee-neutral-200">{formatarMoeda(total)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div role="group" aria-label="Filtrar itens" className="flex flex-wrap gap-1.5">
          {filtros.map(({ id, rotulo, quantidade }) => {
            const ativo = filtro === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={ativo}
                onClick={() => onFiltroChange(id)}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-hubee-800",
                  ativo
                    ? "bg-hubee-800 font-semibold text-hubee-50 dark:bg-hubee-50 dark:text-hubee-900"
                    : "bg-hubee-50 text-hubee-800 hover:bg-hubee-100 dark:bg-white/6 dark:text-hubee-50 dark:hover:bg-white/10",
                )}
              >
                {rotulo}
                {quantidade !== undefined && <span className={cn("tabular-nums", !ativo && "text-hubee-neutral-300 dark:text-hubee-neutral-200")}>{quantidade}</span>}
              </button>
            );
          })}
        </div>
        <label className="relative sm:w-64">
          <span className="sr-only">Buscar item, fornecedor ou responsável</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hubee-neutral-300" />
          <input
            type="search"
            value={busca}
            onChange={(event) => onBuscaChange(event.target.value)}
            placeholder="Buscar item ou fornecedor"
            className="h-9 w-full rounded-md border border-hubee-neutral-50 bg-white pr-3 pl-9 text-sm text-hubee-800 outline-none placeholder:text-hubee-neutral-300 focus-visible:border-hubee-600 focus-visible:ring-3 focus-visible:ring-hubee-500/30 dark:border-white/15 dark:bg-black/20 dark:text-hubee-50"
          />
        </label>
      </div>

      <div className={cn("hidden px-6 text-xs text-hubee-neutral-300 md:grid dark:text-hubee-neutral-200", colunas)}>
        <span>Item</span>
        <span>Responsável</span>
        <span className="text-right">Quantidade</span>
        <span className="text-right">Valor</span>
        <span className="text-center">Cotação</span>
        <span className="text-center">Pagamento</span>
        <span className="sr-only">Ações</span>
      </div>

      {visiveis.length === 0 ? (
        <div className="mx-5 flex flex-col items-center gap-2 rounded-lg border border-dashed border-hubee-neutral-200 px-4 py-8 text-center md:mx-6 dark:border-white/20">
          <p className="text-sm">
            {filtro === "a-pagar" ? "Tudo pago por aqui." : filtro === "sem-cotacao" ? "Todos os itens já foram cotados." : "Nenhuma despesa encontrada."}
          </p>
          <button
            type="button"
            onClick={() => {
              onFiltroChange("todas");
              onBuscaChange("");
            }}
            className={botaoTextoClassName}
          >
            Ver todos os itens
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grupos.map(({ id: grupo, label }) => {
            const categorias = agruparPorCategoria(visiveis, grupo);
            if (categorias.length === 0) return null;
            return (
              <div key={grupo} className="flex flex-col gap-4">
                {aba === "todos" && (
                  <h3 className="px-5 text-xs font-semibold text-hubee-neutral-300 md:px-6 dark:text-hubee-neutral-200">{label}</h3>
                )}
                {categorias.map(({ category, despesas: itens, subtotal }) => (
                  <div key={category} role="group" aria-label={category}>
                    <div className="flex items-center justify-between gap-3 bg-hubee-50 px-5 py-2 md:px-6 dark:bg-white/[0.03]">
                      <span className="text-sm">
                        <span className="font-semibold">{category}</span>
                        <span className={cn("ml-2 text-xs", textoSecundarioClassName)}>
                          {itens.length} {itens.length === 1 ? "item" : "itens"}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{formatarMoeda(subtotal)}</span>
                        <button
                          type="button"
                          onClick={() => onAdicionar(grupo, category)}
                          aria-label={`Adicionar item em ${category}`}
                          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-hubee-750 outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:text-hubee-neutral-200 dark:hover:bg-white/10"
                        >
                          <Plus aria-hidden="true" className="size-4" />
                        </button>
                      </span>
                    </div>
                    <ul>
                      {itens.map((despesa) => {
                        const foraDoOrcamento = despesa.quantity === 0;
                        const pago = despesa.paymentStatus === "pago";
                        const detalhe = [
                          despesa.supplierName ?? "Sem fornecedor",
                          foraDoOrcamento ? `fora do orçamento · cotação de ${formatarMoeda(despesa.unitPrice)}` : null,
                          despesa.notes,
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        return (
                          <li
                            key={despesa.id}
                            className={cn(
                              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-hubee-neutral-50/70 px-5 py-3 transition-colors last:border-b-0 hover:bg-hubee-50/60 md:px-6 dark:border-white/5 dark:hover:bg-white/5",
                              colunas,
                            )}
                          >
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onEditar(despesa)}
                                className={cn(
                                  "max-w-full cursor-pointer truncate rounded-sm text-left text-sm font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-800",
                                  foraDoOrcamento && "text-hubee-neutral-300 dark:text-hubee-neutral-200",
                                )}
                              >
                                {despesa.description}
                              </button>
                              <p className={cn("truncate text-xs", textoSecundarioClassName)}>
                                {detalhe}
                                <span className="md:hidden">{despesa.responsible ? ` · ${despesa.responsible}` : ""}</span>
                              </p>
                            </div>
                            <span className={cn("hidden truncate text-sm md:block", !despesa.responsible && textoSecundarioClassName)}>
                              {despesa.responsible ?? "—"}
                            </span>
                            <span className={cn("hidden text-right text-sm tabular-nums md:block", textoSecundarioClassName)}>
                              {formatarNumero(despesa.quantity)} × {formatarMoeda(despesa.unitPrice)}
                            </span>
                            <span
                              className={cn(
                                "text-right text-sm font-semibold tabular-nums",
                                foraDoOrcamento && "font-normal text-hubee-neutral-300 dark:text-hubee-neutral-200",
                              )}
                            >
                              {formatarMoeda(despesa.amount)}
                              <span className={cn("block text-xs font-normal md:hidden", textoSecundarioClassName)}>
                                {formatarNumero(despesa.quantity)} × {formatarMoeda(despesa.unitPrice)}
                              </span>
                            </span>
                            <span className="col-span-2 flex items-center gap-2 md:contents">
                              <span className="md:flex md:justify-center">
                                <Toggle
                                  ativo={despesa.quoted}
                                  rotuloAtivo="Cotado"
                                  rotuloInativo="Cotar"
                                  tomInativo="neutro"
                                  descricao={`${despesa.description}: ${despesa.quoted ? "cotado" : "marcar como cotado"}`}
                                  onClick={() => onAlternarCotado(despesa.id, !despesa.quoted)}
                                />
                              </span>
                              <span className="md:flex md:justify-center">
                                {foraDoOrcamento ? (
                                  <span className={cn("text-sm", textoSecundarioClassName)}>—</span>
                                ) : (
                                  <Toggle
                                    ativo={pago}
                                    rotuloAtivo="Pago"
                                    rotuloInativo="A pagar"
                                    tomInativo="pendente"
                                    descricao={`${despesa.description}: ${pago ? "pago" : "marcar como pago"}`}
                                    onClick={() => onAlternarPago(despesa.id, !pago)}
                                  />
                                )}
                              </span>
                              <span className="ml-auto md:ml-0 md:flex md:justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Mais ações para ${despesa.description}`}
                                      className="cursor-pointer text-hubee-neutral-300 hover:text-hubee-800 dark:text-hubee-neutral-200"
                                    >
                                      <MoreHorizontal aria-hidden="true" className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-40">
                                    <DropdownMenuItem onSelect={() => onEditar(despesa)}>
                                      <Pencil aria-hidden="true" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onSelect={() => onExcluir(despesa)}>
                                      <Trash2 aria-hidden="true" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

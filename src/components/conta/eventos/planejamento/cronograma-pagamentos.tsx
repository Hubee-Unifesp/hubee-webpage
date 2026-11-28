"use client";

import { useState } from "react";
import { AlertTriangle, Check, MoreHorizontal, Pencil, Plus, RotateCw, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCronogramaPagamentos } from "@/hooks/useCronogramaPagamentos";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { DespesaPlanejamento, ParcelaDespesa, ParcelaPayload } from "@/types/planejamento";
import { agruparPorSemana, estaAtrasada, rotuloSemana, totaisDoCronograma } from "./cronograma.data";
import { botaoPrimarioClassName, painelClassName, textoSecundarioClassName } from "./estilos";
import { ParcelaFormModal } from "./parcela-form-modal";
import { formatarMoeda } from "./planejamento.data";

interface CronogramaPagamentosProps {
  eventoId: string;
  dataEvento: string;
  despesas: readonly DespesaPlanejamento[];
}

const formatarDia = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

function Situacao({ parcela, atrasada }: { parcela: ParcelaDespesa; atrasada: boolean }) {
  const base = "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold whitespace-nowrap";
  if (parcela.status === "pago") {
    return (
      <span className={cn(base, "bg-[#dcfae5] text-[#04250e] dark:bg-[#4fc98a]/12 dark:text-[#7fdcab]")}>
        <Check aria-hidden="true" className="size-3.5" />
        Pago
      </span>
    );
  }
  if (parcela.status === "cancelado") {
    return <span className={cn(base, "bg-hubee-neutral-50 text-hubee-neutral-300 dark:bg-white/8 dark:text-hubee-neutral-200")}>Cancelada</span>;
  }
  if (atrasada) {
    return (
      <span className={cn(base, "bg-[#ffe4e0] text-[#a01b20] dark:bg-[#f07186]/15 dark:text-[#f07186]")}>
        <AlertTriangle aria-hidden="true" className="size-3.5" />
        Atrasada
      </span>
    );
  }
  return <span className={cn(base, "bg-hubee-100 text-hubee-750 dark:bg-hubee-400/12 dark:text-hubee-300")}>A pagar</span>;
}

function Resumo({ rotulo, valor, tom }: { rotulo: string; valor: string; tom?: "negativo" }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className={cn("text-xs font-medium", textoSecundarioClassName)}>{rotulo}</dt>
      <dd className={cn("text-base font-semibold tabular-nums", tom === "negativo" && "text-[#c4242a] dark:text-[#f07186]")}>{valor}</dd>
    </div>
  );
}

export function CronogramaPagamentos({ eventoId, dataEvento, despesas }: CronogramaPagamentosProps) {
  const toast = useToast();
  const cronograma = useCronogramaPagamentos(eventoId);
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<ParcelaDespesa | null>(null);
  const [emExclusao, setEmExclusao] = useState<ParcelaDespesa | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const hoje = new Date();

  if (cronograma.status === "carregando") {
    return (
      <section aria-busy="true" className={cn(painelClassName, "flex flex-col gap-3")}>
        <span className="sr-only" role="status">
          Carregando o cronograma de pagamentos.
        </span>
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} aria-hidden="true" className="block h-10 animate-pulse rounded-md bg-hubee-neutral-50 dark:bg-white/10" />
        ))}
      </section>
    );
  }

  if (cronograma.status === "erro") {
    return (
      <section role="alert" className={cn(painelClassName, "flex flex-col items-start gap-3")}>
        <p className="text-sm">Não foi possível carregar o cronograma de pagamentos.</p>
        <button type="button" onClick={cronograma.tentarDeNovo} className={botaoPrimarioClassName}>
          <RotateCw aria-hidden="true" className="size-4" />
          Tentar de novo
        </button>
      </section>
    );
  }

  const parcelas = cronograma.parcelas;
  const semanas = agruparPorSemana(parcelas, dataEvento, hoje);
  const totais = totaisDoCronograma(parcelas, hoje);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function salvar(despesaId: string, payload: ParcelaPayload) {
    if (emEdicao) {
      await cronograma.editarParcela(emEdicao, payload);
      toast.success("Parcela atualizada.");
    } else {
      await cronograma.criarParcela(despesaId, payload);
      toast.success("Parcela adicionada ao cronograma.");
    }
    setFormAberto(false);
  }

  async function alternarPago(parcela: ParcelaDespesa) {
    try {
      await cronograma.editarParcela(parcela, { status: parcela.status === "pago" ? "pendente" : "pago" });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar a parcela."));
    }
  }

  async function excluir() {
    if (!emExclusao) return;
    setExcluindo(true);
    try {
      await cronograma.excluirParcela(emExclusao);
      toast.success("Parcela excluída.");
      setEmExclusao(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir a parcela."));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section aria-labelledby="cronograma-titulo" className={cn(painelClassName, "flex min-w-0 flex-col gap-5 px-0 md:px-0")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-6">
        <div>
          <h2 id="cronograma-titulo" className="text-lg font-semibold">
            Cronograma de pagamentos
          </h2>
          <p className={cn("text-sm", textoSecundarioClassName)}>
            {parcelas.length === 1 ? "1 parcela" : `${parcelas.length} parcelas`} até o evento
          </p>
        </div>
        <button type="button" onClick={abrirCriacao} className={botaoPrimarioClassName}>
          <Plus aria-hidden="true" className="size-4" />
          Adicionar parcela
        </button>
      </div>

      {parcelas.length > 0 && (
        <dl className="mx-5 grid grid-cols-2 gap-4 border-y border-hubee-neutral-50 py-3 sm:grid-cols-4 md:mx-6 dark:border-white/10">
          <Resumo rotulo="Total parcelado" valor={formatarMoeda(totais.total)} />
          <Resumo rotulo="Pago" valor={formatarMoeda(totais.pago)} />
          <Resumo rotulo="A pagar" valor={formatarMoeda(totais.aPagar)} />
          <Resumo
            rotulo={totais.quantidadeAtrasadas === 1 ? "1 parcela atrasada" : `${totais.quantidadeAtrasadas} parcelas atrasadas`}
            valor={formatarMoeda(totais.atrasado)}
            tom={totais.quantidadeAtrasadas > 0 ? "negativo" : undefined}
          />
        </dl>
      )}

      {parcelas.length === 0 ? (
        <div className="flex flex-col items-start gap-2 px-5 md:px-6">
          <p className="text-sm">Nenhuma parcela cadastrada ainda.</p>
          <p className={cn("text-sm", textoSecundarioClassName)}>
            Divida as despesas em parcelas, como um sinal de 40% e o restante perto do evento, para acompanhar os pagamentos por semana.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-5">
          {semanas.map((semana) => (
            <li key={semana.inicio.toISOString()} className="flex flex-col">
              <div className="flex flex-wrap items-baseline justify-between gap-2 bg-hubee-neutral-50/50 px-5 py-2 md:px-6 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold first-letter:uppercase">{rotuloSemana(semana)}</h3>
                <p className="text-sm tabular-nums">
                  <span className="font-semibold">{formatarMoeda(semana.total)}</span>
                  <span className={textoSecundarioClassName}>
                    {" "}
                    · {formatarMoeda(semana.pago)} pagos
                    {semana.atrasadas > 0 && (
                      <span className="text-[#c4242a] dark:text-[#f07186]">
                        {" "}
                        · {semana.atrasadas === 1 ? "1 atrasada" : `${semana.atrasadas} atrasadas`}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              <ul className="divide-y divide-hubee-neutral-50 dark:divide-white/10">
                {semana.parcelas.map((parcela) => {
                  const atrasada = estaAtrasada(parcela, hoje);
                  const detalhes = [parcela.supplierName, parcela.paymentMethod, parcela.paidBy ? `pago por ${parcela.paidBy}` : null]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li
                      key={parcela.id}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3 md:grid-cols-[6.5rem_minmax(0,1fr)_8rem_6.5rem_2.25rem] md:px-6",
                        atrasada && "border-l-4 border-l-[#c4242a] bg-[#fff5f3] pl-4 md:pl-5 dark:border-l-[#f07186] dark:bg-[#f07186]/5",
                        parcela.status === "cancelado" && "opacity-60",
                      )}
                    >
                      <span className={cn("col-span-2 text-xs font-medium md:col-span-1 md:text-sm", atrasada ? "text-[#c4242a] dark:text-[#f07186]" : textoSecundarioClassName)}>
                        {formatarDia.format(new Date(parcela.dueDate))}
                      </span>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEmEdicao(parcela);
                            setFormAberto(true);
                          }}
                          className="max-w-full cursor-pointer truncate rounded-sm text-left text-sm font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-800"
                        >
                          {parcela.expenseDescription}
                        </button>
                        <p className={cn("truncate text-xs", textoSecundarioClassName)}>{detalhes || parcela.expenseCategory}</p>
                      </div>
                      <span
                        className={cn(
                          "text-right text-sm font-semibold tabular-nums",
                          parcela.status === "cancelado" && "line-through",
                        )}
                      >
                        {formatarMoeda(parcela.amount)}
                      </span>
                      <span className="col-span-2 flex items-center gap-2 md:contents">
                        <span className="md:flex md:justify-center">
                          {parcela.status === "cancelado" ? (
                            <Situacao parcela={parcela} atrasada={false} />
                          ) : (
                            <button
                              type="button"
                              aria-pressed={parcela.status === "pago"}
                              aria-label={`${parcela.expenseDescription}, parcela de ${formatarMoeda(parcela.amount)}: ${parcela.status === "pago" ? "paga" : "marcar como paga"}`}
                              onClick={() => void alternarPago(parcela)}
                              className="cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-hubee-800"
                            >
                              <Situacao parcela={parcela} atrasada={atrasada} />
                            </button>
                          )}
                        </span>
                        <span className="ml-auto md:ml-0 md:flex md:justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Mais ações para a parcela de ${parcela.expenseDescription}`}
                                className="cursor-pointer text-hubee-neutral-300 hover:text-hubee-800 dark:text-hubee-neutral-200"
                              >
                                <MoreHorizontal aria-hidden="true" className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-40">
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEmEdicao(parcela);
                                  setFormAberto(true);
                                }}
                              >
                                <Pencil aria-hidden="true" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onSelect={() => setEmExclusao(parcela)}>
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
            </li>
          ))}
        </ol>
      )}

      <ParcelaFormModal
        open={formAberto}
        onOpenChange={setFormAberto}
        parcela={emEdicao}
        despesas={despesas}
        parcelas={parcelas}
        onSubmit={salvar}
      />
      <Modal
        open={emExclusao !== null}
        onOpenChange={(open) => !open && setEmExclusao(null)}
        dismissible={!excluindo}
        tone="warning"
        title="Excluir parcela?"
        description={emExclusao ? `A parcela de ${formatarMoeda(emExclusao.amount)} de "${emExclusao.expenseDescription}" sai do cronograma.` : ""}
        footer={
          <>
            <Button
              type="button"
              disabled={excluindo}
              onClick={() => setEmExclusao(null)}
              className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={excluindo}
              aria-busy={excluindo}
              onClick={() => void excluir()}
              className="h-10 cursor-pointer rounded-lg bg-red-600 px-5 font-semibold text-white hover:bg-red-700 focus-visible:ring-red-700"
            >
              Excluir parcela
            </Button>
          </>
        }
      />
    </section>
  );
}

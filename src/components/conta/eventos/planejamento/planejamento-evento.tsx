"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, RotateCw } from "lucide-react";
import { formatEventDate } from "@/components/home/events/format";
import { useToast } from "@/components/toast";
import { usePlanejamentoEvento } from "@/hooks/usePlanejamentoEvento";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { DespesaPlanejamento, DespesaPlanejamentoPayload, GrupoDespesa } from "@/types/planejamento";
import { CronogramaPagamentos } from "./cronograma-pagamentos";
import { DespesaFormModal, type NovaDespesaContexto } from "./despesa-form-modal";
import { DespesasLista, type AbaDespesas } from "./despesas-lista";
import { DestinoDinheiro } from "./destino-dinheiro";
import { botaoPrimarioClassName, painelClassName, textoSecundarioClassName } from "./estilos";
import { ExcluirDespesaModal } from "./excluir-despesa-modal";
import { formatarNumero, type FiltroDespesas } from "./planejamento.data";
import { PontoEquilibrio } from "./ponto-equilibrio";

type VisaoPlanejamento = "orcamento" | "cronograma";

const VISOES: readonly { id: VisaoPlanejamento; rotulo: string }[] = [
  { id: "orcamento", rotulo: "Orçamento" },
  { id: "cronograma", rotulo: "Cronograma" },
];

interface PlanejamentoEventoProps {
  eventoId: string;
}

const linkClassName =
  "rounded-sm outline-none hover:text-hubee-800 hover:underline focus-visible:ring-3 focus-visible:ring-hubee-800 dark:hover:text-hubee-50";

function Bloco({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-hubee-neutral-50 dark:bg-white/10", className)} />;
}

function Breadcrumb({ eventoId, nome }: { eventoId: string; nome: string | null }) {
  return (
    <nav aria-label="Você está em" className="text-sm">
      <ol className={cn("flex flex-wrap items-center gap-1", textoSecundarioClassName)}>
        <li>
          <Link href="/meus-eventos" className={linkClassName}>
            Meus eventos
          </Link>
        </li>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <li>
          {nome ? (
            <Link href={`/meus-eventos/${eventoId}/editar`} className={linkClassName}>
              {nome}
            </Link>
          ) : (
            <Bloco className="h-4 w-24" />
          )}
        </li>
      </ol>
    </nav>
  );
}

function PlanejamentoCarregando({ eventoId }: { eventoId: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only" role="status">
        Carregando o planejamento do evento.
      </span>
      <header className="flex flex-col gap-2">
        <Breadcrumb eventoId={eventoId} nome={null} />
        <Bloco className="h-8 w-72 max-w-full" />
        <Bloco className="h-4 w-96 max-w-full" />
      </header>
      <section className={painelClassName}>
        <div className="flex items-center justify-between gap-4">
          <Bloco className="h-6 w-40" />
          <Bloco className="h-9 w-36" />
        </div>
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Bloco key={index} className="h-9 w-28" />
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Bloco key={index} className="h-10 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanejamentoAviso({
  eventoId,
  titulo,
  texto,
  onTentarDeNovo,
}: {
  eventoId: string;
  titulo: string;
  texto: string;
  onTentarDeNovo?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb eventoId={eventoId} nome={null} />
      <section role="alert" className={cn(painelClassName, "flex flex-col items-start gap-3")}>
        <h1 className="font-heading text-lg font-bold">{titulo}</h1>
        <p className={cn("text-sm", textoSecundarioClassName)}>{texto}</p>
        {onTentarDeNovo ? (
          <button type="button" onClick={onTentarDeNovo} className={botaoPrimarioClassName}>
            <RotateCw aria-hidden="true" className="size-4" />
            Tentar de novo
          </button>
        ) : (
          <Link href="/meus-eventos" className={botaoPrimarioClassName}>
            Voltar para Meus eventos
          </Link>
        )}
      </section>
    </div>
  );
}

export function PlanejamentoEvento({ eventoId }: PlanejamentoEventoProps) {
  const toast = useToast();
  const planejamento = usePlanejamentoEvento(eventoId);
  const { dados, totais } = planejamento;
  const listaRef = useRef<HTMLElement>(null);
  const [aba, setAba] = useState<AbaDespesas>("todos");
  const [filtro, setFiltro] = useState<FiltroDespesas>("todas");
  const [busca, setBusca] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<DespesaPlanejamento | null>(null);
  const [contexto, setContexto] = useState<NovaDespesaContexto>({ grupo: "fixed" });
  const [emExclusao, setEmExclusao] = useState<DespesaPlanejamento | null>(null);
  const [visao, setVisao] = useState<VisaoPlanejamento>("orcamento");

  const despesas = useMemo(() => dados?.despesas ?? [], [dados]);
  const categoriasExistentes = useMemo(() => [...new Set(despesas.map((despesa) => despesa.category))], [despesas]);

  if (planejamento.status === "carregando") return <PlanejamentoCarregando eventoId={eventoId} />;
  if (planejamento.status === "sem-acesso") {
    return (
      <PlanejamentoAviso
        eventoId={eventoId}
        titulo="Você não tem acesso a este planejamento"
        texto="Só quem pode editar os eventos da organização vê e altera o orçamento."
      />
    );
  }
  if (planejamento.status === "erro" || !dados) {
    return (
      <PlanejamentoAviso
        eventoId={eventoId}
        titulo="Não foi possível carregar o planejamento"
        texto="Verifique sua conexão e tente de novo."
        onTentarDeNovo={planejamento.tentarDeNovo}
      />
    );
  }

  const { evento } = dados;

  function abrirCriacao(grupo: GrupoDespesa, categoria?: string) {
    setEmEdicao(null);
    setContexto({ grupo, categoria });
    setFormAberto(true);
  }

  function abrirEdicao(despesa: DespesaPlanejamento) {
    setEmEdicao(despesa);
    setFormAberto(true);
  }

  async function salvar(payload: DespesaPlanejamentoPayload) {
    if (emEdicao) {
      await planejamento.editarDespesa(emEdicao.id, payload);
      toast.success(`"${payload.description}" atualizado.`);
    } else {
      await planejamento.criarDespesa(payload);
      toast.success(`"${payload.description}" entrou no orçamento.`);
    }
    setFormAberto(false);
  }

  function filtrarPendencias(novo: FiltroDespesas) {
    setAba("todos");
    setBusca("");
    setFiltro(novo);
    listaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function definirEsperado(publico: number) {
    try {
      await planejamento.definirPublicoEsperado(publico);
      toast.success(`Público esperado agora é ${formatarNumero(publico)} pessoas.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar o público esperado."));
    }
  }

  async function excluir(despesa: DespesaPlanejamento) {
    try {
      await planejamento.excluirDespesa(despesa.id);
      toast.success(`"${despesa.description}" saiu do orçamento.`);
      setEmExclusao(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Não foi possível excluir "${despesa.description}".`));
    }
  }

  async function alterarNaLinha(
    id: string,
    mudanca: Pick<DespesaPlanejamentoPayload, "quoted"> | Pick<DespesaPlanejamentoPayload, "paymentStatus">,
  ) {
    const despesa = despesas.find((item) => item.id === id);
    if (!despesa) return;
    try {
      await planejamento.alterarNaLinha(despesa, mudanca);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Não foi possível salvar "${despesa.description}".`));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Breadcrumb eventoId={eventoId} nome={evento.name} />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Planejamento de {evento.name}</h1>
        <p className={cn("text-sm", textoSecundarioClassName)}>
          {formatEventDate(evento.startDate, evento.endDate)} · {evento.venueName} · público esperado de{" "}
          {evento.expectedAudience ? `${formatarNumero(evento.expectedAudience)} pessoas` : "—"}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div role="tablist" aria-label="Visões do planejamento" className="flex gap-1 self-start rounded-lg bg-hubee-neutral-50/60 p-1 dark:bg-white/[0.05]">
          {VISOES.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`visao-${id}`}
              aria-selected={visao === id}
              aria-controls={`painel-${id}`}
              onClick={() => setVisao(id)}
              className={cn(
                "h-8 cursor-pointer rounded-md px-3 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-hubee-800",
                visao === id
                  ? "bg-white text-hubee-800 shadow-sm dark:bg-hubee-400 dark:text-hubee-800"
                  : "text-hubee-neutral-300 hover:text-hubee-800 dark:text-hubee-neutral-200 dark:hover:text-hubee-50",
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`painel-${visao}`} aria-labelledby={`visao-${visao}`} className="grid min-w-0 gap-4 lg:grid-cols-3">
          {visao === "orcamento" ? (
            <>
              <div className="min-w-0 lg:col-span-2">
                <PontoEquilibrio
                  eventoId={eventoId}
                  lotes={dados.lotes}
                  segmentos={planejamento.segmentos}
                  simulacao={planejamento.simulacao}
                  despesaTotal={totais.total}
                  publicoEsperado={evento.expectedAudience}
                  onPublicoChange={planejamento.setPublicoSimulado}
                  onDefinirEsperado={definirEsperado}
                />
              </div>
              <DestinoDinheiro despesas={despesas} totais={totais} onFiltrar={filtrarPendencias} />
              <DespesasLista
                ref={listaRef}
                className="lg:col-span-3"
                despesas={despesas}
                totais={totais}
                aba={aba}
                filtro={filtro}
                busca={busca}
                onAbaChange={setAba}
                onFiltroChange={setFiltro}
                onBuscaChange={setBusca}
                onAdicionar={abrirCriacao}
                onEditar={abrirEdicao}
                onExcluir={setEmExclusao}
                onAlternarCotado={(id, quoted) => alterarNaLinha(id, { quoted })}
                onAlternarPago={(id, pago) => alterarNaLinha(id, { paymentStatus: pago ? "pago" : "pendente" })}
              />
            </>
          ) : (
            <div className="min-w-0 lg:col-span-3">
              <CronogramaPagamentos eventoId={eventoId} dataEvento={evento.startDate} despesas={despesas} />
            </div>
          )}
        </div>
      </div>

      <DespesaFormModal
        open={formAberto}
        onOpenChange={setFormAberto}
        despesa={emEdicao}
        contexto={contexto}
        fornecedores={dados.fornecedores}
        categoriasExistentes={categoriasExistentes}
        onSubmit={salvar}
      />
      <ExcluirDespesaModal despesa={emExclusao} onClose={() => setEmExclusao(null)} onConfirm={excluir} />
    </div>
  );
}

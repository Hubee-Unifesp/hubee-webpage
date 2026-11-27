import type {
  DespesaPlanejamento,
  GrupoDespesa,
  IndicadoresPublico,
  LotePlanejamento,
  ResumoPlanejamento,
  TotaisDespesas,
} from "@/types/planejamento";

export const GRUPOS_DESPESA: readonly { id: GrupoDespesa; label: string; curto: string; descricao: string }[] = [
  { id: "fixed", label: "Despesas fixas", curto: "Fixas", descricao: "Não mudam com o público: local, estrutura, staff e atrações." },
  { id: "variable", label: "Despesas variáveis", curto: "Variáveis", descricao: "Acompanham o público: bar, open e consumo." },
  { id: "marketing", label: "Divulgação", curto: "Divulgação", descricao: "Tráfego pago, impressos e ações de marketing." },
];

export const CATEGORIAS_SUGERIDAS: Record<GrupoDespesa, readonly string[]> = {
  fixed: ["Estrutura", "Staff", "Atrações"],
  variable: ["Bar", "Open", "Boom"],
  marketing: ["MKT"],
};

export const PASSO_CENARIO_PADRAO = 20;
export const QUANTIDADE_CENARIOS = 5;

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularValorFinal(quantity: number, unitPrice: number): number {
  return arredondar(quantity * unitPrice);
}

export function totalizarDespesas(despesas: readonly DespesaPlanejamento[]): TotaisDespesas {
  const porGrupo: Record<GrupoDespesa, number> = { fixed: 0, variable: 0, marketing: 0 };
  let pago = 0;
  let cotados = 0;
  const ativas = despesas.filter((despesa) => despesa.paymentStatus !== "cancelado");

  for (const despesa of ativas) {
    porGrupo[despesa.group] += despesa.amount;
    if (despesa.paymentStatus === "pago") pago += despesa.amount;
    if (despesa.quoted) cotados += 1;
  }

  const total = porGrupo.fixed + porGrupo.variable + porGrupo.marketing;
  return {
    total: arredondar(total),
    porGrupo: {
      fixed: arredondar(porGrupo.fixed),
      variable: arredondar(porGrupo.variable),
      marketing: arredondar(porGrupo.marketing),
    },
    pago: arredondar(pago),
    pendente: arredondar(total - pago),
    cotados,
    itens: ativas.length,
  };
}

export interface CategoriaDespesas {
  category: string;
  despesas: DespesaPlanejamento[];
  subtotal: number;
}

export function agruparPorCategoria(despesas: readonly DespesaPlanejamento[], grupo: GrupoDespesa): CategoriaDespesas[] {
  const categorias = new Map<string, DespesaPlanejamento[]>();
  for (const despesa of despesas) {
    if (despesa.group !== grupo) continue;
    const lista = categorias.get(despesa.category) ?? [];
    lista.push(despesa);
    categorias.set(despesa.category, lista);
  }
  return [...categorias.entries()].map(([category, itens]) => ({
    category,
    despesas: itens,
    subtotal: arredondar(
      itens.filter((item) => item.paymentStatus !== "cancelado").reduce((soma, item) => soma + item.amount, 0),
    ),
  }));
}

function ordemDoLote(lote: LotePlanejamento): number {
  return lote.salesStartDate ? new Date(lote.salesStartDate).getTime() : Number.NEGATIVE_INFINITY;
}

export function distribuirPublico(lotes: readonly LotePlanejamento[], publico: number): number[] {
  const quantidades = lotes.map((lote) => lote.quantity);
  if (lotes.length === 0) return quantidades;

  const ordem = lotes
    .map((lote, index) => ({ lote, index }))
    .sort((a, b) => ordemDoLote(a.lote) - ordemDoLote(b.lote) || a.lote.price - b.lote.price)
    .map(({ index }) => index);

  const planejado = quantidades.reduce((soma, quantidade) => soma + quantidade, 0);
  let diferenca = publico - planejado;
  const ultimo = ordem[ordem.length - 1];

  if (diferenca > 0) {
    quantidades[ultimo] += diferenca;
    return quantidades;
  }

  for (let posicao = ordem.length - 1; posicao >= 0 && diferenca < 0; posicao -= 1) {
    const index = ordem[posicao];
    const removido = Math.min(quantidades[index], -diferenca);
    quantidades[index] -= removido;
    diferenca += removido;
  }
  return quantidades;
}

export function calcularIndicadores(
  lotes: readonly LotePlanejamento[],
  despesaTotal: number,
  publico: number,
): IndicadoresPublico {
  const quantidades = distribuirPublico(lotes, publico);
  const ingressos = quantidades.reduce((soma, quantidade) => soma + quantidade, 0);
  const receita = lotes.reduce((soma, lote, index) => soma + lote.price * quantidades[index], 0);
  const ticketMedio = ingressos > 0 ? receita / ingressos : null;

  return {
    audience: publico,
    revenue: arredondar(receita),
    averageTicket: ticketMedio === null ? null : arredondar(ticketMedio),
    breakEven: ticketMedio ? arredondar(despesaTotal / ticketMedio) : null,
    costPerPerson: publico > 0 ? arredondar(despesaTotal / publico) : null,
    profit: arredondar(receita - despesaTotal),
  };
}

export function calcularResumo(
  despesas: readonly DespesaPlanejamento[],
  lotes: readonly LotePlanejamento[],
  publicoEsperado: number | null,
  passo: number = PASSO_CENARIO_PADRAO,
  quantidadeCenarios: number = QUANTIDADE_CENARIOS,
): ResumoPlanejamento {
  const totais = totalizarDespesas(despesas);
  const ingressosPlanejados = lotes.reduce((soma, lote) => soma + lote.quantity, 0);
  const temBase = lotes.length > 0 && publicoEsperado !== null && publicoEsperado > 0;

  if (!temBase) {
    return { despesas: totais, ingressosPlanejados, atual: null, cenarios: [] };
  }

  const cenarios = Array.from({ length: quantidadeCenarios }, (_, index) =>
    calcularIndicadores(lotes, totais.total, publicoEsperado + index * passo),
  );
  return { despesas: totais, ingressosPlanejados, atual: cenarios[0], cenarios };
}

export function publicoParaLucro(resumo: ResumoPlanejamento): number | null {
  const breakEven = resumo.atual?.breakEven;
  return breakEven === null || breakEven === undefined ? null : Math.ceil(breakEven);
}

const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatadorNumero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

export function formatarNumero(valor: number): string {
  return formatadorNumero.format(valor);
}

export interface TotalCategoria {
  category: string;
  group: GrupoDespesa;
  total: number;
}

export function totaisPorCategoria(despesas: readonly DespesaPlanejamento[]): TotalCategoria[] {
  const mapa = new Map<string, TotalCategoria>();
  for (const despesa of despesas) {
    if (despesa.paymentStatus === "cancelado") continue;
    const atual = mapa.get(despesa.category) ?? { category: despesa.category, group: despesa.group, total: 0 };
    atual.total = arredondar(atual.total + despesa.amount);
    mapa.set(despesa.category, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}

export interface SegmentoLote {
  lote: LotePlanejamento;
  inicio: number;
  fim: number;
}

export function segmentosDeLotes(lotes: readonly LotePlanejamento[], publico: number): SegmentoLote[] {
  const quantidades = distribuirPublico(lotes, publico);
  const ordem = lotes
    .map((lote, index) => ({ lote, quantidade: quantidades[index] }))
    .sort((a, b) => ordemDoLote(a.lote) - ordemDoLote(b.lote) || a.lote.price - b.lote.price)
    .filter(({ quantidade }) => quantidade > 0);

  let inicio = 0;
  return ordem.map(({ lote, quantidade }) => {
    const segmento = { lote, inicio, fim: inicio + quantidade };
    inicio += quantidade;
    return segmento;
  });
}

export function loteDoIngresso(segmentos: readonly SegmentoLote[], ingresso: number): LotePlanejamento | null {
  return segmentos.find((segmento) => ingresso > segmento.inicio && ingresso <= segmento.fim)?.lote ?? null;
}

export type FiltroDespesas = "todas" | "a-pagar" | "sem-cotacao";

export function filtrarDespesas(
  despesas: readonly DespesaPlanejamento[],
  grupo: GrupoDespesa | "todos",
  filtro: FiltroDespesas,
  busca: string,
): DespesaPlanejamento[] {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  return despesas.filter((despesa) => {
    if (grupo !== "todos" && despesa.group !== grupo) return false;
    if (filtro === "a-pagar" && (despesa.paymentStatus === "pago" || despesa.amount === 0)) return false;
    if (filtro === "sem-cotacao" && despesa.quoted) return false;
    if (!termo) return true;
    return [despesa.description, despesa.supplierName, despesa.category, despesa.responsible]
      .filter(Boolean)
      .some((texto) => texto!.toLocaleLowerCase("pt-BR").includes(termo));
  });
}

export function contarPendencias(despesas: readonly DespesaPlanejamento[]) {
  return {
    aPagar: despesas.filter((despesa) => despesa.paymentStatus !== "pago" && despesa.paymentStatus !== "cancelado" && despesa.amount > 0).length,
    semCotacao: despesas.filter((despesa) => !despesa.quoted && despesa.paymentStatus !== "cancelado").length,
  };
}

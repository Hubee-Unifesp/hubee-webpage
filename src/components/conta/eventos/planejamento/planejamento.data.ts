import type {
  DespesaPlanejamento,
  GrupoDespesa,
  IndicadoresPublico,
  LotePlanejamento,
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

function plannedQuantity(lote: LotePlanejamento): number {
  return Math.max(0, lote.quantity);
}

export function distribuirPublico(lotes: readonly LotePlanejamento[], publico: number): number[] {
  const quantidades = lotes.map(() => 0);
  let restante = Math.max(0, publico);
  const tirar = (index: number) => {
    const quantidade = Math.min(plannedQuantity(lotes[index]), restante);
    restante -= quantidade;
    quantidades[index] = quantidade;
  };

  lotes.forEach((lote, index) => {
    if (!lote.sequential) tirar(index);
  });
  let ultimoDaFila = -1;
  lotes.forEach((lote, index) => {
    if (!lote.sequential) return;
    tirar(index);
    ultimoDaFila = index;
  });
  if (restante > 0 && ultimoDaFila >= 0) quantidades[ultimoDaFila] += restante;
  return quantidades;
}

const emCentavos = (valor: number) => Math.round(valor * 100);

export function loteDoEmpate(lotes: readonly LotePlanejamento[], despesaTotal: number): LotePlanejamento | null {
  const despesaCentavos = emCentavos(despesaTotal);
  if (despesaCentavos <= 0) return null;

  const ordem = [...lotes.filter((lote) => !lote.sequential), ...lotes.filter((lote) => lote.sequential)];
  let receitaCentavos = 0;
  for (const lote of ordem) {
    receitaCentavos += emCentavos(lote.price) * plannedQuantity(lote);
    if (receitaCentavos >= despesaCentavos) return lote;
  }

  const ultimo = lotes.filter((lote) => lote.sequential).at(-1);
  return ultimo && ultimo.price > 0 ? ultimo : null;
}

export function calcularIndicadores(
  lotes: readonly LotePlanejamento[],
  despesaTotal: number,
  publico: number,
): IndicadoresPublico {
  const custoPorPessoa = publico > 0 ? arredondar(despesaTotal / publico) : null;
  if (lotes.length === 0 || publico <= 0) {
    return {
      audience: publico,
      revenue: null,
      averageTicket: null,
      breakEven: null,
      costPerPerson: custoPorPessoa,
      profit: null,
      breakEvenBatch: null,
    };
  }

  const quantidades = distribuirPublico(lotes, publico);
  const receitaCentavos = lotes.reduce((soma, lote, index) => soma + emCentavos(lote.price) * quantidades[index], 0);
  const ticketMedio = receitaCentavos / 100 / publico;
  const breakEven = ticketMedio > 0 ? despesaTotal / ticketMedio : null;

  return {
    audience: publico,
    revenue: receitaCentavos / 100,
    averageTicket: arredondar(ticketMedio),
    breakEven: breakEven === null ? null : arredondar(breakEven),
    costPerPerson: custoPorPessoa,
    profit: (receitaCentavos - emCentavos(despesaTotal)) / 100,
    breakEvenBatch: breakEven === null ? null : (loteDoEmpate(lotes, despesaTotal)?.batch ?? null),
  };
}

export function cenariosDePublico(
  lotes: readonly LotePlanejamento[],
  despesaTotal: number,
  base: number,
  passo: number = PASSO_CENARIO_PADRAO,
  quantidade: number = QUANTIDADE_CENARIOS,
): IndicadoresPublico[] {
  const meio = Math.floor(quantidade / 2);
  return Array.from({ length: quantidade }, (_, index) => base + (index - meio) * passo)
    .filter((publico) => publico > 0)
    .map((publico) => calcularIndicadores(lotes, despesaTotal, publico));
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
  let inicio = 0;
  return lotes.flatMap((lote, index) => {
    if (quantidades[index] <= 0) return [];
    const segmento = { lote, inicio, fim: inicio + quantidades[index] };
    inicio = segmento.fim;
    return [segmento];
  });
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

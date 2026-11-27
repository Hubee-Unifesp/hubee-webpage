export type GrupoDespesa = "fixed" | "variable" | "marketing";

export type StatusPagamentoDespesa = "pendente" | "pago" | "atrasado" | "cancelado";

export interface DespesaPlanejamento {
  id: string;
  group: GrupoDespesa;
  category: string;
  description: string;
  supplierId: string | null;
  supplierName: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  responsible: string | null;
  quoted: boolean;
  paymentStatus: StatusPagamentoDespesa;
  notes: string | null;
  dueDate: string | null;
}

export interface DespesaPlanejamentoPayload {
  group: GrupoDespesa;
  category: string;
  description: string;
  supplierId: string | null;
  quantity: number;
  unitPrice: number;
  responsible: string | null;
  quoted: boolean;
  paymentStatus: StatusPagamentoDespesa;
  notes: string | null;
}

export interface LotePlanejamento {
  id: string;
  batch: string;
  price: number;
  quantity: number;
  salesStartDate: string | null;
}

export interface EventoPlanejamento {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venueName: string;
  expectedAudience: number | null;
}

export interface FornecedorPlanejamento {
  id: string;
  companyName: string;
  category: string | null;
}

export interface TotaisDespesas {
  total: number;
  porGrupo: Record<GrupoDespesa, number>;
  pago: number;
  pendente: number;
  cotados: number;
  itens: number;
}

export interface IndicadoresPublico {
  audience: number;
  revenue: number;
  averageTicket: number | null;
  breakEven: number | null;
  costPerPerson: number | null;
  profit: number;
}

export interface ResumoPlanejamento {
  despesas: TotaisDespesas;
  ingressosPlanejados: number;
  atual: IndicadoresPublico | null;
  cenarios: IndicadoresPublico[];
}

export interface ParcelaDespesa {
  id: string;
  expenseId: string;
  expenseDescription: string;
  expenseGroup: GrupoDespesa;
  expenseCategory: string;
  supplierName: string | null;
  dueDate: string;
  amount: number;
  status: StatusPagamentoDespesa;
  paidBy: string | null;
  paymentMethod: string | null;
}

export interface ParcelaPayload {
  dueDate: string;
  amount: number;
  status: StatusPagamentoDespesa;
  paidBy: string | null;
  paymentMethod: string | null;
}

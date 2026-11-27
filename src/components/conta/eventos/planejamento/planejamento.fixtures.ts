import type {
  DespesaPlanejamento,
  EventoPlanejamento,
  FornecedorPlanejamento,
  GrupoDespesa,
  LotePlanejamento,
  StatusPagamentoDespesa,
} from "@/types/planejamento";
import { calcularValorFinal } from "./planejamento.data";

export const FORNECEDORES_MOCK: readonly FornecedorPlanejamento[] = [
  { id: "f-brasao", companyName: "Brasão Eventos", category: "Local" },
  { id: "f-vale-fx", companyName: "Vale FX", category: "Efeitos" },
  { id: "f-porto", companyName: "Porto Seguro", category: "Seguro" },
  { id: "f-flex", companyName: "Flex Tendas", category: "Estrutura" },
  { id: "f-nox", companyName: "Nox Som e Luz", category: "Som e iluminação" },
  { id: "f-lopes", companyName: "Lopes Eventos", category: "Estrutura" },
  { id: "f-proth", companyName: "Proth Seg", category: "Segurança" },
  { id: "f-bombeiros", companyName: "Brigada Vale Bombeiros", category: "Segurança" },
  { id: "f-um33", companyName: "UM33 Limpeza", category: "Limpeza" },
  { id: "f-gelitos", companyName: "Gelo Gelitos", category: "Bebidas" },
  { id: "f-armazem", companyName: "Armazém da Cerveja", category: "Bebidas" },
  { id: "f-ambev", companyName: "AMBEV", category: "Bebidas" },
  { id: "f-mansur", companyName: "Mansur Distribuidora", category: "Bebidas" },
  { id: "f-meta", companyName: "Meta", category: "Marketing" },
];

export const EVENTO_MOCK: EventoPlanejamento = {
  id: "codeniver",
  name: "Codeniver",
  startDate: "2026-12-12T14:00:00-03:00",
  endDate: "2026-12-12T22:00:00-03:00",
  venueName: "Brasão Eventos",
  expectedAudience: 300,
};

export const LOTES_MOCK: readonly LotePlanejamento[] = [
  { id: "l-promo", batch: "Promocional", price: 45, quantity: 10, salesStartDate: "2026-10-13T18:00:00-03:00" },
  { id: "l-bateria", batch: "Bateria", price: 50, quantity: 40, salesStartDate: "2026-10-13T18:00:00-03:00" },
  { id: "l-trabalha", batch: "Trabalha", price: 45, quantity: 0, salesStartDate: "2026-10-13T18:00:00-03:00" },
  { id: "l-leve3", batch: "Leve 3 pague 145", price: 48.33, quantity: 30, salesStartDate: "2026-10-13T18:00:00-03:00" },
  { id: "l-1", batch: "1º Lote", price: 50, quantity: 85, salesStartDate: "2026-10-14T00:00:00-03:00" },
  { id: "l-2", batch: "2º Lote", price: 55, quantity: 105, salesStartDate: "2026-10-27T00:00:00-03:00" },
  { id: "l-3", batch: "3º Lote", price: 60, quantity: 30, salesStartDate: "2026-11-10T00:00:00-03:00" },
];

interface LinhaMock {
  group: GrupoDespesa;
  category: string;
  description: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  responsible?: string;
  quoted?: boolean;
  paymentStatus?: StatusPagamentoDespesa;
  notes?: string;
}

const LINHAS: readonly LinhaMock[] = [
  { group: "fixed", category: "Estrutura", description: "Local", supplierId: "f-brasao", quantity: 1, unitPrice: 4500, responsible: "Reberth", quoted: true, paymentStatus: "pago" },
  { group: "fixed", category: "Estrutura", description: "Efeitos", supplierId: "f-vale-fx", quantity: 0, unitPrice: 840, responsible: "Reberth" },
  { group: "fixed", category: "Estrutura", description: "Seguro", supplierId: "f-porto", quantity: 1, unitPrice: 350, quoted: true, paymentStatus: "pago" },
  { group: "fixed", category: "Estrutura", description: "Tenda palco", supplierId: "f-flex", quantity: 0, unitPrice: 1500 },
  { group: "fixed", category: "Estrutura", description: "Palco", supplierId: "f-nox", quantity: 1, unitPrice: 2190, responsible: "Reberth", quoted: true },
  { group: "fixed", category: "Estrutura", description: "Gradil", supplierId: "f-lopes", quantity: 50, unitPrice: 20 },
  { group: "fixed", category: "Staff", description: "Seguranças", supplierId: "f-proth", quantity: 5, unitPrice: 102.5, responsible: "Edu", quoted: true },
  { group: "fixed", category: "Staff", description: "Bombeiros", supplierId: "f-bombeiros", quantity: 3, unitPrice: 102.5, responsible: "Edu", quoted: true },
  { group: "fixed", category: "Staff", description: "Limpeza", supplierId: "f-um33", quantity: 0, unitPrice: 170, responsible: "Reberth" },
  { group: "fixed", category: "Atrações", description: "15h30 · Samurai", quantity: 1, unitPrice: 200 },
  { group: "fixed", category: "Atrações", description: "18h · DJ Lano", quantity: 1, unitPrice: 400 },
  { group: "fixed", category: "Atrações", description: "21h · Eight", quantity: 1, unitPrice: 550 },
  { group: "variable", category: "Bar", description: "Gelo cubo", supplierId: "f-gelitos", quantity: 11, unitPrice: 24, responsible: "Cibelle", quoted: true },
  { group: "variable", category: "Bar", description: "Gelo escama", supplierId: "f-armazem", quantity: 16, unitPrice: 14, responsible: "Cibelle", quoted: true },
  { group: "variable", category: "Bar", description: "Térmica", supplierId: "f-gelitos", quantity: 2, unitPrice: 60, responsible: "Cibelle", quoted: true },
  { group: "variable", category: "Open", description: "Baquetada", quantity: 1, unitPrice: 175.83, notes: "138 unidades" },
  { group: "variable", category: "Open", description: "Vodka", supplierId: "f-ambev", quantity: 36, unitPrice: 8.5, quoted: true },
  { group: "variable", category: "Open", description: "Cerveja", supplierId: "f-ambev", quantity: 1, unitPrice: 3726, quoted: true, notes: "66 fardos / 374 L" },
  { group: "variable", category: "Open", description: "Corote", supplierId: "f-ambev", quantity: 96, unitPrice: 3.59, quoted: true },
  { group: "variable", category: "Open", description: "Energético", supplierId: "f-mansur", quantity: 0, unitPrice: 7.19, quoted: true },
  { group: "variable", category: "Open", description: "Água 20 L", quantity: 16, unitPrice: 11 },
  { group: "variable", category: "Open", description: "Fardo de água 500 ml", quantity: 5, unitPrice: 15 },
  { group: "variable", category: "Boom", description: "Canelinha", quantity: 2, unitPrice: 12 },
  { group: "variable", category: "Boom", description: "Pirulito", quantity: 3, unitPrice: 9 },
  { group: "variable", category: "Boom", description: "Geladinho", quantity: 3, unitPrice: 10.49 },
  { group: "marketing", category: "MKT", description: "Crédito para tráfego pago", supplierId: "f-meta", quantity: 0, unitPrice: 1000 },
];

export function criarDespesasMock(): DespesaPlanejamento[] {
  return LINHAS.map((linha, index) => {
    const fornecedor = FORNECEDORES_MOCK.find((item) => item.id === linha.supplierId) ?? null;
    return {
      id: `d-${index + 1}`,
      group: linha.group,
      category: linha.category,
      description: linha.description,
      supplierId: fornecedor?.id ?? null,
      supplierName: fornecedor?.companyName ?? null,
      quantity: linha.quantity,
      unitPrice: linha.unitPrice,
      amount: calcularValorFinal(linha.quantity, linha.unitPrice),
      responsible: linha.responsible ?? null,
      quoted: linha.quoted ?? false,
      paymentStatus: linha.paymentStatus ?? "pendente",
      notes: linha.notes ?? null,
      dueDate: null,
    };
  });
}

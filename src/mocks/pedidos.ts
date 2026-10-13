import type { Pedido } from "@/types/pedido";

/**
 * MOCK TEMPORÁRIO: substituir pela chamada ao `hubee-api` quando a integração entrar.
 * TODO(orders-api): remover junto com `getPedidoMock`.
 */
export const pedidosMock: Pedido[] = [
  {
    id: "1",
    numero: "10231",
    status: "pago",
    evento: {
      id: "e1",
      nome: "Calourada Unifesp 2026",
      descricao: "A maior festa de recepção dos calouros do campus.",
      categoria: "festas",
      local: "Quadra Poliesportiva",
      dataInicio: "2026-10-31T23:00:00.000Z",
      dataFim: "2026-11-01T04:00:00.000Z",
    },
    itens: [{ id: "i1", descricao: "Ingresso Inteiro/Lote 1", quantidade: 1, valorUnitario: 67 }],
    total: 67,
    ingressos: [
      { id: "t1", nomeParticipante: "Maria Silva", tipo: "Ingresso Inteiro/Lote 1", codigo: "ABC-123-XYZ" },
    ],
  },
  {
    id: "2",
    numero: "10232",
    status: "pendente",
    evento: {
      id: "e2",
      nome: "Show Banda Colmeia",
      descricao: "Noite de rock autoral com bandas da região.",
      categoria: "shows",
      local: "Casa de Shows Vila · Ubatuba",
      dataInicio: "2026-11-07T23:00:00.000Z",
      dataFim: "2026-11-08T03:00:00.000Z",
    },
    itens: [{ id: "i2", descricao: "Ingresso Inteiro/Lote 2", quantidade: 2, valorUnitario: 67 }],
    total: 134,
    ingressos: [],
  },
  {
    id: "3",
    numero: "10233",
    status: "cancelado",
    evento: {
      id: "e3",
      nome: "Palestra: IA na Engenharia de Software",
      descricao: "Como a IA está mudando o desenvolvimento de software.",
      categoria: "palestras",
      local: "Auditório Principal",
      dataInicio: "2026-11-14T17:00:00.000Z",
      dataFim: "2026-11-14T20:00:00.000Z",
    },
    itens: [{ id: "i3", descricao: "Ingresso Meia/Lote 1", quantidade: 1, valorUnitario: 33.5 }],
    total: 33.5,
    ingressos: [],
  },
  {
    id: "4",
    numero: "10234",
    status: "estornado",
    evento: {
      id: "e4",
      nome: "Interfaculdades de Vôlei",
      descricao: "Torneio entre as atléticas da região.",
      categoria: "esportes",
      local: "Quadra Poliesportiva",
      dataInicio: "2026-11-21T13:00:00.000Z",
      dataFim: "2026-11-21T22:00:00.000Z",
    },
    itens: [{ id: "i4", descricao: "Ingresso Inteiro/Lote 1", quantidade: 1, valorUnitario: 15 }],
    total: 15,
    ingressos: [],
  },
];

export function getPedidoMock(id: string): Pedido | undefined {
  return pedidosMock.find((pedido) => pedido.id === id);
}

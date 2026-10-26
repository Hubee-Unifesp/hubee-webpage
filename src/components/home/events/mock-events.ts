import type { EventSummary, HomeEvents } from "@/lib/api/events";

const BRAZIL_OFFSET_MS = 3 * 60 * 60 * 1000;
const MOCK_BASE_DATE = new Date(Date.now() - BRAZIL_OFFSET_MS);
MOCK_BASE_DATE.setUTCHours(0, 0, 0, 0);

function mockDate(daysFromNow: number, hour = 0): string {
  const date = new Date(MOCK_BASE_DATE);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(hour, 0, 0, 0);
  return new Date(date.getTime() + BRAZIL_OFFSET_MS).toISOString();
}

export const MOCK_EVENTS: EventSummary[] = [
  {
    id: "mock-1",
    title: "Bota Fora Unifesp 2025",
    description: "A maior festa universitária de encerramento do semestre.",
    category: "festas",
    organizerName: "Atlética Unifesp SJC",
    venueName: "Arena Vale · São José dos Campos",
    startDate: mockDate(1, 22),
    endDate: mockDate(2, 5),
    price: 45,
    batchLabel: "2º Lote",
    capacity: 500,
    ticketsSold: 430,
  },
  {
    id: "mock-2",
    title: "Calourada Integrada SP",
    description: "Integração de todos os campi com atrações ao vivo.",
    category: "festas",
    organizerName: "DCE Unifesp",
    venueName: "Espaço Vila Mariana · São Paulo",
    startDate: mockDate(2, 21),
    endDate: mockDate(3, 4),
    price: 35,
    batchLabel: "1º Lote",
    capacity: 800,
    ticketsSold: 320,
  },
  {
    id: "mock-3",
    title: "Festival Acústico da Serra",
    description: "Noite de bandas universitárias e música autoral.",
    category: "shows",
    organizerName: "Coletivo Cultural ICT",
    venueName: "Praça Central · São Francisco Xavier",
    startDate: mockDate(3, 19),
    endDate: mockDate(3, 23),
    price: 0,
    capacity: 300,
    ticketsSold: 120,
  },
  {
    id: "mock-4",
    title: "Simpósio de IA e Engenharia de Software",
    description: "Palestras e workshops práticos sobre agentes de IA e arquitetura.",
    category: "palestras",
    organizerName: "DA Comp Unifesp",
    venueName: "Auditório Parque Tecnológico · São José dos Campos",
    startDate: mockDate(4, 14),
    endDate: mockDate(4, 18),
    price: 0,
    capacity: 200,
    ticketsSold: 175,
  },
  {
    id: "mock-5",
    title: "InterUnifesp — Torneio de Futsal e Vôlei",
    description: "Campeonato entre as atléticas dos campi da Unifesp.",
    category: "esportes",
    organizerName: "Liga das Atléticas",
    venueName: "Ginásio Ibirapuera · São Paulo",
    startDate: mockDate(5, 9),
    endDate: mockDate(6, 18),
    price: 20,
    batchLabel: "Lote Único",
    capacity: 600,
    ticketsSold: 510,
  },
  {
    id: "mock-6",
    title: "Semana da Biotecnologia e Inovação",
    description: "Apresentação de projetos acadêmicos, pôsteres e mesas-redondas.",
    category: "academicos",
    organizerName: "CA Biotech",
    venueName: "Campus Talim · São José dos Campos",
    startDate: mockDate(6, 10),
    endDate: mockDate(7, 17),
    price: 15,
    batchLabel: "Inscrição",
    capacity: 250,
    ticketsSold: 90,
  },
];

export const MOCK_HOME_EVENTS: HomeEvents = {
  featured: [MOCK_EVENTS[0], MOCK_EVENTS[1]],
  thisWeek: {
    startDate: mockDate(0),
    endDate: mockDate(7, 23),
    events: [MOCK_EVENTS[0], MOCK_EVENTS[1], MOCK_EVENTS[2]],
  },
  sellingOut: [MOCK_EVENTS[0], MOCK_EVENTS[3], MOCK_EVENTS[4]],
  free: [MOCK_EVENTS[2], MOCK_EVENTS[3]],
  categories: [
    { category: "festas", count: 2 },
    { category: "shows", count: 1 },
    { category: "palestras", count: 1 },
    { category: "esportes", count: 1 },
    { category: "academicos", count: 1 },
    { category: "outros", count: 0 },
  ],
  upcoming: MOCK_EVENTS,
};

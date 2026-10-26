import type { EventDetails } from "./events.types";

/**
 * Dados mockados da página de detalhes (GOL-140), espelhando o protótipo do Figma (GOL-138).
 * Serão substituídos pela integração real com a API em uma task própria.
 */
export const MOCK_EVENT_ID = "8f1c2a4e-6b3d-4e5f-9a7b-1c2d3e4f5a6b";

export const mockEventDetails: EventDetails = {
  id: MOCK_EVENT_ID,
  title: "Entre acordes e encontros",
  tagline: "Uma noite de jazz, soul e afeto",
  description: [
    "Tem noites que a gente leva para casa. Entre acordes e encontros é um convite para desacelerar, descobrir novos sons e dividir o que a música tem de melhor: a presença.",
    "No palco, vozes da cena independente de São Paulo se encontram em um repertório que passeia pelo jazz, pelo soul e pela música brasileira. Arranjos afetivos, improvisos e canções que abraçam — de perto, sem pressa.",
    "A casa abre às 19h, com discotecagem e drinks autorais no bar. O show principal começa às 20h e segue até o último bis.",
    "Evento para maiores de 18 anos. Apresente um documento com foto na entrada.",
  ].join("\n\n"),
  category: "shows",
  ageRating: "18",
  startDate: "2026-11-21T23:00:00.000Z",
  endDate: "2026-11-22T03:00:00.000Z",
  photoUrl: null,
  venue: {
    id: "3b7e9d21-4c5a-4f6b-8e7d-2a1b3c4d5e6f",
    name: "Casa Natura Musical",
    address: {
      street: "Rua Artur de Azevedo",
      number: "2134",
      complement: null,
      neighborhood: "Pinheiros",
      city: "São Paulo",
      state: "SP",
      zipCode: "05404005",
    },
  },
  organizer: {
    id: "c4d5e6f7-8a9b-4c0d-9e1f-2a3b4c5d6e7f",
    name: "Coletivo Entro",
    description: "Música que aproxima.",
  },
  ticketTypes: [
    { id: "a1b2c3d4-0001-4a5b-8c6d-7e8f9a0b1c2d", batch: "1º Lote", price: 60, soldOut: true },
    { id: "a1b2c3d4-0002-4a5b-8c6d-7e8f9a0b1c2d", batch: "2º Lote", price: 80, soldOut: false },
    { id: "a1b2c3d4-0003-4a5b-8c6d-7e8f9a0b1c2d", batch: "VIP", price: 140, soldOut: false },
  ],
};

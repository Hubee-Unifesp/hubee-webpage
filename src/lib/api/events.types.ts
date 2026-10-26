import type { StatusEvento } from "@/types/organizacao";

export type EventCategory =
  | "festas"
  | "shows"
  | "palestras"
  | "esportes"
  | "academicos"
  | "outros";

export interface EventSummary {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  organizerName: string;
  venueName: string;
  startDate: string;
  endDate: string;
  price: number | null;
  batchLabel?: string;
  capacity: number | null;
  ticketsSold: number | null;
}

export interface CategorySummary {
  category: EventCategory;
  count: number;
}

export interface HomeEvents {
  featured: EventSummary[];
  thisWeek: {
    startDate: string;
    endDate: string;
    events: EventSummary[];
  };
  sellingOut: EventSummary[];
  free: EventSummary[];
  categories: CategorySummary[];
  upcoming: EventSummary[];
}

export interface ApiEvent {
  id: string;
  name: string;
  description: string | null;
  organizerId: string;
  venueId: string;
  startDate: string;
  endDate: string;
  status?: StatusEvento;
  category: string | null;
  featured: boolean;
}

/** Item retornado por `GET /events` (`EventListItemResponseDto`). */
export interface ApiEventListItem extends ApiEvent {
  venueName?: string | null;
  venueCity?: string | null;
  minPrice?: number | string | null;
  minPriceBatch?: string | null;
  organizerName?: string;
  capacity?: number | null;
  ticketsSold?: number | null;
}

/** Resposta paginada retornada por `GET /events` (`EventPageResponseDto`). */
export interface ApiEventPage {
  data: ApiEventListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Filtros aceitos por `searchEvents` para consulta em `GET /events` (GOL-135). */
export interface EventSearchFilters {
  search?: string;
  categories?: EventCategory[];
  city?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

/** Parâmetros para listagem de eventos do organizador em `GET /events`. */
export interface GetOrganizerEventsParams {
  organizerId: string;
  status?: StatusEvento;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiOrganization {
  id: string;
  name: string;
}

export interface ApiVenue {
  id: string;
  name: string;
  address: { city: string } | null;
}

export interface ApiTicketType {
  id: string;
  batch: string;
  price: number | string;
  quantity?: number;
  ticketsSold?: number;
  soldOut?: boolean;
}

/** Contrato retornado por `GET /events/summary` (`EventSummaryResponseDto`). */
export interface ApiEventSummary {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  startDate: string;
  endDate: string;
  featured: boolean;
  organizerName: string;
  venueName: string;
  venueCity: string;
  minPrice: number | string | null;
  minPriceBatch: string | null;
  capacity: number | null;
  ticketsSold: number | null;
}

/** Contrato retornado por `GET /events/:id` (`EventDetailResponseDto`). */
export interface ApiEventDetail {
  id: string;
  name: string;
  description: string | null;
  ageRating: string | null;
  organizerId: string;
  venueId: string;
  startDate: string;
  endDate: string;
  salesStartDate?: string | null;
  status?: string;
  category: string | null;
  edition: string | null;
  photoUrl: string | null;
  featured: boolean;
  venue: {
    id: string;
    name: string;
    maxCapacity?: number;
    address: EventAddress | null;
  } | null;
  organization: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  ticketTypes: ApiTicketType[];
}

/** Classificação indicativa aceita pela API (`eventAgeRating`). */
export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18";

/** Endereço completo do local (`AddressResponseDto`). */
export interface EventAddress {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EventVenue {
  id: string;
  name: string;
  address: EventAddress | null;
}

export interface EventOrganizer {
  id: string;
  name: string;
  description: string | null;
}

/** Lote de ingresso (`TicketTypeResponseDto`); `soldOut` é derivado no front. */
export interface EventTicketType {
  id: string;
  batch: string;
  price: number;
  soldOut: boolean;
}

/** Modelo da página de detalhes: `GET /events/:id` com local, organização e lotes resolvidos. */
export interface EventDetails {
  id: string;
  title: string;
  /** Linha de apoio exibida acima do título (campo `edition` da API). */
  tagline: string | null;
  description: string | null;
  category: EventCategory;
  ageRating: AgeRating | null;
  startDate: string;
  endDate: string;
  photoUrl: string | null;
  venue: EventVenue | null;
  organizer: EventOrganizer | null;
  ticketTypes: EventTicketType[];
}

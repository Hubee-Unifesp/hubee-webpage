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
  category: string | null;
  featured: boolean;
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
}

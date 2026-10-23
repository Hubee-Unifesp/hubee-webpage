export type EventCategory =
  | "festas"
  | "shows"
  | "palestras"
  | "esportes"
  | "academicos"
  | "outros";

export type ApiEventStatus = "published" | "draft" | "finished" | "cancelled";

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

export interface ApiEventListItem extends ApiEvent {
  status: ApiEventStatus;
  createdAt?: string;
  venueName?: string | null;
  venueCity?: string | null;
  minPrice?: number | string | null;
  minPriceBatch?: string | null;
  capacity?: number | null;
  ticketsSold?: number | null;
}

export interface ApiEventPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEventPage {
  data: ApiEventListItem[];
  meta: ApiEventPageMeta;
}

export interface GetOrganizerEventsParams {
  organizerId: string;
  status?: ApiEventStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiOrganization {
  id: string;
  name: string;
}

export interface ApiOrganizationUser {
  orgId: string;
  userId: string;
  role: "admin" | "member";
  permission: "full" | "read_only";
  inviteStatus: "pending" | "accepted" | "declined";
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
}

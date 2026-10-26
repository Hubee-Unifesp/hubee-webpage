import { mockEventDetails } from "./event-details.mock";
import type { EventDetails } from "./events.types";

/**
 * Busca os detalhes de um evento publicado. Retorna `null` quando o evento não existe
 * ou não está publicado (a página exibe o estado 404).
 *
 * Por enquanto usa dados mockados; a integração com `GET /events/:id`,
 * `/events/:id/ticket-types`, `/venues` e `/organizations` via `apiClient` fica para a task de API.
 */
export async function getEventDetails(id: string): Promise<EventDetails | null> {
  return id === mockEventDetails.id ? mockEventDetails : null;
}

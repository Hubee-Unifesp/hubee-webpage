import type { SuggestedTicketType } from "@/lib/validations/event-ai-draft.schema";

const chave = (eventoId: string) => `hubee:ai-draft-lotes:${eventoId}`;

/**
 * Os lotes só podem ser criados depois que o evento existe, e salvar os dados troca a rota
 * (`/meus-eventos/novo` → `/meus-eventos/[id]/editar`). A sessão guarda as sugestões da IA nesse intervalo.
 */
export function salvarLotesSugeridos(eventoId: string, lotes: readonly SuggestedTicketType[]): void {
  try {
    if (lotes.length === 0) window.sessionStorage.removeItem(chave(eventoId));
    else window.sessionStorage.setItem(chave(eventoId), JSON.stringify(lotes));
  } catch {
    // Sem sessionStorage (modo privado, quota): as sugestões se perdem, o cadastro segue normal.
  }
}

export function carregarLotesSugeridos(eventoId: string): SuggestedTicketType[] {
  try {
    const bruto = window.sessionStorage.getItem(chave(eventoId));
    const lotes: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lotes) ? (lotes as SuggestedTicketType[]).filter((lote) => typeof lote?.batch === "string") : [];
  } catch {
    return [];
  }
}

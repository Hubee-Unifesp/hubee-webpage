import type { AssistantTicketType } from "@/lib/api/event-ai-assistant.types";

export type LoteSugerido = AssistantTicketType;

const chave = (eventoId: string) => `hubee:lotes-sugeridos:${eventoId}`;

export function salvarLotesSugeridos(eventoId: string, lotes: readonly LoteSugerido[]): void {
  try {
    if (lotes.length === 0) window.sessionStorage.removeItem(chave(eventoId));
    else window.sessionStorage.setItem(chave(eventoId), JSON.stringify(lotes));
  } catch {
    return;
  }
}

export function lerLotesSugeridos(raw: string | null): LoteSugerido[] {
  if (!raw) return [];
  try {
    const lotes: unknown = JSON.parse(raw);
    if (!Array.isArray(lotes)) return [];
    return lotes.filter(
      (lote): lote is LoteSugerido =>
        typeof lote === "object" && lote !== null && typeof (lote as { batch?: unknown }).batch === "string",
    );
  } catch {
    return [];
  }
}

export function carregarLotesSugeridos(eventoId: string): LoteSugerido[] {
  try {
    return lerLotesSugeridos(window.sessionStorage.getItem(chave(eventoId)));
  } catch {
    return [];
  }
}

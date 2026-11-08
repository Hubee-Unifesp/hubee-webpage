import type { LoteIngresso, LotePayload } from "@/types/lote-ingresso";

/**
 * Armazenamento em memória dos lotes, enquanto os endpoints `/events/:eventId/ticket-types`
 * não estão integrados (Task 6). Guarda por evento para os lotes sobreviverem à troca de etapa do editor.
 * Ao integrar, troque estas funções por chamadas em `src/lib/api/` e apague este arquivo.
 */
const lotesPorEvento = new Map<string, LoteIngresso[]>();

export function obterLotes(eventoId: string, inicial: () => LoteIngresso[]): LoteIngresso[] {
  const existentes = lotesPorEvento.get(eventoId);
  if (existentes) return existentes;
  const seed = inicial();
  lotesPorEvento.set(eventoId, seed);
  return seed;
}

export function salvarLotes(eventoId: string, lotes: LoteIngresso[]): void {
  lotesPorEvento.set(eventoId, lotes);
}

export function novoLote(payload: LotePayload): LoteIngresso {
  return { ...payload, id: crypto.randomUUID(), available: payload.quantity };
}

/** Mantém o já vendido ao mudar o total: o saldo disponível acompanha a diferença. */
export function aplicarEdicao(lote: LoteIngresso, payload: LotePayload): LoteIngresso {
  const vendidos = Math.max(0, lote.quantity - lote.available);
  return { ...lote, ...payload, available: Math.max(0, payload.quantity - vendidos) };
}

export function limparLotesMock(): void {
  lotesPorEvento.clear();
}

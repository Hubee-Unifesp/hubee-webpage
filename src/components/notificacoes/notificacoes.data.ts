export const FILTRO_TODAS_NOTIFICACOES = "all" as const;
export const FILTRO_NAO_LIDAS = "unread" as const;

export type FiltroNotificacoes =
  | typeof FILTRO_TODAS_NOTIFICACOES
  | typeof FILTRO_NAO_LIDAS;

export type NotificacoesStatus = "loading" | "error" | "ok";

export type NotificacaoTipoConhecido =
  | "ORDER_PAID"
  | "TICKET_TYPE_SOLD_OUT"
  | "NEW_SALE"
  | "ORDER_CANCELLED"
  | "EVENT_CANCELLED";

export type NotificacaoTipo = NotificacaoTipoConhecido | (string & {});

export interface NotificacaoItem {
  id: string;
  type: NotificacaoTipo;
  title: string;
  message: string;
  href?: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Verifica se a notificação ainda não foi lida (`readAt === null`). */
export function isNotificacaoNaoLida(item: Pick<NotificacaoItem, "readAt">): boolean {
  return item.readAt === null;
}

/** Conta quantas notificações da lista estão pendentes de leitura. */
export function countUnreadNotificacoes(items: readonly Pick<NotificacaoItem, "readAt">[]): number {
  let count = 0;
  for (const item of items) {
    if (isNotificacaoNaoLida(item)) count += 1;
  }
  return count;
}

/**
 * Filtra as notificações conforme a aba ativa (`Todas` ou `Não lidas`) e ordena da mais recente
 * para a mais antiga (`createdAt DESC`).
 */
export function filterNotificacoes(
  items: readonly NotificacaoItem[],
  filtro: FiltroNotificacoes = FILTRO_TODAS_NOTIFICACOES,
): NotificacaoItem[] {
  return items
    .filter((item) => filtro === FILTRO_TODAS_NOTIFICACOES || isNotificacaoNaoLida(item))
    .sort((a, b) => {
      const timeA = Date.parse(a.createdAt);
      const timeB = Date.parse(b.createdAt);
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
      return timeB - timeA;
    });
}

/** Marca uma notificação específica como lida na lista imutável. */
export function markNotificacaoReadInList(
  items: readonly NotificacaoItem[],
  id: string,
  readAtIso: string = new Date().toISOString(),
): NotificacaoItem[] {
  return items.map((item) =>
    item.id === id && item.readAt === null ? { ...item, readAt: readAtIso } : item,
  );
}

/** Marca todas as notificações pendentes como lidas na lista imutável. */
export function markAllNotificacoesReadInList(
  items: readonly NotificacaoItem[],
  readAtIso: string = new Date().toISOString(),
): NotificacaoItem[] {
  return items.map((item) => (item.readAt === null ? { ...item, readAt: readAtIso } : item));
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Formata a data de criação da notificação em tempo relativo em português
 * (ex.: `"agora"`, `"há 5 min"`, `"há 2 h"`, `"ontem"`, `"há 3 dias"`, ou `"12 de nov."`).
 */
export function formatRelativeNotificationTime(
  createdAt: string,
  referenceDate: Date = new Date(),
  timeZone?: string,
): string {
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) return "";

  const diffMs = Math.max(0, referenceDate.getTime() - createdMs);

  if (diffMs < MINUTE_MS) return "agora";

  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(diffMs / HOUR_MS);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(diffMs / DAY_MS);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;

  return new Date(createdMs).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(timeZone ? { timeZone } : {}),
  });
}

/** Retorna o rótulo contextual do link de destino (`href`) da notificação. */
export function getNotificacaoActionLabel(
  type: NotificacaoTipo,
  href?: string | null,
): string {
  if (!href) return "Ver detalhes";

  if (type === "ORDER_PAID" || href.startsWith("/meus-ingressos")) {
    return "Ver meus ingressos";
  }
  if (type === "TICKET_TYPE_SOLD_OUT" || href.includes("/editar")) {
    return "Gerenciar lotes";
  }
  if (type === "NEW_SALE" || href.startsWith("/meus-eventos")) {
    return "Ver meus eventos";
  }
  if (
    type === "ORDER_CANCELLED" ||
    type === "EVENT_CANCELLED" ||
    href.startsWith("/conta/pedidos")
  ) {
    return "Ver detalhes do pedido";
  }

  return "Ver detalhes";
}

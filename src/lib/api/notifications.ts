import type {
  ApiNotificacao,
  ApiNotificacoesLista,
  NotificacaoItem,
  NotificacaoTipo,
  NotificacoesFiltros,
  NotificacoesLista,
} from "@/types/notificacao";
import { apiClient } from "./apiClient";

/** A API e as telas nomeiam os tipos de forma diferente; o que não está aqui passa como veio. */
const TIPOS: Record<string, NotificacaoTipo> = {
  payment_confirmed: "ORDER_PAID",
  batch_sold_out: "TICKET_TYPE_SOLD_OUT",
  new_sale: "NEW_SALE",
  order_cancelled: "ORDER_CANCELLED",
  order_refunded: "ORDER_REFUNDED",
  event_cancelled: "EVENT_CANCELLED",
};

/**
 * A API grava o destino com rotas que o front não tem (`/conta/ingressos`, `/organizador/eventos/:id`).
 * Traduz para as páginas reais; qualquer outro destino segue como veio.
 */
export function toNotificacaoHref(href: string | null): string | null {
  if (!href) return null;
  if (href === "/conta/ingressos") return "/meus-ingressos";
  const evento = /^\/organizador\/eventos\/([^/?#]+)/.exec(href);
  if (evento) return `/meus-eventos/${evento[1]}/editar`;
  return href;
}

export function toNotificacaoItem(notificacao: ApiNotificacao): NotificacaoItem {
  return {
    id: notificacao.id,
    type: TIPOS[notificacao.type] ?? notificacao.type,
    title: notificacao.title,
    message: notificacao.message,
    href: toNotificacaoHref(notificacao.href),
    readAt: notificacao.readAt ?? null,
    createdAt: notificacao.createdAt,
  };
}

/** `GET /notifications`: notificações do usuário logado, da mais recente para a mais antiga, e o total de não lidas. */
export async function getNotifications(filtros: NotificacoesFiltros = {}): Promise<NotificacoesLista> {
  const { data } = await apiClient.get<ApiNotificacoesLista>("/notifications", { params: filtros });
  return { notificacoes: data.data.map(toNotificacaoItem), unreadCount: data.unreadCount };
}

/** `PATCH /notifications/:id/read`. Devolve a notificação já com `readAt`. */
export async function markNotificationAsRead(id: string): Promise<NotificacaoItem> {
  const { data } = await apiClient.patch<ApiNotificacao>(`/notifications/${id}/read`);
  return toNotificacaoItem(data);
}

/** `PATCH /notifications/read-all`. Devolve quantas notificações foram marcadas. */
export async function markAllNotificationsAsRead(): Promise<number> {
  const { data } = await apiClient.patch<{ updatedCount: number }>("/notifications/read-all");
  return data.updatedCount;
}

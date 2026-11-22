/** Tipos de notificação que a `hubee-api` grava (`notification_type`). */
export type ApiNotificacaoTipo =
  | "payment_confirmed"
  | "order_cancelled"
  | "order_refunded"
  | "event_cancelled"
  | "new_sale"
  | "batch_sold_out";

/** Notificação como `GET /notifications` devolve (`NotificationResponseDto`). */
export interface ApiNotificacao {
  id: string;
  userId: string;
  type: ApiNotificacaoTipo | (string & {});
  title: string;
  message: string;
  href: string | null;
  /** ISO 8601. `null` enquanto não foi lida. */
  readAt: string | null;
  createdAt: string;
}

/** Resposta de `GET /notifications` (`NotificationListResponseDto`). */
export interface ApiNotificacoesLista {
  data: ApiNotificacao[];
  /** Total de não lidas do usuário, mesmo as que ficaram fora da página retornada. */
  unreadCount: number;
}

export type NotificacaoTipoConhecido =
  | "ORDER_PAID"
  | "TICKET_TYPE_SOLD_OUT"
  | "NEW_SALE"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "EVENT_CANCELLED";

export type NotificacaoTipo = NotificacaoTipoConhecido | (string & {});

/** Notificação como as telas a exibem. */
export interface NotificacaoItem {
  id: string;
  type: NotificacaoTipo;
  title: string;
  message: string;
  href?: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Lista já convertida para as telas, com o contador de não lidas da API. */
export interface NotificacoesLista {
  notificacoes: NotificacaoItem[];
  unreadCount: number;
}

export interface NotificacoesFiltros {
  unreadOnly?: boolean;
  /** 1 a 100. A API usa 20 quando omitido. */
  limit?: number;
  offset?: number;
}

import { describe, expect, it } from "vitest";
import {
  countUnreadNotificacoes,
  FILTRO_NAO_LIDAS,
  FILTRO_TODAS_NOTIFICACOES,
  filterNotificacoes,
  formatRelativeNotificationTime,
  getNotificacaoActionLabel,
  isNotificacaoNaoLida,
  markAllNotificacoesReadInList,
  markNotificacaoReadInList,
  type NotificacaoItem,
} from "./notificacoes.data";

const NOTIFICACOES_EXEMPLO: readonly NotificacaoItem[] = [
  {
    id: "notif-1",
    type: "ORDER_PAID",
    title: "Pagamento confirmado! Seus ingressos estão disponíveis",
    message: "O pagamento do pedido #8F42A para Festival Indie SP 2026 foi aprovado.",
    href: "/meus-ingressos",
    readAt: null,
    createdAt: "2026-11-20T14:55:00.000Z",
  },
  {
    id: "notif-2",
    type: "TICKET_TYPE_SOLD_OUT",
    title: "Lote esgotado em Semana de Computação UNIFESP",
    message: "O 1º Lote — Meia-Entrada atingiu 100% da capacidade.",
    href: "/meus-eventos/evt-1/editar",
    readAt: null,
    createdAt: "2026-11-20T14:18:00.000Z",
  },
  {
    id: "notif-3",
    type: "ORDER_CANCELLED",
    title: "Pedido #7C19B cancelado e reembolso solicitado",
    message: "Seu pedido para Workshop de Fotografia Urbana foi cancelado.",
    href: "/conta/pedidos/ord-2",
    readAt: "2026-11-19T18:00:00.000Z",
    createdAt: "2026-11-19T14:00:00.000Z",
  },
];

describe("notificacoes.data", () => {
  it("identifica notificações não lidas e calcula o contador total", () => {
    expect(isNotificacaoNaoLida(NOTIFICACOES_EXEMPLO[0])).toBe(true);
    expect(isNotificacaoNaoLida(NOTIFICACOES_EXEMPLO[2])).toBe(false);
    expect(countUnreadNotificacoes(NOTIFICACOES_EXEMPLO)).toBe(2);
    expect(countUnreadNotificacoes([])).toBe(0);
  });

  it("filtra por Todas ou Não lidas ordenando da mais recente para a mais antiga", () => {
    const desordenadas: NotificacaoItem[] = [
      NOTIFICACOES_EXEMPLO[2],
      NOTIFICACOES_EXEMPLO[0],
      NOTIFICACOES_EXEMPLO[1],
    ];

    const todas = filterNotificacoes(desordenadas, FILTRO_TODAS_NOTIFICACOES);
    expect(todas.map((item) => item.id)).toEqual(["notif-1", "notif-2", "notif-3"]);

    const naoLidas = filterNotificacoes(desordenadas, FILTRO_NAO_LIDAS);
    expect(naoLidas.map((item) => item.id)).toEqual(["notif-1", "notif-2"]);
  });

  it("marca uma ou todas as notificações como lidas de forma imutável", () => {
    const readIso = "2026-11-20T15:00:00.000Z";
    const aposUma = markNotificacaoReadInList(NOTIFICACOES_EXEMPLO, "notif-1", readIso);

    expect(aposUma[0].readAt).toBe(readIso);
    expect(aposUma[1].readAt).toBeNull();
    expect(aposUma[2].readAt).toBe("2026-11-19T18:00:00.000Z");
    expect(countUnreadNotificacoes(aposUma)).toBe(1);

    const aposTodas = markAllNotificacoesReadInList(NOTIFICACOES_EXEMPLO, readIso);
    expect(countUnreadNotificacoes(aposTodas)).toBe(0);
    expect(aposTodas[2].readAt).toBe("2026-11-19T18:00:00.000Z");
  });

  it("formata o tempo decorrido relativo em português", () => {
    const ref = new Date("2026-11-20T15:00:00.000Z");

    expect(formatRelativeNotificationTime("2026-11-20T14:59:40.000Z", ref)).toBe("agora");
    expect(formatRelativeNotificationTime("2026-11-20T14:55:00.000Z", ref)).toBe("há 5 min");
    expect(formatRelativeNotificationTime("2026-11-20T13:00:00.000Z", ref)).toBe("há 2 h");
    expect(formatRelativeNotificationTime("2026-11-19T14:00:00.000Z", ref)).toBe("ontem");
    expect(formatRelativeNotificationTime("2026-11-17T14:00:00.000Z", ref)).toBe("há 3 dias");
    expect(formatRelativeNotificationTime("2026-11-01T14:00:00.000Z", ref, "UTC")).toMatch(/01/);
    expect(formatRelativeNotificationTime("2026-11-01T23:30:00.000Z", ref, "America/Sao_Paulo")).toMatch(/01/);
    expect(formatRelativeNotificationTime("data-invalida", ref)).toBe("");
  });

  it("resolve o rótulo contextual de ação pelo tipo ou destino da notificação", () => {
    expect(getNotificacaoActionLabel("ORDER_PAID", "/meus-ingressos")).toBe("Ver meus ingressos");
    expect(getNotificacaoActionLabel("TICKET_TYPE_SOLD_OUT", "/meus-eventos/1/editar")).toBe(
      "Gerenciar lotes",
    );
    expect(getNotificacaoActionLabel("NEW_SALE", "/meus-eventos")).toBe("Ver meus eventos");
    expect(getNotificacaoActionLabel("ORDER_CANCELLED", "/conta/pedidos/1")).toBe(
      "Ver detalhes do pedido",
    );
    expect(getNotificacaoActionLabel("EVENT_CANCELLED", "/conta/pedidos/2")).toBe(
      "Ver detalhes do pedido",
    );
    expect(getNotificacaoActionLabel("CUSTOM", "/eventos/1")).toBe("Ver detalhes");
  });
});

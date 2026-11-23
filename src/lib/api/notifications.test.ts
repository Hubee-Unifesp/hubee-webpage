import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiNotificacao } from "@/types/notificacao";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  toNotificacaoHref,
} from "./notifications";

const { getMock, patchMock } = vi.hoisted(() => ({ getMock: vi.fn(), patchMock: vi.fn() }));

vi.mock("./apiClient", () => ({ apiClient: { get: getMock, patch: patchMock } }));

const ID = "7d1b3c5e-2a4f-4b6c-8d9e-0a1b2c3d4e5f";

const pagamento: ApiNotificacao = {
  id: ID,
  userId: "u-1",
  type: "payment_confirmed",
  title: "Pagamento confirmado",
  message: "Seus ingressos já estão disponíveis.",
  href: "/conta/ingressos",
  readAt: null,
  createdAt: "2026-11-20T15:00:00.000Z",
};

function httpError(status: number, message: string) {
  const config = { headers: new AxiosHeaders() };
  const response = { status, statusText: "", data: { statusCode: status, message }, headers: {}, config } satisfies AxiosResponse;
  return new AxiosError(message, AxiosError.ERR_BAD_RESPONSE, config, undefined, response);
}

beforeEach(() => {
  getMock.mockReset();
  patchMock.mockReset();
});

describe("toNotificacaoHref", () => {
  it("traduz as rotas da API para as páginas do front", () => {
    expect(toNotificacaoHref("/conta/ingressos")).toBe("/meus-ingressos");
    expect(toNotificacaoHref("/organizador/eventos/abc-123")).toBe("/meus-eventos/abc-123/editar");
  });

  it("mantém os demais destinos e devolve null sem destino", () => {
    expect(toNotificacaoHref("/conta/pedidos")).toBe("/conta/pedidos");
    expect(toNotificacaoHref(null)).toBeNull();
    expect(toNotificacaoHref("")).toBeNull();
  });
});

describe("getNotifications", () => {
  it("lista as notificações convertidas e o contador de não lidas", async () => {
    getMock.mockResolvedValue({
      data: {
        data: [pagamento, { ...pagamento, id: "n-2", type: "batch_sold_out", href: "/organizador/eventos/e-1", readAt: "2026-11-21T10:00:00.000Z" }],
        unreadCount: 7,
      },
    });

    const lista = await getNotifications();

    expect(getMock).toHaveBeenCalledWith("/notifications", { params: {} });
    expect(lista.unreadCount).toBe(7);
    expect(lista.notificacoes).toEqual([
      {
        id: ID,
        type: "ORDER_PAID",
        title: "Pagamento confirmado",
        message: "Seus ingressos já estão disponíveis.",
        href: "/meus-ingressos",
        readAt: null,
        createdAt: "2026-11-20T15:00:00.000Z",
      },
      expect.objectContaining({
        id: "n-2",
        type: "TICKET_TYPE_SOLD_OUT",
        href: "/meus-eventos/e-1/editar",
        readAt: "2026-11-21T10:00:00.000Z",
      }),
    ]);
  });

  it("repassa os filtros e preserva tipos desconhecidos", async () => {
    getMock.mockResolvedValue({ data: { data: [{ ...pagamento, type: "novo_tipo" }], unreadCount: 1 } });

    const lista = await getNotifications({ unreadOnly: true, limit: 5 });

    expect(getMock).toHaveBeenCalledWith("/notifications", { params: { unreadOnly: true, limit: 5 } });
    expect(lista.notificacoes[0].type).toBe("novo_tipo");
  });

  it("propaga a falha da API", async () => {
    const erro = httpError(503, "indisponível");
    getMock.mockRejectedValue(erro);
    await expect(getNotifications()).rejects.toBe(erro);
  });
});

describe("markNotificationAsRead", () => {
  it("marca uma notificação como lida e devolve o item com readAt", async () => {
    patchMock.mockResolvedValue({ data: { ...pagamento, readAt: "2026-11-22T09:00:00.000Z" } });

    const item = await markNotificationAsRead(ID);

    expect(patchMock).toHaveBeenCalledWith(`/notifications/${ID}/read`);
    expect(item).toMatchObject({ id: ID, type: "ORDER_PAID", readAt: "2026-11-22T09:00:00.000Z" });
  });

  it("propaga o 404 de notificação inexistente", async () => {
    const erro = httpError(404, "Notificação não encontrada");
    patchMock.mockRejectedValue(erro);
    await expect(markNotificationAsRead(ID)).rejects.toBe(erro);
  });
});

describe("markAllNotificationsAsRead", () => {
  it("marca todas como lidas e devolve a quantidade atualizada", async () => {
    patchMock.mockResolvedValue({ data: { updatedCount: 3 } });

    await expect(markAllNotificationsAsRead()).resolves.toBe(3);
    expect(patchMock).toHaveBeenCalledWith("/notifications/read-all");
  });

  it("propaga a falha da API", async () => {
    const erro = httpError(500, "erro");
    patchMock.mockRejectedValue(erro);
    await expect(markAllNotificationsAsRead()).rejects.toBe(erro);
  });
});

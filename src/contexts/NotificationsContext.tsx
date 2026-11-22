"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/api/notifications";
import type { NotificacaoItem } from "@/types/notificacao";

export type NotificacoesStatus = "loading" | "ok" | "error";

interface NotificationsContextType {
  notificacoes: NotificacaoItem[];
  /** Total de não lidas segundo a API; alimenta o badge do sino no header. */
  unreadCount: number;
  status: NotificacoesStatus;
  /** Busca a lista de novo (ao abrir `/notificacoes` ou no "Tentar novamente"). */
  recarregar: () => Promise<void>;
  /** Atualiza a tela na hora e desfaz se a API falhar, rejeitando para quem chamou avisar o erro. */
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const ESTADO_VAZIO = { notificacoes: [] as NotificacaoItem[], unreadCount: 0, status: "loading" as NotificacoesStatus };

/**
 * Notificações da pessoa logada. Fica no root, ao lado do `CartProvider`, porque o header público também
 * mostra o contador. Sem sessão, o estado é zerado: o logout não deixa notificações para a próxima conta.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [estado, setEstado] = useState(ESTADO_VAZIO);
  const userIdAtual = useRef(userId);

  // Troca de conta ou logout: descarta a lista antiga durante a renderização, sem esperar um efeito.
  const [ultimoUserId, setUltimoUserId] = useState(userId);
  if (userId !== ultimoUserId) {
    setUltimoUserId(userId);
    setEstado(ESTADO_VAZIO);
  }

  const recarregar = useCallback(async () => {
    if (!userId) return;
    try {
      const lista = await getNotifications();
      // Resposta de outra conta (logout no meio da chamada) não entra no estado.
      if (userIdAtual.current !== userId) return;
      setEstado({ ...lista, status: "ok" });
    } catch {
      if (userIdAtual.current !== userId) return;
      setEstado((atual) => ({ ...atual, status: "error" }));
    }
  }, [userId]);

  useEffect(() => {
    userIdAtual.current = userId;
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial das notificações da conta
    void recarregar();
  }, [userId, recarregar]);

  const marcarComoLida = useCallback(
    async (id: string) => {
      const alvo = estado.notificacoes.find((item) => item.id === id);
      if (!alvo || alvo.readAt !== null) return;

      const readAt = new Date().toISOString();
      setEstado((atual) => ({
        ...atual,
        unreadCount: Math.max(0, atual.unreadCount - 1),
        notificacoes: atual.notificacoes.map((item) => (item.id === id ? { ...item, readAt } : item)),
      }));

      try {
        await markNotificationAsRead(id);
      } catch (error) {
        setEstado((atual) => ({
          ...atual,
          unreadCount: atual.unreadCount + 1,
          notificacoes: atual.notificacoes.map((item) => (item.id === id ? { ...item, readAt: null } : item)),
        }));
        throw error;
      }
    },
    [estado.notificacoes],
  );

  const marcarTodasComoLidas = useCallback(async () => {
    const pendentes = new Set(estado.notificacoes.filter((item) => item.readAt === null).map((item) => item.id));
    const contadorAnterior = estado.unreadCount;
    if (pendentes.size === 0 && contadorAnterior === 0) return;

    const readAt = new Date().toISOString();
    setEstado((atual) => ({
      ...atual,
      unreadCount: 0,
      notificacoes: atual.notificacoes.map((item) => (pendentes.has(item.id) ? { ...item, readAt } : item)),
    }));

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      setEstado((atual) => ({
        ...atual,
        unreadCount: contadorAnterior,
        notificacoes: atual.notificacoes.map((item) => (pendentes.has(item.id) ? { ...item, readAt: null } : item)),
      }));
      throw error;
    }
  }, [estado.notificacoes, estado.unreadCount]);

  const value = useMemo<NotificationsContextType>(
    () => ({
      notificacoes: estado.notificacoes,
      unreadCount: estado.unreadCount,
      status: estado.status,
      recarregar,
      marcarComoLida,
      marcarTodasComoLidas,
    }),
    [estado, recarregar, marcarComoLida, marcarTodasComoLidas],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications deve ser usado dentro de um NotificationsProvider");
  }
  return context;
}

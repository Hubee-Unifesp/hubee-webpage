"use client";

import { useEffect } from "react";
import { useToast } from "@/components/toast";
import { useNotifications } from "@/contexts/NotificationsContext";
import { NotificacoesContent } from "./notificacoes-content";

/** Liga `/notificacoes` à API (GOL-271): lista, leitura individual e em massa, com toast quando a API falha. */
export function NotificacoesConectadas() {
  const toast = useToast();
  const { notificacoes, status, recarregar, marcarComoLida, marcarTodasComoLidas } = useNotifications();

  // O contador do header já vem carregado; ao abrir a central a lista é buscada de novo para não mostrar dados velhos.
  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  async function lida(id: string) {
    try {
      await marcarComoLida(id);
    } catch (error) {
      toast.error("Não foi possível marcar a notificação como lida. Tente novamente.");
      throw error;
    }
  }

  async function todasLidas() {
    try {
      await marcarTodasComoLidas();
    } catch (error) {
      toast.error("Não foi possível marcar as notificações como lidas. Tente novamente.");
      throw error;
    }
  }

  return (
    <NotificacoesContent
      notificacoes={notificacoes}
      status={status}
      onRetry={() => void recarregar()}
      onMarcarComoLida={lida}
      onMarcarTodasComoLidas={todasLidas}
    />
  );
}

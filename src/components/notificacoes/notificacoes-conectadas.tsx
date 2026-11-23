"use client";

import { useEffect } from "react";
import { ConvitesPendentesCard } from "@/components/conta/perfil/convites-pendentes-card";
import { useToast } from "@/components/toast";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useConvitesPendentes } from "@/hooks/useConvitesPendentes";
import { NotificacoesContent } from "./notificacoes-content";

/** Liga `/notificacoes` à API (GOL-271): lista, leitura individual e em massa, com toast quando a API falha. */
export function NotificacoesConectadas() {
  const toast = useToast();
  const { notificacoes, status, recarregar, marcarComoLida, marcarTodasComoLidas } = useNotifications();

  // O contador do header já vem carregado; ao abrir a central a lista é buscada de novo para não mostrar dados velhos.
  const convites = useConvitesPendentes();
  const recarregarConvites = convites.recarregar;

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    void recarregarConvites();
  }, [recarregarConvites]);

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
      destaque={
        <ConvitesPendentesCard
          convites={convites.convites}
          status={convites.status}
          onRetry={convites.retry}
          onResponder={convites.responder}
        />
      }
    />
  );
}

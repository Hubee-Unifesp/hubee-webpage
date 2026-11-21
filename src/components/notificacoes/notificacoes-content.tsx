"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { NotificacaoCard } from "./notificacao-card";
import { NotificacoesHeader } from "./notificacoes-header";
import { NotificacoesSkeleton } from "./notificacoes-skeleton";
import {
  countUnreadNotificacoes,
  FILTRO_NAO_LIDAS,
  FILTRO_TODAS_NOTIFICACOES,
  filterNotificacoes,
  type FiltroNotificacoes,
  type NotificacaoItem,
  type NotificacoesStatus,
} from "./notificacoes.data";

export interface NotificacoesContentProps {
  /** Lista de notificações (injetada na integração HTTP da GOL-271 ou controlada por estado). */
  notificacoes?: readonly NotificacaoItem[];
  status?: NotificacoesStatus;
  filtroInicial?: FiltroNotificacoes;
  onRetry?: () => void;
  onMarcarComoLida?: (id: string) => void | Promise<void>;
  onMarcarTodasComoLidas?: () => void | Promise<void>;
}

const LISTA_VAZIA: readonly NotificacaoItem[] = [];

/** Página `/notificacoes`: cabeçalho com filtro, marcação como lida, listagem e estados de loading/vazio/erro (GOL-270). */
export function NotificacoesContent({
  notificacoes = LISTA_VAZIA,
  status = "ok",
  filtroInicial = FILTRO_TODAS_NOTIFICACOES,
  onRetry,
  onMarcarComoLida,
  onMarcarTodasComoLidas,
}: NotificacoesContentProps) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<FiltroNotificacoes>(filtroInicial);
  const [lidasLocalmente, setLidasLocalmente] = useState<Readonly<Record<string, string>>>({});
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const itensNormalizados = useMemo<NotificacaoItem[]>(
    () =>
      notificacoes.map((item) =>
        item.readAt === null && lidasLocalmente[item.id]
          ? { ...item, readAt: lidasLocalmente[item.id] }
          : item,
      ),
    [notificacoes, lidasLocalmente],
  );

  const unreadCount = useMemo(
    () => countUnreadNotificacoes(itensNormalizados),
    [itensNormalizados],
  );
  const filtradas = useMemo(
    () => filterNotificacoes(itensNormalizados, filtro),
    [itensNormalizados, filtro],
  );

  async function handleMarcarComoLida(id: string) {
    const agoraIso = new Date().toISOString();
    setLidasLocalmente((atual) => (atual[id] ? atual : { ...atual, [id]: agoraIso }));
    if (onMarcarComoLida) {
      await onMarcarComoLida(id);
    }
  }

  async function handleMarcarTodasComoLidas() {
    if (unreadCount === 0 || marcandoTodas) return;
    setMarcandoTodas(true);
    try {
      const agoraIso = new Date().toISOString();
      setLidasLocalmente((atual) => {
        const proximo: Record<string, string> = { ...atual };
        for (const item of notificacoes) {
          if (item.readAt === null && !proximo[item.id]) {
            proximo[item.id] = agoraIso;
          }
        }
        return proximo;
      });
      if (onMarcarTodasComoLidas) {
        await onMarcarTodasComoLidas();
      }
    } finally {
      setMarcandoTodas(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <NotificacoesHeader
        filtro={filtro}
        onFiltroChange={setFiltro}
        totalCount={itensNormalizados.length}
        unreadCount={unreadCount}
        onMarcarTodasComoLidas={() => void handleMarcarTodasComoLidas()}
        marcandoTodas={marcandoTodas}
        exibirControles={status === "ok"}
      />

      {status === "loading" && <NotificacoesSkeleton />}

      {status === "error" && (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar suas notificações"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={onRetry ?? (() => router.refresh())}
        />
      )}

      {status === "ok" &&
        (itensNormalizados.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação por aqui"
            description="Quando houver atualizações sobre seus ingressos, pedidos ou eventos, elas aparecerão aqui."
            action={{
              label: "Explorar eventos",
              onClick: () => router.push("/eventos"),
            }}
          />
        ) : filtradas.length === 0 && filtro === FILTRO_NAO_LIDAS ? (
          <EmptyState
            icon={CheckCheck}
            title="Você está em dia!"
            description="Você já leu todas as suas notificações recentes."
            action={{
              label: "Ver todas as notificações",
              onClick: () => setFiltro(FILTRO_TODAS_NOTIFICACOES),
            }}
          />
        ) : (
          <ul aria-label="Lista de notificações" className="flex flex-col gap-3">
            {filtradas.map((notificacao) => (
              <li key={notificacao.id}>
                <NotificacaoCard
                  notificacao={notificacao}
                  onMarcarComoLida={(id) => void handleMarcarComoLida(id)}
                />
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyInvites } from "@/lib/api/organization-members";
import type { ConviteOrganizacaoPendente } from "@/types/membro-organizacao";

export type ConvitesStatus = "loading" | "ok" | "error";

interface ConvitesContextType {
  convites: ConviteOrganizacaoPendente[];
  status: ConvitesStatus;
  recarregar: () => Promise<void>;
  tentarNovamente: () => void;
  removerConvite: (orgId: string) => void;
}

const ConvitesContext = createContext<ConvitesContextType | undefined>(undefined);

const ESTADO_VAZIO = { convites: [] as ConviteOrganizacaoPendente[], status: "loading" as ConvitesStatus };

export function ConvitesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [estado, setEstado] = useState(ESTADO_VAZIO);
  const userIdAtual = useRef(userId);

  const [ultimoUserId, setUltimoUserId] = useState(userId);
  if (userId !== ultimoUserId) {
    setUltimoUserId(userId);
    setEstado(ESTADO_VAZIO);
  }

  const recarregar = useCallback(async () => {
    if (!userId) return;
    try {
      const convites = await getMyInvites();
      if (userIdAtual.current !== userId) return;
      setEstado({ convites, status: "ok" });
    } catch {
      if (userIdAtual.current !== userId) return;
      setEstado((atual) => ({ ...atual, status: "error" }));
    }
  }, [userId]);

  useEffect(() => {
    userIdAtual.current = userId;
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recarregar();
  }, [userId, recarregar]);

  const tentarNovamente = useCallback(() => {
    setEstado((atual) => ({ ...atual, status: "loading" }));
    void recarregar();
  }, [recarregar]);

  const removerConvite = useCallback((orgId: string) => {
    setEstado((atual) => ({ ...atual, convites: atual.convites.filter((convite) => convite.orgId !== orgId) }));
  }, []);

  const value = useMemo<ConvitesContextType>(
    () => ({ ...estado, recarregar, tentarNovamente, removerConvite }),
    [estado, recarregar, tentarNovamente, removerConvite],
  );

  return <ConvitesContext.Provider value={value}>{children}</ConvitesContext.Provider>;
}

export function useConvites() {
  const context = useContext(ConvitesContext);
  if (context === undefined) {
    throw new Error("useConvites deve ser usado dentro de um ConvitesProvider");
  }
  return context;
}

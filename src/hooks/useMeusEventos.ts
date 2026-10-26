import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizerEvents, resolveUserOrganizations } from "@/lib/api/events";
import type {
  EventoOrganizador,
  FiltroStatusEvento,
  OrganizacaoVinculada,
} from "@/types/organizacao";

const ACTIVE_ORG_STORAGE_KEY = "hubee:activeOrgId";
const ORG_CHANGE_EVENT = "hubee:active-org-change";

type EventosState =
  | { status: "loading"; data: null }
  | { status: "ok"; data: EventoOrganizador[] }
  | { status: "error"; data: null };

const loadingState: EventosState = { status: "loading", data: null };

function readStoredOrgId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredOrgId(orgId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACTIVE_ORG_STORAGE_KEY, orgId);
  } catch {
    // Ignora bloqueio de storage no navegador
  }
}

function notifyOrgChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ORG_CHANGE_EVENT));
}

export function useOrganizacaoAtiva() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => readStoredOrgId());

  const organizacoes: OrganizacaoVinculada[] = useMemo(
    () => resolveUserOrganizations(user),
    [user],
  );

  useEffect(() => {
    const syncState = () => {
      setSelectedOrgId(readStoredOrgId());
    };
    syncState();
    window.addEventListener(ORG_CHANGE_EVENT, syncState);
    window.addEventListener("popstate", syncState);
    return () => {
      window.removeEventListener(ORG_CHANGE_EVENT, syncState);
      window.removeEventListener("popstate", syncState);
    };
  }, []);

  const organizacaoAtiva: OrganizacaoVinculada | null = useMemo(() => {
    if (organizacoes.length === 0) return null;
    return organizacoes.find((org) => org.orgId === selectedOrgId) ?? organizacoes[0];
  }, [organizacoes, selectedOrgId]);

  const selecionarOrganizacao = useCallback((orgId: string) => {
    writeStoredOrgId(orgId);
    setSelectedOrgId(orgId);
    notifyOrgChange();
  }, []);

  return {
    authLoading,
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao,
  };
}

export function useMeusEventos() {
  const {
    authLoading,
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao: selecionarOrgBase,
  } = useOrganizacaoAtiva();

  const [state, setState] = useState<EventosState>(loadingState);
  const [attempt, setAttempt] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatusEvento>("all");
  const [busca, setBusca] = useState("");

  const activeOrgId = organizacaoAtiva?.orgId ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!activeOrgId) return;

    writeStoredOrgId(activeOrgId);

    let active = true;
    getOrganizerEvents({ organizerId: activeOrgId })
      .then((data) => {
        if (active) setState({ status: "ok", data });
      })
      .catch(() => {
        if (active) setState({ status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, activeOrgId, attempt]);

  const selecionarOrganizacao = useCallback(
    (orgId: string) => {
      selecionarOrgBase(orgId);
      setFiltroStatus("all");
      setBusca("");
      setState(loadingState);
    },
    [selecionarOrgBase],
  );

  const retry = useCallback(() => {
    setState(loadingState);
    setAttempt((value) => value + 1);
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltroStatus("all");
    setBusca("");
  }, []);

  const todosEventos = useMemo(() => state.data ?? [], [state.data]);

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todosEventos.filter((evento) => {
      const bateStatus = filtroStatus === "all" || evento.status === filtroStatus;
      const bateBusca = termo === "" || evento.nome.toLowerCase().includes(termo);
      return bateStatus && bateBusca;
    });
  }, [todosEventos, filtroStatus, busca]);

  const currentStatus = authLoading
    ? ("loading" as const)
    : !activeOrgId
      ? ("ok" as const)
      : state.status;

  return {
    status: currentStatus,
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao,
    todosEventos,
    eventosFiltrados,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    limparFiltros,
    retry,
  };
}

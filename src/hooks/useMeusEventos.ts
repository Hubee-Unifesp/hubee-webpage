import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizerEvents, resolveUserOrganizations } from "@/lib/api/events";
import type {
  EventoOrganizador,
  FiltroStatusEvento,
  OrganizacaoVinculada,
  PapelOrganizador,
} from "@/types/organizacao";

const ACTIVE_ORG_STORAGE_KEY = "hubee:activeOrgId";
const ROLE_OVERRIDE_STORAGE_KEY = "hubee:roleOverride";
const ORG_CHANGE_EVENT = "hubee:active-org-change";

type EventosState =
  | { status: "loading"; data: null }
  | { status: "ok"; data: EventoOrganizador[] }
  | { status: "error"; data: null };

const loadingState: EventosState = { status: "loading", data: null };

function isPapelOrganizador(value: string | null): value is PapelOrganizador {
  return value === "administrador" || value === "membro" || value === "leitura";
}

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

function readRoleOverride(): PapelOrganizador | null {
  if (typeof window === "undefined") return null;
  try {
    const param = new URLSearchParams(window.location.search).get("papel");
    if (isPapelOrganizador(param)) {
      window.sessionStorage.setItem(ROLE_OVERRIDE_STORAGE_KEY, param);
      return param;
    }
    const stored = window.sessionStorage.getItem(ROLE_OVERRIDE_STORAGE_KEY);
    return isPapelOrganizador(stored) ? stored : null;
  } catch {
    return null;
  }
}

function notifyOrgChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ORG_CHANGE_EVENT));
}

export function useOrganizacaoAtiva() {
  const { user, isLoading: authLoading } = useAuth();
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoVinculada[]>([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => readStoredOrgId());
  const [roleOverride, setRoleOverride] = useState<PapelOrganizador | null>(() =>
    readRoleOverride(),
  );

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    resolveUserOrganizations(user)
      .then((resolved) => {
        if (!active) return;
        setOrganizacoes(resolved);
        setOrgsLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setOrganizacoes([]);
        setOrgsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    const syncState = () => {
      setSelectedOrgId(readStoredOrgId());
      setRoleOverride(readRoleOverride());
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
    const base = organizacoes.find((org) => org.orgId === selectedOrgId) ?? organizacoes[0];
    if (!roleOverride) return base;
    return { ...base, papel: roleOverride };
  }, [organizacoes, selectedOrgId, roleOverride]);

  const selecionarOrganizacao = useCallback((orgId: string) => {
    writeStoredOrgId(orgId);
    setSelectedOrgId(orgId);
    notifyOrgChange();
  }, []);

  return {
    authLoading,
    orgsLoaded,
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao,
  };
}

export function useMeusEventos() {
  const {
    authLoading,
    orgsLoaded,
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
    if (authLoading || !orgsLoaded) return;
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
  }, [authLoading, orgsLoaded, activeOrgId, attempt]);

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

  const currentStatus =
    authLoading || !orgsLoaded
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

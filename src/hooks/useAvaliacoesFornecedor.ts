import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calcularResumo,
  filtrarAvaliacoes,
  TODAS_NOTAS,
  type OrdemAvaliacoes,
} from "@/components/conta/fornecedores/avaliacoes/avaliacoes.data";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import {
  createSupplierReview,
  getReviewableEvents,
  getSupplierReviews,
  type EventoAvaliavel,
} from "@/lib/api/supplier-reviews";
import { getSupplierById } from "@/lib/api/suppliers";
import { parseApiError } from "@/lib/api/errors";
import type { AvaliacaoFornecedor, AvaliacaoFornecedorPayload } from "@/types/avaliacao-fornecedor";
import type { Fornecedor } from "@/types/fornecedor";

interface Dados {
  fornecedor: Fornecedor;
  avaliacoes: AvaliacaoFornecedor[];
  eventos: EventoAvaliavel[];
}

type State =
  | { status: "loading"; data: null }
  | { status: "ok"; data: Dados }
  | { status: "not-found"; data: null }
  | { status: "error"; data: null };

const loadingState: State = { status: "loading", data: null };

/** Fornecedor, suas avaliações, resumo, filtros e criação de nova avaliação (GOL-244). */
export function useAvaliacoesFornecedor(supplierId: string) {
  const { user } = useAuth();
  const { authLoading, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<State>(loadingState);
  const [attempt, setAttempt] = useState(0);
  const [nota, setNota] = useState<string>(TODAS_NOTAS);
  const [ordem, setOrdem] = useState<OrdemAvaliacoes>("recentes");

  const orgId = organizacaoAtiva?.orgId ?? null;

  useEffect(() => {
    if (authLoading || !orgId) return;

    let active = true;
    Promise.all([getSupplierById(supplierId), getSupplierReviews(supplierId), getReviewableEvents(orgId)])
      .then(([fornecedor, avaliacoes, eventos]) => {
        if (active) setState({ status: "ok", data: { fornecedor, avaliacoes, eventos } });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const status = parseApiError(error).status;
        setState(status === 404 || status === 400 ? { status: "not-found", data: null } : { status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, orgId, supplierId, attempt]);

  const retry = useCallback(() => {
    setState(loadingState);
    setAttempt((value) => value + 1);
  }, []);

  const avaliacoes = useMemo(() => state.data?.avaliacoes ?? [], [state.data]);
  const resumo = useMemo(() => calcularResumo(avaliacoes), [avaliacoes]);
  const filtradas = useMemo(() => filtrarAvaliacoes(avaliacoes, nota, ordem), [avaliacoes, nota, ordem]);

  const avaliar = useCallback(
    async (payload: AvaliacaoFornecedorPayload): Promise<AvaliacaoFornecedor> => {
      const evento = state.data?.eventos.find((item) => item.id === payload.eventId);
      if (!evento) throw new Error("Evento não encontrado.");
      const nova = await createSupplierReview(supplierId, payload, {
        authorName: user?.fullName ?? "Você",
        evento,
      });
      setState((prev) =>
        prev.status === "ok" ? { status: "ok", data: { ...prev.data, avaliacoes: [nova, ...prev.data.avaliacoes] } } : prev,
      );
      return nova;
    },
    [state.data, supplierId, user?.fullName],
  );

  return {
    status: authLoading ? "loading" : !organizacaoAtiva ? "ok" : state.status,
    organizacaoAtiva,
    fornecedor: state.data?.fornecedor ?? null,
    eventos: state.data?.eventos ?? [],
    avaliacoes,
    filtradas,
    resumo,
    nota,
    setNota,
    ordem,
    setOrdem,
    limparFiltros: () => setNota(TODAS_NOTAS),
    temFiltroAtivo: nota !== TODAS_NOTAS,
    retry,
    avaliar,
  };
}

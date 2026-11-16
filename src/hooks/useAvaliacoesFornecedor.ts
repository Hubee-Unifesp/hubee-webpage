import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calcularResumo,
  filtrarAvaliacoes,
  TODAS_NOTAS,
  type OrdemAvaliacoes,
} from "@/components/conta/fornecedores/avaliacoes/avaliacoes.data";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { createSupplierReview, getSupplierReviews } from "@/lib/api/supplier-reviews";
import { getSupplierById } from "@/lib/api/suppliers";
import { parseApiError } from "@/lib/api/errors";
import type { AvaliacaoFornecedor, AvaliacaoFornecedorPayload } from "@/types/avaliacao-fornecedor";
import type { Fornecedor } from "@/types/fornecedor";

interface Dados {
  fornecedor: Fornecedor;
  avaliacoes: AvaliacaoFornecedor[];
}

type State =
  | { status: "loading"; data: null }
  | { status: "ok"; data: Dados }
  | { status: "not-found"; data: null }
  | { status: "error"; data: null };

const loadingState: State = { status: "loading", data: null };

/** Fornecedor, suas avaliações, resumo, filtros e criação de nova avaliação (GOL-248). */
export function useAvaliacoesFornecedor(supplierId: string) {
  const { authLoading, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<State>(loadingState);
  const [attempt, setAttempt] = useState(0);
  const [nota, setNota] = useState<string>(TODAS_NOTAS);
  const [ordem, setOrdem] = useState<OrdemAvaliacoes>("recentes");

  const orgId = organizacaoAtiva?.orgId ?? null;

  useEffect(() => {
    if (authLoading || !orgId) return;

    let active = true;
    Promise.all([getSupplierById(supplierId), getSupplierReviews(supplierId)])
      .then(([fornecedor, avaliacoes]) => {
        if (active) setState({ status: "ok", data: { fornecedor, avaliacoes } });
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
      const nova = await createSupplierReview(supplierId, payload);
      // Refaz a busca para refletir a lista (upsert por usuário) e a nota/contagem do fornecedor.
      const [fornecedor, atualizadas] = await Promise.all([
        getSupplierById(supplierId),
        getSupplierReviews(supplierId),
      ]);
      setState((prev) =>
        prev.status === "ok" ? { status: "ok", data: { fornecedor, avaliacoes: atualizadas } } : prev,
      );
      return nova;
    },
    [supplierId],
  );

  return {
    status: authLoading ? "loading" : !organizacaoAtiva ? "ok" : state.status,
    organizacaoAtiva,
    fornecedor: state.data?.fornecedor ?? null,
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

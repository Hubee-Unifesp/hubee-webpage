import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterFornecedores,
  getCategorias,
  TODAS_CATEGORIAS,
} from "@/components/conta/fornecedores/fornecedores.data";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import {
  createSupplier,
  deleteSupplier,
  FornecedorDuplicadoError,
  getSuppliers,
  updateSupplier,
} from "@/lib/api/suppliers";
import { getSuppliersRating } from "@/lib/api/supplier-reviews";
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";

export { FornecedorDuplicadoError };

/** Média e total de avaliações de cada fornecedor, pelo id. */
export type AvaliacoesPorFornecedor = Record<string, { media: number; total: number }>;

type FornecedoresState =
  | { status: "loading"; data: null }
  | { status: "ok"; data: Fornecedor[] }
  | { status: "error"; data: null };

const loadingState: FornecedoresState = { status: "loading", data: null };

/**
 * Lista de fornecedores com busca, filtro por categoria e cadastro, edição e exclusão
 * integrada aos endpoints `/suppliers` da `hubee-api` (GOL-204).
 */
export function useFornecedores() {
  const { authLoading, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<FornecedoresState>(loadingState);
  const [attempt, setAttempt] = useState(0);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS_CATEGORIAS);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacoesPorFornecedor>({});

  const temOrganizacao = organizacaoAtiva !== null;

  useEffect(() => {
    if (authLoading || !temOrganizacao) return;

    let active = true;
    getSuppliers()
      .then((data) => {
        if (!active) return;
        setState({ status: "ok", data });
        // Média das avaliações (GOL-244): carregada depois, sem atrasar a listagem.
        getSuppliersRating(data.map((item) => item.id))
          .then((ratings) => {
            if (active) setAvaliacoes(ratings);
          })
          .catch(() => undefined);
      })
      .catch(() => {
        if (active) setState({ status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, temOrganizacao, attempt]);

  const retry = useCallback(() => {
    setState(loadingState);
    setAttempt((value) => value + 1);
  }, []);

  const todos = useMemo(() => state.data ?? [], [state.data]);
  const categorias = useMemo(() => getCategorias(todos), [todos]);
  const categoriaAtiva =
    categoria !== TODAS_CATEGORIAS && !categorias.includes(categoria)
      ? TODAS_CATEGORIAS
      : categoria;
  const filtrados = useMemo(
    () => filterFornecedores(todos, busca, categoriaAtiva),
    [todos, busca, categoriaAtiva],
  );

  const limparFiltros = useCallback(() => {
    setBusca("");
    setCategoria(TODAS_CATEGORIAS);
  }, []);

  /** @throws {FornecedorDuplicadoError} quando o CNPJ/CPF ou o e-mail já estão cadastrados. */
  const criar = useCallback(async (payload: FornecedorPayload): Promise<Fornecedor> => {
    const novo = await createSupplier(payload);
    setState((prev) => ({ status: "ok", data: [novo, ...(prev.data ?? [])] }));
    return novo;
  }, []);

  /** @throws {FornecedorDuplicadoError} quando o CNPJ/CPF ou o e-mail pertencem a outro fornecedor. */
  const atualizar = useCallback(
    async (id: string, payload: FornecedorPayload): Promise<Fornecedor> => {
      const atualizado = await updateSupplier(id, {
        companyName: payload.companyName,
        cnpjCpf: payload.cnpjCpf,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        category: payload.category ?? null,
      });
      setState((prev) => ({
        status: "ok",
        data: (prev.data ?? []).map((item) => (item.id === id ? atualizado : item)),
      }));
      return atualizado;
    },
    [],
  );

  const excluir = useCallback(async (id: string): Promise<void> => {
    await deleteSupplier(id);
    setState((prev) => ({
      status: "ok",
      data: (prev.data ?? []).filter((item) => item.id !== id),
    }));
  }, []);

  const status = authLoading ? "loading" : !temOrganizacao ? "ok" : state.status;

  return {
    status,
    organizacaoAtiva,
    todos,
    filtrados,
    avaliacoes,
    categorias,
    busca,
    setBusca,
    categoria: categoriaAtiva,
    setCategoria,
    limparFiltros,
    temFiltroAtivo: busca.trim() !== "" || categoriaAtiva !== TODAS_CATEGORIAS,
    retry,
    criar,
    atualizar,
    excluir,
  };
}

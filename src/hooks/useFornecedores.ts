import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterFornecedores,
  type FiltroAvaliacaoMinima,
  getCategorias,
  ORDENACAO_PADRAO,
  type OrdenacaoFornecedores,
  TODAS_AVALIACOES,
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
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";

export { FornecedorDuplicadoError };

type FornecedoresState =
  | { status: "loading"; data: null }
  | { status: "ok"; data: Fornecedor[] }
  | { status: "error"; data: null };

const loadingState: FornecedoresState = { status: "loading", data: null };

/**
 * Lista de fornecedores com busca, filtro por categoria/avaliação mínima, ordenação
 * e cadastro, edição e exclusão integrada aos endpoints `/suppliers` da `hubee-api` (GOL-204 / GOL-249).
 */
export function useFornecedores() {
  const { authLoading, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<FornecedoresState>(loadingState);
  const [attempt, setAttempt] = useState(0);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS_CATEGORIAS);
  const [avaliacaoMinima, setAvaliacaoMinima] = useState<FiltroAvaliacaoMinima>(TODAS_AVALIACOES);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoFornecedores>(ORDENACAO_PADRAO);

  const temOrganizacao = organizacaoAtiva !== null;

  useEffect(() => {
    if (authLoading || !temOrganizacao) return;

    let active = true;
    getSuppliers()
      .then((data) => {
        if (active) setState({ status: "ok", data });
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
    () => filterFornecedores(todos, busca, categoriaAtiva, avaliacaoMinima, ordenacao),
    [todos, busca, categoriaAtiva, avaliacaoMinima, ordenacao],
  );

  const limparFiltros = useCallback(() => {
    setBusca("");
    setCategoria(TODAS_CATEGORIAS);
    setAvaliacaoMinima(TODAS_AVALIACOES);
    setOrdenacao(ORDENACAO_PADRAO);
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
        data: (prev.data ?? []).map((item) => (item.id === id ? { ...item, ...atualizado } : item)),
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
    categorias,
    busca,
    setBusca,
    categoria: categoriaAtiva,
    setCategoria,
    avaliacaoMinima,
    setAvaliacaoMinima,
    ordenacao,
    setOrdenacao,
    limparFiltros,
    temFiltroAtivo:
      busca.trim() !== "" ||
      categoriaAtiva !== TODAS_CATEGORIAS ||
      avaliacaoMinima !== TODAS_AVALIACOES,
    retry,
    criar,
    atualizar,
    excluir,
  };
}

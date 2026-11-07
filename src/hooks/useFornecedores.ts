import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterFornecedores,
  fornecedoresMock,
  getCategorias,
  TODAS_CATEGORIAS,
} from "@/components/conta/fornecedores/fornecedores.data";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import type { Fornecedor } from "@/types/fornecedor";

/** Atraso simulado para o skeleton aparecer enquanto não há integração com a API. */
const MOCK_DELAY_MS = 600;

type FornecedoresState = { status: "loading"; data: null } | { status: "ok"; data: Fornecedor[] };

/**
 * Lista de fornecedores com busca e filtro por categoria.
 * Por enquanto usa dados em memória (`fornecedoresMock`); a integração troca só o carregamento.
 */
export function useFornecedores() {
  const { authLoading, organizacoes, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<FornecedoresState>({ status: "loading", data: null });
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>(TODAS_CATEGORIAS);

  const temOrganizacao = organizacaoAtiva !== null;

  useEffect(() => {
    if (authLoading || !temOrganizacao) return;
    const timer = window.setTimeout(() => {
      setState({ status: "ok", data: [...fornecedoresMock] });
    }, MOCK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [authLoading, temOrganizacao]);

  const todos = useMemo(() => state.data ?? [], [state.data]);
  const categorias = useMemo(() => getCategorias(todos), [todos]);
  const filtrados = useMemo(() => filterFornecedores(todos, busca, categoria), [todos, busca, categoria]);

  const limparFiltros = useCallback(() => {
    setBusca("");
    setCategoria(TODAS_CATEGORIAS);
  }, []);

  const status = authLoading ? "loading" : !temOrganizacao ? "ok" : state.status;

  return {
    status,
    organizacoes,
    organizacaoAtiva,
    todos,
    filtrados,
    categorias,
    busca,
    setBusca,
    categoria,
    setCategoria,
    limparFiltros,
    temFiltroAtivo: busca.trim() !== "" || categoria !== TODAS_CATEGORIAS,
  };
}

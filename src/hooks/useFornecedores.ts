import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterFornecedores,
  fornecedoresMock,
  getCategorias,
  TODAS_CATEGORIAS,
} from "@/components/conta/fornecedores/fornecedores.data";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";

/** Atrasos simulados para o skeleton e o estado "salvando" aparecerem enquanto não há integração com a API. */
const MOCK_LOAD_DELAY_MS = 600;
const MOCK_SAVE_DELAY_MS = 700;

type FornecedoresState = { status: "loading"; data: null } | { status: "ok"; data: Fornecedor[] };

/** Equivalente ao 409 da `hubee-api`: já existe fornecedor com o mesmo CNPJ/CPF ou e-mail. */
export class FornecedorDuplicadoError extends Error {
  constructor() {
    super("Já existe um fornecedor com este CNPJ/CPF ou E-mail.");
    this.name = "FornecedorDuplicadoError";
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function isDuplicado(lista: readonly Fornecedor[], payload: FornecedorPayload, ignorarId?: string) {
  const email = payload.email?.toLowerCase();
  return lista.some(
    (item) =>
      item.id !== ignorarId &&
      (item.cnpjCpf === payload.cnpjCpf || (email !== undefined && item.email?.toLowerCase() === email)),
  );
}

function aplicarPayload(base: Fornecedor, payload: FornecedorPayload, agora: string): Fornecedor {
  return {
    ...base,
    companyName: payload.companyName,
    cnpjCpf: payload.cnpjCpf,
    phone: payload.phone ?? null,
    email: payload.email ?? null,
    category: payload.category ?? null,
    updatedAt: agora,
  };
}

/**
 * Lista de fornecedores com busca, filtro por categoria e cadastro, edição e exclusão.
 * Por enquanto usa dados em memória (`fornecedoresMock`); a integração troca só o miolo das funções.
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
    }, MOCK_LOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [authLoading, temOrganizacao]);

  const todos = useMemo(() => state.data ?? [], [state.data]);
  const categorias = useMemo(() => getCategorias(todos), [todos]);
  const filtrados = useMemo(() => filterFornecedores(todos, busca, categoria), [todos, busca, categoria]);

  const limparFiltros = useCallback(() => {
    setBusca("");
    setCategoria(TODAS_CATEGORIAS);
  }, []);

  /** @throws {FornecedorDuplicadoError} quando o CNPJ/CPF ou o e-mail já estão cadastrados. */
  const criar = useCallback(
    async (payload: FornecedorPayload): Promise<Fornecedor> => {
      await wait(MOCK_SAVE_DELAY_MS);
      if (isDuplicado(todos, payload)) throw new FornecedorDuplicadoError();
      const agora = new Date().toISOString();
      const base: Fornecedor = {
        id: crypto.randomUUID(),
        companyName: "",
        cnpjCpf: "",
        phone: null,
        email: null,
        category: null,
        createdAt: agora,
        updatedAt: agora,
      };
      const novo = aplicarPayload(base, payload, agora);
      setState({ status: "ok", data: [novo, ...todos] });
      return novo;
    },
    [todos],
  );

  /** @throws {FornecedorDuplicadoError} quando o CNPJ/CPF ou o e-mail pertencem a outro fornecedor. */
  const atualizar = useCallback(
    async (id: string, payload: FornecedorPayload): Promise<Fornecedor> => {
      await wait(MOCK_SAVE_DELAY_MS);
      const atual = todos.find((item) => item.id === id);
      if (!atual) throw new Error("Fornecedor não encontrado.");
      if (isDuplicado(todos, payload, id)) throw new FornecedorDuplicadoError();
      const atualizado = aplicarPayload(atual, payload, new Date().toISOString());
      setState({ status: "ok", data: todos.map((item) => (item.id === id ? atualizado : item)) });
      return atualizado;
    },
    [todos],
  );

  const excluir = useCallback(
    async (id: string): Promise<void> => {
      await wait(MOCK_SAVE_DELAY_MS);
      setState({ status: "ok", data: todos.filter((item) => item.id !== id) });
    },
    [todos],
  );

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
    criar,
    atualizar,
    excluir,
  };
}

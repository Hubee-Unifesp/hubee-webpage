import { useCallback, useEffect, useState } from "react";
import { parseApiError } from "@/lib/api/errors";
import { getMyOrders, getPedido } from "@/lib/api/orders";
import type { Pedido } from "@/types/pedido";

type State<T> =
  | { status: "loading"; data: null; notFound: false }
  | { status: "ok"; data: T; notFound: false }
  | { status: "error"; data: null; notFound: boolean };

const loading = { status: "loading", data: null, notFound: false } as const;

export function usePedidos() {
  const [state, setState] = useState<State<Pedido[]>>(loading);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((data) => active && setState({ status: "ok", data, notFound: false }))
      .catch(() => active && setState({ status: "error", data: null, notFound: false }));
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState(loading);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}

export function usePedido(id: string) {
  const [state, setState] = useState<State<Pedido>>(loading);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getPedido(id)
      .then((data) => active && setState({ status: "ok", data, notFound: false }))
      .catch((error) => {
        // 404 (não existe) e 400 (id que nem é um UUID) são "pedido não encontrado", não falha de rede.
        const status = parseApiError(error).status;
        if (active) setState({ status: "error", data: null, notFound: status === 404 || status === 400 });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  const retry = useCallback(() => {
    setState(loading);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}

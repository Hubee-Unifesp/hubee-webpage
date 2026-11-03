import { useCallback, useEffect, useState } from "react";
import { getMeusIngressos } from "@/lib/api/tickets";
import type { MeusIngressos } from "@/types/ingresso";

type State =
  | { status: "loading"; data: null }
  | { status: "ok"; data: MeusIngressos }
  | { status: "error"; data: null };

export function useMeusIngressos() {
  const [state, setState] = useState<State>({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getMeusIngressos()
      .then((data) => active && setState({ status: "ok", data }))
      .catch(() => active && setState({ status: "error", data: null }));
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading", data: null });
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}

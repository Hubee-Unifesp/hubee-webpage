import { useCallback, useEffect, useState } from "react";
import { getHomeEvents, type HomeEvents } from "@/lib/api/events";

type State =
  | { status: "loading"; data: null }
  | { status: "ok"; data: HomeEvents }
  | { status: "error"; data: null };

export function useHomeEvents() {
  const [state, setState] = useState<State>({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getHomeEvents()
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

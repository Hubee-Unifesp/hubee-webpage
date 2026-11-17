import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage, parseApiError } from "@/lib/api/errors";
import {
  cancelarEvento,
  createEvento,
  getEventoEditavel,
  publicarEvento,
  updateEvento,
  uploadCapaEvento,
} from "@/lib/api/organizer-events";
import { createLote, deleteLote, updateLote } from "@/lib/api/ticket-types";
import { createLocal, getLocais } from "@/lib/api/venues";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import type { EventoEditavel, EventoPayload, LocalEvento, LocalPayload } from "@/types/evento-editor";
import type { LotePayload } from "@/types/lote-ingresso";

type EditorState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ok"; evento: EventoEditavel | null; locais: LocalEvento[] };

const loadingState: EditorState = { status: "loading" };

export interface ResultadoSalvarDados {
  evento: EventoEditavel;
  /** Preenchido quando os dados foram salvos, mas o envio da capa falhou. */
  erroCapa: string | null;
}

export function useEventoEditor(eventoId?: string) {
  const { authLoading, organizacoes, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<EditorState>(loadingState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ativo = true;
    Promise.all([eventoId ? getEventoEditavel(eventoId) : Promise.resolve(null), getLocais()])
      .then(([evento, locais]) => {
        if (ativo) setState({ status: "ok", evento, locais });
      })
      .catch((error: unknown) => {
        if (ativo) setState({ status: parseApiError(error).status === 404 ? "not-found" : "error" });
      });
    return () => {
      ativo = false;
    };
  }, [eventoId, attempt]);

  const evento = state.status === "ok" ? state.evento : null;
  const locais = useMemo(() => (state.status === "ok" ? state.locais : []), [state]);
  const local = useMemo(
    () => (evento ? (locais.find((item) => item.id === evento.venueId) ?? null) : null),
    [evento, locais],
  );

  const atualizarEvento = useCallback((proximo: EventoEditavel) => {
    setState((atual) => (atual.status === "ok" ? { ...atual, evento: proximo } : atual));
  }, []);

  const retry = useCallback(() => {
    setState(loadingState);
    setAttempt((valor) => valor + 1);
  }, []);

  const criarLocal = useCallback(async (payload: LocalPayload): Promise<LocalEvento> => {
    const novo = await createLocal(payload);
    setState((atual) => (atual.status === "ok" ? { ...atual, locais: [...atual.locais, novo] } : atual));
    return novo;
  }, []);

  /**
   * O evento salvo entra no estado antes do upload da capa: se o upload falhar, uma nova tentativa
   * edita o mesmo rascunho em vez de criar outro.
   */
  const salvarDados = useCallback(
    async (payload: EventoPayload, capa: File | null): Promise<ResultadoSalvarDados> => {
      const { organizerId, ...alteracoes } = payload;
      let salvo = evento
        ? await updateEvento(evento.id, alteracoes, evento.lotes)
        : await createEvento({ ...alteracoes, organizerId });
      atualizarEvento(salvo);

      if (!capa) return { evento: salvo, erroCapa: null };
      try {
        salvo = await uploadCapaEvento(salvo.id, capa, salvo.lotes);
        atualizarEvento(salvo);
        return { evento: salvo, erroCapa: null };
      } catch (error) {
        return {
          evento: salvo,
          erroCapa: getApiErrorMessage(error, "Não foi possível enviar a capa. Tente novamente."),
        };
      }
    },
    [evento, atualizarEvento],
  );

  const publicar = useCallback(async () => {
    if (!evento) throw new Error("Evento não carregado.");
    atualizarEvento(await publicarEvento(evento.id, evento.lotes));
  }, [evento, atualizarEvento]);

  const cancelar = useCallback(async () => {
    if (!evento) throw new Error("Evento não carregado.");
    await cancelarEvento(evento.id);
    atualizarEvento({ ...evento, status: "cancelled" });
  }, [evento, atualizarEvento]);

  // Os lotes vivem em `evento.lotes`: é de lá que o painel, a Revisão e a checagem de capacidade leem.
  const criarLote = useCallback(
    async (payload: LotePayload) => {
      if (!evento) throw new Error("Evento não carregado.");
      const lote = await createLote(evento.id, payload);
      atualizarEvento({ ...evento, lotes: [...evento.lotes, lote] });
    },
    [evento, atualizarEvento],
  );

  const editarLote = useCallback(
    async (loteId: string, payload: LotePayload) => {
      if (!evento) throw new Error("Evento não carregado.");
      const lote = await updateLote(evento.id, loteId, payload);
      atualizarEvento({ ...evento, lotes: evento.lotes.map((item) => (item.id === loteId ? lote : item)) });
    },
    [evento, atualizarEvento],
  );

  const excluirLote = useCallback(
    async (loteId: string) => {
      if (!evento) throw new Error("Evento não carregado.");
      await deleteLote(evento.id, loteId);
      atualizarEvento({ ...evento, lotes: evento.lotes.filter((item) => item.id !== loteId) });
    },
    [evento, atualizarEvento],
  );

  const deOutraOrganizacao =
    evento !== null && organizacaoAtiva !== null && evento.organizerId !== organizacaoAtiva.orgId;

  const status = authLoading ? "loading" : deOutraOrganizacao ? "not-found" : state.status;

  return {
    status,
    organizacoes,
    organizacaoAtiva,
    evento,
    local,
    locais,
    retry,
    criarLocal,
    salvarDados,
    publicar,
    cancelar,
    criarLote,
    editarLote,
    excluirLote,
  };
}

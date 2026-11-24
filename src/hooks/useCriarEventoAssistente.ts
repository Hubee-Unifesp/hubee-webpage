"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { salvarLotesSugeridos } from "@/lib/lotes-sugeridos";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AssistantDraft, AssistantTicketType } from "@/lib/api/event-ai-assistant.types";
import { createEvento } from "@/lib/api/organizer-events";
import { createLote } from "@/lib/api/ticket-types";
import { createLocal, getLocaisComEndereco, type LocalComEndereco } from "@/lib/api/venues";
import {
  encontrarLocal,
  montarPayloadEvento,
  rascunhoProntoParaCriar,
  separarLotes,
  valoresIniciaisDoLocal,
} from "@/lib/assistente-evento-criacao";
import type { LocalPayload } from "@/types/evento-editor";
import type { LotePayload } from "@/types/lote-ingresso";

export interface EventoCriado {
  eventoId: string;
  lotesCriados: number;
  lotesPendentes: number;
}

export type CriarEventoDeps = {
  criarEvento: typeof createEvento;
  criarLote: typeof createLote;
  criarLocal: typeof createLocal;
  listarLocais: typeof getLocaisComEndereco;
};

const depsPadrao: CriarEventoDeps = {
  criarEvento: createEvento,
  criarLote: createLote,
  criarLocal: createLocal,
  listarLocais: getLocaisComEndereco,
};

function paraSugestao(lote: LotePayload): AssistantTicketType {
  return { batch: lote.batch, price: lote.price, quantity: lote.quantity, modality: lote.modality };
}

export function useCriarEventoAssistente(
  draft: AssistantDraft | null,
  onCriado: (resultado: EventoCriado) => void,
  deps: CriarEventoDeps = depsPadrao,
) {
  const { organizacaoAtiva } = useOrganizacaoAtiva();
  const [locais, setLocais] = useState<LocalComEndereco[] | null>(null);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalLocalAberto, setModalLocalAberto] = useState(false);
  const eventoCriadoRef = useRef<string | null>(null);
  const { listarLocais } = deps;

  useEffect(() => {
    let ativo = true;
    listarLocais()
      .then((lista) => {
        if (ativo) setLocais(lista);
      })
      .catch(() => {
        if (ativo) setLocais([]);
      });
    return () => {
      ativo = false;
    };
  }, [listarLocais]);

  const venue = draft?.venue ?? null;
  const localExistente = useMemo(() => encontrarLocal(venue, locais ?? []), [venue, locais]);
  const valoresLocal = useMemo(() => valoresIniciaisDoLocal(venue), [venue]);

  const criarComLocal = useCallback(
    async (venueId: string) => {
      if (!draft || !organizacaoAtiva || eventoCriadoRef.current) return;
      setCriando(true);
      setErro(null);
      try {
        const evento = await deps.criarEvento(montarPayloadEvento(draft, organizacaoAtiva.orgId, venueId));
        eventoCriadoRef.current = evento.id;

        const { completos, incompletos } = separarLotes(draft);
        const pendentes: AssistantTicketType[] = [...incompletos];
        let lotesCriados = 0;
        for (const lote of completos) {
          try {
            await deps.criarLote(evento.id, lote);
            lotesCriados += 1;
          } catch {
            pendentes.push(paraSugestao(lote));
          }
        }
        salvarLotesSugeridos(evento.id, pendentes);
        onCriado({ eventoId: evento.id, lotesCriados, lotesPendentes: pendentes.length });
      } catch (error) {
        setErro(getApiErrorMessage(error, "Não foi possível criar o evento. Tente novamente."));
        setCriando(false);
      }
    },
    [deps, draft, organizacaoAtiva, onCriado],
  );

  const criar = useCallback(() => {
    if (criando || locais === null) return;
    if (localExistente) void criarComLocal(localExistente.id);
    else setModalLocalAberto(true);
  }, [criando, locais, localExistente, criarComLocal]);

  const cadastrarLocal = useCallback(
    async (payload: LocalPayload): Promise<boolean> => {
      try {
        const novo = await deps.criarLocal(payload);
        setLocais((atuais) => [...(atuais ?? []), { ...novo, rua: null, numero: null, cidade: null, uf: null }]);
        setModalLocalAberto(false);
        await criarComLocal(novo.id);
        return true;
      } catch (error) {
        setErro(getApiErrorMessage(error, "Não foi possível cadastrar o local. Revise os dados e tente novamente."));
        return false;
      }
    },
    [deps, criarComLocal],
  );

  return {
    organizacaoAtiva,
    pronto: rascunhoProntoParaCriar(draft) && organizacaoAtiva !== null,
    carregandoLocais: locais === null,
    localExistente,
    valoresLocal,
    criando,
    erro,
    modalLocalAberto,
    setModalLocalAberto,
    criar,
    cadastrarLocal,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { getAssistantErrorMessage, sendAssistantTurn } from "@/lib/api/event-ai-assistant";
import type { AssistantTurnRequest, AssistantTurnResponse } from "@/lib/api/event-ai-assistant.types";
import {
  ASSISTENTE_STORAGE_KEY,
  aplicarRodada,
  conversaInicial,
  lerConversaSalva,
  montarRequisicao,
  registrarEnvio,
  type ConversaAssistente,
  type EnvioAssistente,
} from "@/lib/assistente-evento";

export type EnviarRodada = (request: AssistantTurnRequest) => Promise<AssistantTurnResponse>;

export function useAssistenteEvento(enviarRodada: EnviarRodada = sendAssistantTurn) {
  const [conversa, setConversa] = useState<ConversaAssistente>(conversaInicial);
  const [carregado, setCarregado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [falhou, setFalhou] = useState<EnvioAssistente | null>(null);

  useEffect(() => {
    const salva = lerConversaSalva(window.sessionStorage.getItem(ASSISTENTE_STORAGE_KEY));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da conversa salva
    if (salva) setConversa(salva);
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.sessionStorage.setItem(ASSISTENTE_STORAGE_KEY, JSON.stringify(conversa));
    } catch {
      return;
    }
  }, [conversa, carregado]);

  const processar = useCallback(
    async (base: ConversaAssistente, envio: EnvioAssistente) => {
      setEnviando(true);
      setErro(null);
      setFalhou(null);
      try {
        const resposta = await enviarRodada(montarRequisicao(base, envio));
        setConversa((atual) => aplicarRodada(atual, resposta));
      } catch (error) {
        setErro(getAssistantErrorMessage(error));
        setFalhou(envio);
      } finally {
        setEnviando(false);
      }
    },
    [enviarRodada],
  );

  const enviar = useCallback(
    (envio: EnvioAssistente) => {
      if (enviando) return;
      if (envio.tipo === "resposta" && envio.texto.trim() === "") return;
      setConversa((atual) => registrarEnvio(atual, envio));
      void processar(conversa, envio);
    },
    [conversa, enviando, processar],
  );

  const tentarDeNovo = useCallback(() => {
    if (!falhou || enviando) return;
    void processar(conversa, falhou);
  }, [conversa, enviando, falhou, processar]);

  const recomecar = useCallback(() => {
    if (enviando) return;
    setConversa(conversaInicial());
    setErro(null);
    setFalhou(null);
  }, [enviando]);

  return { conversa, carregado, enviando, erro, podeTentarDeNovo: falhou !== null, enviar, tentarDeNovo, recomecar };
}

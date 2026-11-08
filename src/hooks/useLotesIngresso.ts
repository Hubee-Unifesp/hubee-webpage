import { useCallback, useState } from "react";
import { adaptarLote } from "@/components/conta/eventos/lotes/lotes.data";
import { aplicarEdicao, novoLote, obterLotes, salvarLotes } from "@/components/conta/eventos/lotes/lotes.store";
import type { EventoEditavel } from "@/types/evento-editor";
import type { LoteIngresso, LotePayload } from "@/types/lote-ingresso";

/** Lotes do evento com criar, editar e excluir. Hoje em memória; a integração com a API é da Task 6. */
export function useLotesIngresso(evento: EventoEditavel) {
  const eventoId = evento.id;
  const [lotes, setLotes] = useState<LoteIngresso[]>(() =>
    obterLotes(eventoId, () => evento.lotes.map(adaptarLote)),
  );

  const aplicar = useCallback(
    (alterar: (atuais: LoteIngresso[]) => LoteIngresso[]) => {
      setLotes((atuais) => {
        const proximos = alterar(atuais);
        salvarLotes(eventoId, proximos);
        return proximos;
      });
    },
    [eventoId],
  );

  const criar = useCallback(
    async (payload: LotePayload) => {
      aplicar((atuais) => [...atuais, novoLote(payload)]);
    },
    [aplicar],
  );

  const editar = useCallback(
    async (id: string, payload: LotePayload) => {
      aplicar((atuais) => atuais.map((lote) => (lote.id === id ? aplicarEdicao(lote, payload) : lote)));
    },
    [aplicar],
  );

  const excluir = useCallback(
    async (id: string) => {
      aplicar((atuais) => atuais.filter((lote) => lote.id !== id));
    },
    [aplicar],
  );

  return { lotes, criar, editar, excluir };
}

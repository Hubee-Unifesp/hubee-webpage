import { useCallback, useEffect, useState } from "react";
import { createParcela, deleteParcela, getParcelas, updateParcela } from "@/lib/api/planning";
import type { ParcelaDespesa, ParcelaPayload } from "@/types/planejamento";

type EstadoCronograma =
  | { status: "carregando" | "erro"; parcelas: ParcelaDespesa[] }
  | { status: "pronto"; parcelas: ParcelaDespesa[] };

export function useCronogramaPagamentos(eventoId: string) {
  const [estado, setEstado] = useState<EstadoCronograma>({ status: "carregando", parcelas: [] });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- volta ao carregando ao tentar de novo
    setEstado({ status: "carregando", parcelas: [] });
    getParcelas(eventoId)
      .then((parcelas) => {
        if (ativo) setEstado({ status: "pronto", parcelas });
      })
      .catch(() => {
        if (ativo) setEstado({ status: "erro", parcelas: [] });
      });
    return () => {
      ativo = false;
    };
  }, [eventoId, tentativa]);

  const tentarDeNovo = useCallback(() => setTentativa((valor) => valor + 1), []);

  const atualizar = useCallback((mudar: (parcelas: ParcelaDespesa[]) => ParcelaDespesa[]) => {
    setEstado((atual) => ({ ...atual, parcelas: mudar(atual.parcelas) }));
  }, []);

  const criarParcela = useCallback(
    async (despesaId: string, payload: ParcelaPayload) => {
      const criada = await createParcela(eventoId, despesaId, payload);
      atualizar((parcelas) => [...parcelas, criada]);
    },
    [eventoId, atualizar],
  );

  const editarParcela = useCallback(
    async (parcela: ParcelaDespesa, payload: Partial<ParcelaPayload>) => {
      const atualizada = await updateParcela(eventoId, parcela.expenseId, parcela.id, payload);
      atualizar((parcelas) => parcelas.map((item) => (item.id === atualizada.id ? atualizada : item)));
    },
    [eventoId, atualizar],
  );

  const excluirParcela = useCallback(
    async (parcela: ParcelaDespesa) => {
      await deleteParcela(eventoId, parcela.expenseId, parcela.id);
      atualizar((parcelas) => parcelas.filter((item) => item.id !== parcela.id));
    },
    [eventoId, atualizar],
  );

  return { status: estado.status, parcelas: estado.parcelas, tentarDeNovo, criarParcela, editarParcela, excluirParcela };
}

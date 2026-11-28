import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calcularIndicadores,
  segmentosDeLotes,
  totalizarDespesas,
} from "@/components/conta/eventos/planejamento/planejamento.data";
import { parseApiError } from "@/lib/api/errors";
import {
  createDespesa,
  deleteDespesa,
  getDespesas,
  getPlanejamentoEvento,
  updateDespesa,
  updatePublicoEsperado,
} from "@/lib/api/planning";
import { getSuppliers } from "@/lib/api/suppliers";
import type {
  DespesaPlanejamento,
  DespesaPlanejamentoPayload,
  EventoPlanejamento,
  FornecedorPlanejamento,
  LotePlanejamento,
} from "@/types/planejamento";

export type StatusPlanejamento = "carregando" | "pronto" | "erro" | "sem-acesso";

interface DadosPlanejamento {
  evento: EventoPlanejamento;
  lotes: LotePlanejamento[];
  despesas: DespesaPlanejamento[];
  fornecedores: FornecedorPlanejamento[];
}

type EstadoPlanejamento =
  | { status: "carregando" | "erro" | "sem-acesso"; dados: null }
  | { status: "pronto"; dados: DadosPlanejamento };

const carregando: EstadoPlanejamento = { status: "carregando", dados: null };

async function carregarFornecedores(): Promise<FornecedorPlanejamento[]> {
  try {
    const fornecedores = await getSuppliers({ sortBy: "companyName" });
    return fornecedores.map((fornecedor) => ({
      id: fornecedor.id,
      companyName: fornecedor.companyName,
      category: fornecedor.category ?? null,
    }));
  } catch {
    return [];
  }
}

export function usePlanejamentoEvento(eventoId: string) {
  const [estado, setEstado] = useState<EstadoPlanejamento>(carregando);
  const [tentativa, setTentativa] = useState(0);
  const [publicoSimulado, setPublicoSimulado] = useState(0);

  useEffect(() => {
    let ativo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- volta ao carregando ao tentar de novo
    setEstado(carregando);

    Promise.all([getPlanejamentoEvento(eventoId), getDespesas(eventoId), carregarFornecedores()])
      .then(([{ evento, lotes }, despesas, fornecedores]) => {
        if (!ativo) return;
        setEstado({ status: "pronto", dados: { evento, lotes, despesas, fornecedores } });
        setPublicoSimulado(evento.expectedAudience ?? 0);
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        const { status } = parseApiError(error);
        setEstado({ status: status === 403 || status === 404 ? "sem-acesso" : "erro", dados: null });
      });

    return () => {
      ativo = false;
    };
  }, [eventoId, tentativa]);

  const tentarDeNovo = useCallback(() => setTentativa((valor) => valor + 1), []);

  const atualizarDespesas = useCallback((atualizar: (despesas: DespesaPlanejamento[]) => DespesaPlanejamento[]) => {
    setEstado((atual) =>
      atual.status === "pronto" ? { ...atual, dados: { ...atual.dados, despesas: atualizar(atual.dados.despesas) } } : atual,
    );
  }, []);

  const substituir = useCallback(
    (despesa: DespesaPlanejamento) =>
      atualizarDespesas((despesas) => despesas.map((item) => (item.id === despesa.id ? despesa : item))),
    [atualizarDespesas],
  );

  const criarDespesa = useCallback(
    async (payload: DespesaPlanejamentoPayload) => {
      const criada = await createDespesa(eventoId, payload);
      atualizarDespesas((despesas) => [...despesas, criada]);
    },
    [eventoId, atualizarDespesas],
  );

  const editarDespesa = useCallback(
    async (id: string, payload: DespesaPlanejamentoPayload) => {
      substituir(await updateDespesa(eventoId, id, payload));
    },
    [eventoId, substituir],
  );

  const excluirDespesa = useCallback(
    async (id: string) => {
      await deleteDespesa(eventoId, id);
      atualizarDespesas((despesas) => despesas.filter((item) => item.id !== id));
    },
    [eventoId, atualizarDespesas],
  );

  const alterarNaLinha = useCallback(
    async (despesa: DespesaPlanejamento, mudanca: Pick<DespesaPlanejamentoPayload, "quoted"> | Pick<DespesaPlanejamentoPayload, "paymentStatus">) => {
      substituir({ ...despesa, ...mudanca });
      try {
        substituir(await updateDespesa(eventoId, despesa.id, mudanca));
      } catch (error) {
        substituir(despesa);
        throw error;
      }
    },
    [eventoId, substituir],
  );

  const definirPublicoEsperado = useCallback(
    async (expectedAudience: number) => {
      await updatePublicoEsperado(eventoId, expectedAudience);
      setEstado((atual) =>
        atual.status === "pronto"
          ? { ...atual, dados: { ...atual.dados, evento: { ...atual.dados.evento, expectedAudience } } }
          : atual,
      );
      setPublicoSimulado(expectedAudience);
    },
    [eventoId],
  );

  const despesas = estado.dados?.despesas;
  const lotes = estado.dados?.lotes;
  const totais = useMemo(() => totalizarDespesas(despesas ?? []), [despesas]);
  const simulacao = useMemo(
    () => calcularIndicadores(lotes ?? [], totais.total, publicoSimulado),
    [lotes, totais.total, publicoSimulado],
  );
  const segmentos = useMemo(() => segmentosDeLotes(lotes ?? [], publicoSimulado), [lotes, publicoSimulado]);

  return {
    status: estado.status,
    dados: estado.dados,
    totais,
    simulacao,
    segmentos,
    publicoSimulado,
    setPublicoSimulado,
    definirPublicoEsperado,
    tentarDeNovo,
    criarDespesa,
    editarDespesa,
    excluirDespesa,
    alterarNaLinha,
  };
}

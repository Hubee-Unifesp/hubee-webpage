import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LoteSugerido } from "@/lib/lotes-sugeridos";
import type { EventoEditavel } from "@/types/evento-editor";
import type { LotePayload } from "@/types/lote-ingresso";
import { LotesIngressosPanel } from "../lotes/lotes-ingressos-panel";
import { LotesSugeridos } from "../lotes/lotes-sugeridos";
import { acoesEtapaClassName, botaoPrimarioClassName, botaoTextoClassName } from "./estilos";

interface IngressosEventoProps {
  evento: EventoEditavel;
  somenteLeitura: boolean;
  onCriarLote: (payload: LotePayload) => Promise<void>;
  onEditarLote: (loteId: string, payload: LotePayload) => Promise<void>;
  onExcluirLote: (loteId: string) => Promise<void>;
  /** Lotes sugeridos pelo assistente ainda não criados nem descartados. */
  lotesSugeridos?: readonly LoteSugerido[];
  onResolverLoteSugerido?: (sugestao: LoteSugerido) => void;
  onVoltar: () => void;
  onContinuar: () => void;
}

export function IngressosEvento({
  evento,
  somenteLeitura,
  onCriarLote,
  onEditarLote,
  onExcluirLote,
  lotesSugeridos = [],
  onResolverLoteSugerido,
  onVoltar,
  onContinuar,
}: IngressosEventoProps) {
  return (
    <div className="flex flex-col gap-4">
      {!somenteLeitura && onResolverLoteSugerido && (
        <LotesSugeridos sugestoes={lotesSugeridos} onCriar={onCriarLote} onResolver={onResolverLoteSugerido} />
      )}
      <LotesIngressosPanel
        lotes={evento.lotes}
        somenteLeitura={somenteLeitura}
        onCriar={onCriarLote}
        onEditar={onEditarLote}
        onExcluir={onExcluirLote}
      />

      <div className={acoesEtapaClassName}>
        <Button type="button" onClick={onVoltar} className={cn(botaoTextoClassName, "bg-transparent sm:mr-auto")}>
          Voltar
        </Button>
        <Button type="button" onClick={onContinuar} className={botaoPrimarioClassName}>
          Continuar para revisão
        </Button>
      </div>
    </div>
  );
}

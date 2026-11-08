import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventoEditavel } from "@/types/evento-editor";
import { LotesIngressosPanel } from "../lotes/lotes-ingressos-panel";
import { acoesEtapaClassName, botaoPrimarioClassName, botaoTextoClassName } from "./estilos";

interface IngressosEventoProps {
  evento: EventoEditavel;
  somenteLeitura: boolean;
  onVoltar: () => void;
  onContinuar: () => void;
}

export function IngressosEvento({ evento, somenteLeitura, onVoltar, onContinuar }: IngressosEventoProps) {
  return (
    <div className="flex flex-col gap-4">
      <LotesIngressosPanel evento={evento} somenteLeitura={somenteLeitura} />

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

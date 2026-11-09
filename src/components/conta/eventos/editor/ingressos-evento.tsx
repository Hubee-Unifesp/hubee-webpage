import { Ticket } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventoEditavel } from "@/types/evento-editor";
import { acoesEtapaClassName, botaoPrimarioClassName, botaoTextoClassName, cartaoClassName, hintClassName } from "./estilos";

interface IngressosEventoProps {
  evento: EventoEditavel;
  onVoltar: () => void;
  onContinuar: () => void;
}

const numero = new Intl.NumberFormat("pt-BR");

export function IngressosEvento({ evento, onVoltar, onContinuar }: IngressosEventoProps) {
  const lotes = evento.lotes;

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="ingressos-titulo" className={cartaoClassName}>
        <h2 id="ingressos-titulo" className="text-base font-semibold">
          Lotes de ingressos
        </h2>
        <p className={cn("mt-0.5", hintClassName)}>
          O cadastro e a edição de lotes chegam em breve nesta etapa.
        </p>

        {lotes.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Nenhum lote criado"
            description="O evento precisa de pelo menos um lote para ser publicado."
            className="mt-4"
          />
        ) : (
          <ul className="mt-4 text-sm">
            {lotes.map((lote) => (
              <li
                key={lote.id}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-hubee-200 py-3 first:border-t-0 dark:border-hubee-50/10"
              >
                <span className="min-w-0 font-semibold break-words">{lote.batch}</span>
                <span>
                  {formatPrice(lote.price)} · {numero.format(lote.quantity)}{" "}
                  {lote.quantity === 1 ? "ingresso" : "ingressos"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

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

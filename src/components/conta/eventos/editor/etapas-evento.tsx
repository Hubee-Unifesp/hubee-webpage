import { cn } from "@/lib/utils";
import { etapasEvento, type EtapaEvento } from "./evento-editor.data";

interface EtapasEventoProps {
  atual: EtapaEvento;
  onChange: (etapa: EtapaEvento) => void;
  bloquearSeguintes: boolean;
}

export function EtapasEvento({ atual, onChange, bloquearSeguintes }: EtapasEventoProps) {
  return (
    <nav aria-label="Etapas do evento">
      <ol className="grid grid-cols-3 gap-2">
        {etapasEvento.map((etapa, index) => {
          const ativa = etapa.id === atual;
          const bloqueada = bloquearSeguintes && etapa.id !== "dados";
          return (
            <li key={etapa.id}>
              <button
                type="button"
                aria-current={ativa ? "step" : undefined}
                disabled={bloqueada}
                title={bloqueada ? "Salve os dados do evento para continuar" : undefined}
                onClick={() => onChange(etapa.id)}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer flex-col items-start gap-1.5 border-b-3 px-0.5 py-1.5 text-left text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-row sm:items-center sm:gap-2.5 sm:px-3 sm:text-sm dark:focus-visible:ring-hubee-400",
                  ativa
                    ? "border-hubee-800 font-semibold dark:border-hubee-400"
                    : "border-hubee-200 dark:border-hubee-50/15",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    ativa
                      ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                      : "border-hubee-400",
                  )}
                >
                  {index + 1}
                </span>
                {etapa.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

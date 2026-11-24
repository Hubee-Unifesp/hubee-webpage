import { CheckCircle2, ChevronDown, Circle, CircleDashed, MinusCircle } from "lucide-react";
import { categoryConfig } from "@/components/home/events/categories.config";
import type { AssistantDraft, AssistantField } from "@/lib/api/event-ai-assistant.types";
import { resumoDoRascunho } from "@/lib/assistente-evento";
import { cn } from "@/lib/utils";
import { cartaoClassName } from "../editor/estilos";

interface ResumoRascunhoProps {
  draft: AssistantDraft | null;
  campoAtual: AssistantField | null;
  obrigatoriosFaltando: number;
}

const rotuloCategoria = (categoria: NonNullable<AssistantDraft["category"]>) => categoryConfig[categoria].label;

function ListaResumo({ draft, campoAtual }: Omit<ResumoRascunhoProps, "obrigatoriosFaltando">) {
  const itens = resumoDoRascunho(draft, rotuloCategoria);

  return (
    <dl className="flex flex-col gap-3">
      {itens.map((item) => {
        const preenchido = item.valores.length > 0;
        const atual = item.campo === campoAtual;
        const Icone = item.completo ? CheckCircle2 : preenchido ? CircleDashed : item.pulado ? MinusCircle : Circle;
        return (
          <div
            key={item.campo}
            className={cn(
              "flex gap-2.5 rounded-lg px-2 py-1.5",
              atual && "bg-hubee-100 ring-1 ring-hubee-400 dark:bg-hubee-50/10 dark:ring-hubee-400/40",
            )}
          >
            <Icone
              aria-hidden="true"
              className={cn(
                "mt-0.5 size-4 shrink-0",
                item.completo
                  ? "text-emerald-600 dark:text-emerald-400"
                  : preenchido
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-hubee-neutral-200",
              )}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs font-semibold">
                {item.rotulo}
                {preenchido && !item.completo && <span className="sr-only"> (incompleto)</span>}
                {atual && <span className="sr-only"> (pergunta atual)</span>}
              </dt>
              {preenchido ? (
                item.valores.map((valor) => (
                  <dd
                    key={valor}
                    className={cn(
                      "text-sm break-words text-hubee-800 dark:text-hubee-50",
                      item.campo === "description" && "line-clamp-4",
                    )}
                  >
                    {valor}
                  </dd>
                ))
              ) : (
                <dd className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
                  {item.pulado ? "Pulado" : "Ainda não informado"}
                </dd>
              )}
            </div>
          </div>
        );
      })}
    </dl>
  );
}

export function ResumoRascunho({ draft, campoAtual, obrigatoriosFaltando }: ResumoRascunhoProps) {
  const status =
    obrigatoriosFaltando === 0
      ? "Dados obrigatórios completos"
      : `${obrigatoriosFaltando} ${obrigatoriosFaltando === 1 ? "dado obrigatório faltando" : "dados obrigatórios faltando"}`;

  return (
    <>
      <details className={cn(cartaoClassName, "group p-4 lg:hidden")}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold">
          <span>
            Resumo do evento
            <span className="block text-xs font-normal text-hubee-neutral-300 dark:text-hubee-200">{status}</span>
          </span>
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4">
          <ListaResumo draft={draft} campoAtual={campoAtual} />
        </div>
      </details>

      <aside aria-label="Resumo do evento" className={cn(cartaoClassName, "hidden lg:block")}>
        <h2 className="text-base font-bold">Resumo do evento</h2>
        <p className="mb-4 text-xs text-hubee-neutral-300 dark:text-hubee-200">{status}</p>
        <ListaResumo draft={draft} campoAtual={campoAtual} />
      </aside>
    </>
  );
}

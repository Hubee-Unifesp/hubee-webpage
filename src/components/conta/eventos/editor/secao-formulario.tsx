"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cartaoClassName, hintClassName } from "./estilos";

interface SecaoFormularioProps {
  titulo: string;
  descricao?: string;
  resumo: string;
  inicialmenteAberta?: boolean;
  forcarAberta?: boolean;
  children: ReactNode;
}

export function SecaoFormulario({
  titulo,
  descricao,
  resumo,
  inicialmenteAberta = false,
  forcarAberta = false,
  children,
}: SecaoFormularioProps) {
  const conteudoId = useId();
  const [aberta, setAberta] = useState(inicialmenteAberta);
  const expandida = aberta || forcarAberta;

  return (
    <section className={cn(cartaoClassName, "py-4 md:py-6")}>
      <div className="hidden md:block">
        <h2 className="text-base font-semibold">{titulo}</h2>
        {descricao && <p className={cn("mt-0.5", hintClassName)}>{descricao}</p>}
      </div>

      <h2 className="md:hidden">
        <button
          type="button"
          aria-expanded={expandida}
          aria-controls={conteudoId}
          onClick={() => setAberta(!expandida)}
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400"
        >
          <span className="min-w-0">
            <span className="block text-base font-semibold">{titulo}</span>
            <span className={cn("block truncate", hintClassName)}>{resumo}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("size-5 shrink-0 transition-transform motion-reduce:transition-none", expandida && "rotate-180")}
          />
        </button>
      </h2>

      <div id={conteudoId} className={cn("mt-4", !expandida && "hidden md:block")}>
        {children}
      </div>
    </section>
  );
}

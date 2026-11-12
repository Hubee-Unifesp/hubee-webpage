"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotaEstrela } from "@/types/avaliacao-fornecedor";
import { formatarNota, ROTULO_NOTA } from "./avaliacoes.data";

const tamanhos = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const;
type Tamanho = keyof typeof tamanhos;

const cheiaClassName = "fill-hubee-500 text-hubee-500 dark:fill-hubee-400 dark:text-hubee-400";
const vaziaClassName = "fill-transparent text-hubee-300 dark:text-hubee-700";

/** Estrelas somente leitura. Aceita notas fracionadas (ex.: 4,3 pinta 30% da quinta estrela). */
export function EstrelasNota({ nota, tamanho = "md", className }: { nota: number; tamanho?: Tamanho; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Nota ${formatarNota(nota)} de 5`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((posicao) => {
        const preenchimento = Math.min(1, Math.max(0, nota - (posicao - 1)));
        return (
          <span key={posicao} className="relative inline-flex">
            <Star aria-hidden="true" className={cn(tamanhos[tamanho], vaziaClassName)} />
            {preenchimento > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${preenchimento * 100}%` }}>
                <Star aria-hidden="true" className={cn(tamanhos[tamanho], cheiaClassName)} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

interface EstrelasInputProps {
  /** Nome do grupo (nome acessível e `name` dos radios). */
  label: string;
  /** 0 = ainda não avaliado. */
  value: number;
  onChange: (nota: NotaEstrela) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

/**
 * Seleção de 1 a 5 estrelas. Usa radios nativos escondidos: Tab entra no grupo e as setas trocam a nota.
 * Passar o mouse mostra uma prévia e o rótulo da nota ("Bom", "Excelente"…).
 */
export function EstrelasInput({ label, value, onChange, onBlur, invalid, describedBy, disabled }: EstrelasInputProps) {
  const name = useId();
  const [hover, setHover] = useState(0);
  const exibida = hover || value;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="flex items-center gap-2"
      onMouseLeave={() => setHover(0)}
    >
      <div className="flex items-center">
        {([1, 2, 3, 4, 5] as const).map((nota) => (
          <label
            key={nota}
            onMouseEnter={() => !disabled && setHover(nota)}
            className={cn(
              "rounded-md p-0.5 has-focus-visible:ring-2 has-focus-visible:ring-hubee-600 dark:has-focus-visible:ring-hubee-400",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            )}
          >
            <input
              type="radio"
              name={name}
              value={nota}
              checked={value === nota}
              disabled={disabled}
              onChange={() => onChange(nota)}
              onBlur={onBlur}
              className="sr-only"
            />
            <span className="sr-only">
              {nota} {nota === 1 ? "estrela" : "estrelas"} — {ROTULO_NOTA[nota]}
            </span>
            <Star
              aria-hidden="true"
              className={cn(
                "size-7 transition-transform motion-reduce:transition-none",
                nota <= exibida ? cheiaClassName : vaziaClassName,
                invalid && exibida === 0 && "text-red-400 dark:text-red-400/70",
                hover === nota && "scale-110",
              )}
            />
          </label>
        ))}
      </div>
      <span aria-hidden="true" className="min-w-16 text-xs font-semibold text-hubee-750 dark:text-hubee-200">
        {exibida ? ROTULO_NOTA[exibida as NotaEstrela] : ""}
      </span>
    </div>
  );
}

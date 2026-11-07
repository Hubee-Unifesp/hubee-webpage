"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TODAS_CATEGORIAS } from "./fornecedores.data";

interface FornecedoresFiltrosProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  categoria: string;
  onCategoriaChange: (value: string) => void;
  categorias: readonly string[];
}

const labelClassName = "text-xs font-semibold";
const controlClassName =
  "h-10 rounded-lg border-hubee-300 bg-hubee-neutral-25 text-hubee-800 dark:border-hubee-50/20 dark:bg-hubee-800 dark:text-hubee-50";

/** Busca por nome e filtro por categoria da listagem de fornecedores. */
export function FornecedoresFiltros({
  busca,
  onBuscaChange,
  categoria,
  onCategoriaChange,
  categorias,
}: FornecedoresFiltrosProps) {
  const buscaId = useId();
  const categoriaId = useId();

  return (
    <div role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor={buscaId} className={labelClassName}>
          Buscar por nome
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hubee-neutral-300 dark:text-hubee-200"
          />
          <Input
            id={buscaId}
            type="search"
            value={busca}
            onChange={(event) => onBuscaChange(event.target.value)}
            placeholder="Buscar por nome"
            className={`${controlClassName} pl-9 placeholder:text-hubee-neutral-300`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-56">
        {/* O Radix Select é um botão: o nome vem por `aria-labelledby`, não por `<label htmlFor>`. */}
        <span id={categoriaId} className={labelClassName}>
          Categoria
        </span>
        <Select value={categoria} onValueChange={onCategoriaChange}>
          <SelectTrigger aria-labelledby={categoriaId} className={`${controlClassName} w-full`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={TODAS_CATEGORIAS}>Todas</SelectItem>
            {categorias.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

"use client";

import { useId } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type FiltroAvaliacaoMinima,
  type OrdenacaoFornecedores,
  TODAS_AVALIACOES,
  TODAS_CATEGORIAS,
} from "./fornecedores.data";

interface FornecedoresFiltrosProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  categoria: string;
  onCategoriaChange: (value: string) => void;
  categorias: readonly string[];
  avaliacaoMinima: FiltroAvaliacaoMinima;
  onAvaliacaoMinimaChange: (value: FiltroAvaliacaoMinima) => void;
  ordenacao: OrdenacaoFornecedores;
  onOrdenacaoChange: (value: OrdenacaoFornecedores) => void;
}

const labelClassName = "text-xs font-semibold";
const controlClassName =
  "h-10 rounded-lg border-hubee-300 bg-hubee-neutral-25 text-hubee-800 dark:border-hubee-50/20 dark:bg-hubee-800 dark:text-hubee-50";

/** Busca por nome, filtro por categoria/avaliação mínima e ordenação da listagem de fornecedores (`GOL-249`). */
export function FornecedoresFiltros({
  busca,
  onBuscaChange,
  categoria,
  onCategoriaChange,
  categorias,
  avaliacaoMinima,
  onAvaliacaoMinimaChange,
  ordenacao,
  onOrdenacaoChange,
}: FornecedoresFiltrosProps) {
  const buscaId = useId();
  const categoriaId = useId();
  const avaliacaoId = useId();
  const ordenacaoId = useId();

  const filtroAvaliacaoAtivo = avaliacaoMinima !== TODAS_AVALIACOES;

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

      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div className="flex flex-col gap-1.5 sm:w-44">
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

        <div className="flex flex-col gap-1.5 sm:w-44">
          <span id={avaliacaoId} className={labelClassName}>
            Avaliação mínima
          </span>
          <Select
            value={avaliacaoMinima}
            onValueChange={(value) => onAvaliacaoMinimaChange(value as FiltroAvaliacaoMinima)}
          >
            <SelectTrigger
              aria-labelledby={avaliacaoId}
              className={`${controlClassName} w-full ${
                filtroAvaliacaoAtivo ? "border-hubee-500 ring-1 ring-hubee-500 dark:border-hubee-400 dark:ring-hubee-400" : ""
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={TODAS_AVALIACOES}>Todas</SelectItem>
              <SelectItem value="4">★ 4+ estrelas</SelectItem>
              <SelectItem value="3">★ 3+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-48">
        <span id={ordenacaoId} className={labelClassName}>
          Ordenar por
        </span>
        <Select
          value={ordenacao}
          onValueChange={(value) => onOrdenacaoChange(value as OrdenacaoFornecedores)}
        >
          <SelectTrigger aria-labelledby={ordenacaoId} className={`${controlClassName} w-full`}>
            <span className="flex items-center gap-2 truncate">
              <ArrowUpDown
                aria-hidden="true"
                className="size-4 shrink-0 text-hubee-neutral-300 dark:text-hubee-200"
              />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="rating">Mais bem avaliados</SelectItem>
            <SelectItem value="name">Ordem alfabética (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

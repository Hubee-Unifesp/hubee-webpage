"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TODOS_PAPEIS,
  TODOS_STATUS,
  type FiltroPapelMembro,
  type FiltroStatusConvite,
} from "./membros.data";

interface MembrosFiltrosProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  papel: FiltroPapelMembro;
  onPapelChange: (value: FiltroPapelMembro) => void;
  status: FiltroStatusConvite;
  onStatusChange: (value: FiltroStatusConvite) => void;
}

const labelClassName = "text-xs font-semibold";
const controlClassName =
  "h-10 rounded-lg border-hubee-300 bg-hubee-neutral-25 text-hubee-800 dark:border-hubee-50/20 dark:bg-hubee-850 dark:text-hubee-50";

/** Barra de busca por nome/e-mail e filtros de papel e status do convite (`/conta/membros`, GOL-277). */
export function MembrosFiltros({
  busca,
  onBuscaChange,
  papel,
  onPapelChange,
  status,
  onStatusChange,
}: MembrosFiltrosProps) {
  const buscaId = useId();
  const papelId = useId();
  const statusId = useId();

  return (
    <div role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor={buscaId} className={labelClassName}>
          Buscar por nome ou e-mail
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
            placeholder="Buscar integrante..."
            className={`${controlClassName} pl-9 placeholder:text-hubee-neutral-300`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div className="flex flex-col gap-1.5 sm:w-44">
          <span id={papelId} className={labelClassName}>
            Papel
          </span>
          <Select value={papel} onValueChange={(value) => onPapelChange(value as FiltroPapelMembro)}>
            <SelectTrigger aria-labelledby={papelId} className={`${controlClassName} w-full`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={TODOS_PAPEIS}>Todos</SelectItem>
              <SelectItem value="manage">Administrador</SelectItem>
              <SelectItem value="write">Membro</SelectItem>
              <SelectItem value="read">Leitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 sm:w-44">
          <span id={statusId} className={labelClassName}>
            Status
          </span>
          <Select value={status} onValueChange={(value) => onStatusChange(value as FiltroStatusConvite)}>
            <SelectTrigger aria-labelledby={statusId} className={`${controlClassName} w-full`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value={TODOS_STATUS}>Todos</SelectItem>
              <SelectItem value="ACCEPTED">Aceito</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="DECLINED">Recusado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

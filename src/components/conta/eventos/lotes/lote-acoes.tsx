"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LoteIngresso } from "@/types/lote-ingresso";

interface LoteAcoesProps {
  lote: LoteIngresso;
  /** `false` para o papel Leitura (ou evento cancelado): os botões aparecem desabilitados. */
  podeGerenciar: boolean;
  onEditar: (lote: LoteIngresso) => void;
  onExcluir: (lote: LoteIngresso) => void;
  className?: string;
}

const semPermissao = "Apenas Administradores e Membros podem gerenciar lotes";

/** Botões Editar e Excluir de um lote. */
export function LoteAcoes({ lote, podeGerenciar, onEditar, onExcluir, className }: LoteAcoesProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!podeGerenciar}
        title={podeGerenciar ? "Editar" : semPermissao}
        aria-label={`Editar ${lote.batch}`}
        onClick={() => onEditar(lote)}
        className="cursor-pointer text-hubee-800 hover:bg-hubee-200 hover:text-hubee-800 focus-visible:ring-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!podeGerenciar}
        title={podeGerenciar ? "Excluir" : semPermissao}
        aria-label={`Excluir ${lote.batch}`}
        onClick={() => onExcluir(lote)}
        className="cursor-pointer text-red-600 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:text-red-300 dark:focus-visible:ring-red-400"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Fornecedor } from "@/types/fornecedor";

export interface FornecedorAcoesProps {
  fornecedor: Fornecedor;
  /** `false` para o papel Leitura: os botões aparecem desabilitados. */
  podeGerenciar: boolean;
  onEditar: (fornecedor: Fornecedor) => void;
  onExcluir: (fornecedor: Fornecedor) => void;
  className?: string;
}

const semPermissao = "Apenas Administradores e Membros podem gerenciar fornecedores";

/** Botões Editar e Excluir de um fornecedor, compartilhados pela tabela e pelos cards. */
export function FornecedorAcoes({ fornecedor, podeGerenciar, onEditar, onExcluir, className }: FornecedorAcoesProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        title="Avaliações"
        className="cursor-pointer text-hubee-800 hover:bg-hubee-200 hover:text-hubee-800 focus-visible:ring-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
      >
        <Link href={`/conta/fornecedores/${fornecedor.id}/avaliacoes`} aria-label={`Avaliações de ${fornecedor.companyName}`}>
          <Star aria-hidden="true" />
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!podeGerenciar}
        title={podeGerenciar ? "Editar" : semPermissao}
        aria-label={`Editar ${fornecedor.companyName}`}
        onClick={() => onEditar(fornecedor)}
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
        aria-label={`Excluir ${fornecedor.companyName}`}
        onClick={() => onExcluir(fornecedor)}
        className="cursor-pointer text-red-600 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:text-red-300 dark:focus-visible:ring-red-400"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MembroOrganizacao } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";
import { PapelMembroBadge, StatusConviteBadge } from "./membro-badges";

interface MembroCardProps {
  membro: MembroOrganizacao;
  usuarioAtualId?: string | null;
  podeGerenciar: boolean;
  atualizando?: boolean;
  onAlterarPapel: (membro: MembroOrganizacao, novoNivel: OrganizationAccessLevel) => void;
  onRemover: (membro: MembroOrganizacao) => void;
}

/** Card responsivo de membro da organização para Mobile e Tablet (`xl:hidden`, GOL-274 / GOL-277). */
export function MembroCard({
  membro,
  usuarioAtualId,
  podeGerenciar,
  atualizando = false,
  onAlterarPapel,
  onRemover,
}: MembroCardProps) {
  const isSelf = Boolean(usuarioAtualId && membro.userId === usuarioAtualId);
  const bloqueado = !podeGerenciar || isSelf || Boolean(membro.isOwner);
  const acaoLabel = membro.inviteStatus === "PENDING" ? "Cancelar" : "Remover";

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 dark:border-hubee-50/15 dark:bg-hubee-850">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-hubee-800 dark:text-hubee-50">
            {membro.fullName}
            {isSelf && " (Você)"}
          </h3>
          <p className="truncate text-xs text-hubee-neutral-300 dark:text-hubee-200">{membro.email}</p>
        </div>
        <StatusConviteBadge status={membro.inviteStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PapelMembroBadge level={membro.level} />
        {membro.isOwner && (
          <span className="text-[11px] font-medium text-hubee-neutral-300 dark:text-hubee-200">
            Representante principal
          </span>
        )}
      </div>

      {!bloqueado && (
        <div className="flex items-center justify-between gap-3 border-t border-hubee-200 pt-3 dark:border-hubee-50/10">
          <Select
            value={membro.level}
            disabled={atualizando}
            onValueChange={(value) => onAlterarPapel(membro, value as OrganizationAccessLevel)}
          >
            <SelectTrigger
              aria-label={`Alterar papel de ${membro.fullName}`}
              className="h-9 w-40 rounded-lg border-hubee-200 bg-white text-xs dark:border-hubee-50/15 dark:bg-hubee-900"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="manage">Administrador</SelectItem>
              <SelectItem value="write">Membro</SelectItem>
              <SelectItem value="read">Leitor</SelectItem>
            </SelectContent>
          </Select>

          <button
            type="button"
            disabled={atualizando}
            onClick={() => onRemover(membro)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/60"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            {acaoLabel}
          </button>
        </div>
      )}
    </article>
  );
}

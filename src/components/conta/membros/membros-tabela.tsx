"use client";

import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMemberInitials } from "@/lib/validations/organization-member.schema";
import type { MembroOrganizacao } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";
import { PapelMembroBadge, StatusConviteBadge } from "./membro-badges";

export interface MembroAcoesTabelaProps {
  membros: readonly MembroOrganizacao[];
  usuarioAtualId?: string | null;
  podeGerenciar: boolean;
  alterandoId?: string | null;
  onAlterarPapel: (membro: MembroOrganizacao, novoNivel: OrganizationAccessLevel) => void;
  onRemover: (membro: MembroOrganizacao) => void;
}

const thClassName = "px-3 py-3 text-left font-semibold whitespace-nowrap";
const tdClassName = "px-3 py-4 align-middle";

/** Tabela de membros da organização para Desktop (`xl:block`, seguindo o padrão de `FornecedoresTabela`). */
export function MembrosTabela({
  membros,
  usuarioAtualId,
  podeGerenciar,
  alterandoId,
  onAlterarPapel,
  onRemover,
}: MembroAcoesTabelaProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-hubee-200 bg-hubee-neutral-25 xl:block dark:border-hubee-50/15 dark:bg-hubee-850">
      <table className="w-full text-xs">
        <caption className="sr-only">Membros da organização</caption>
        <thead className="border-b border-hubee-200 bg-hubee-100/70 dark:border-hubee-50/15 dark:bg-hubee-50/5">
          <tr>
            <th scope="col" className={thClassName}>
              Membro
            </th>
            <th scope="col" className={thClassName}>
              Papel
            </th>
            <th scope="col" className={thClassName}>
              Status
            </th>
            <th scope="col" className={thClassName}>
              Alterar papel
            </th>
            <th scope="col" className={`${thClassName} w-0`}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hubee-200 dark:divide-hubee-50/10">
          {membros.map((membro) => {
            const isSelf = Boolean(usuarioAtualId && membro.userId === usuarioAtualId);
            const bloqueado = !podeGerenciar || isSelf || Boolean(membro.isOwner);
            const atualizando = alterandoId === membro.id;
            const acaoLabel = membro.inviteStatus === "PENDING" ? "Cancelar" : "Remover";

            return (
              <tr key={membro.id} className="hover:bg-hubee-100/60 dark:hover:bg-hubee-50/5">
                <th scope="row" className={`${tdClassName} w-[38%] max-w-0 text-left font-normal`}>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-hubee-400 text-[11px] font-bold text-hubee-800 dark:border dark:border-hubee-400/35 dark:bg-hubee-900 dark:text-hubee-400"
                    >
                      {formatMemberInitials(membro.fullName)}
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate font-semibold text-hubee-800 dark:text-hubee-50">
                        {membro.fullName}
                        {isSelf && " (Você)"}
                      </span>
                      <span className="block truncate text-hubee-neutral-300 dark:text-hubee-200">
                        {membro.email}
                      </span>
                    </div>
                  </div>
                </th>

                <td className={`${tdClassName} whitespace-nowrap`}>
                  <PapelMembroBadge level={membro.level} />
                </td>

                <td className={`${tdClassName} whitespace-nowrap`}>
                  <StatusConviteBadge status={membro.inviteStatus} />
                </td>

                <td className={`${tdClassName} whitespace-nowrap`}>
                  {membro.isOwner ? (
                    <span className="text-hubee-neutral-300 dark:text-hubee-200">Representante</span>
                  ) : (
                    <Select
                      value={membro.level}
                      disabled={bloqueado || atualizando}
                      onValueChange={(value) => onAlterarPapel(membro, value as OrganizationAccessLevel)}
                    >
                      <SelectTrigger
                        aria-label={`Alterar papel de ${membro.fullName}`}
                        className="h-8 w-36 rounded-lg border-hubee-200 bg-white text-xs dark:border-hubee-50/15 dark:bg-hubee-900"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="manage">Administrador</SelectItem>
                        <SelectItem value="write">Membro</SelectItem>
                        <SelectItem value="read">Leitor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>

                <td className={`${tdClassName} whitespace-nowrap`}>
                  {bloqueado ? (
                    <span className="text-hubee-neutral-300 dark:text-hubee-200" aria-label="Sem ações disponíveis">
                      —
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={atualizando}
                      onClick={() => onRemover(membro)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/60"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      {acaoLabel}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

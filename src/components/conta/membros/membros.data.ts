import type { InviteStatus, MembroOrganizacao } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";

export const TODOS_PAPEIS = "ALL" as const;
export const TODOS_STATUS = "ALL" as const;

export type FiltroPapelMembro = typeof TODOS_PAPEIS | OrganizationAccessLevel;
export type FiltroStatusConvite = typeof TODOS_STATUS | InviteStatus;

/** Apenas Administradores (`manage`) podem convidar, alterar papéis ou remover membros. */
export function canManageMembers(level: OrganizationAccessLevel | null | undefined): boolean {
  return level === "manage";
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Filtra a lista de membros por nome/e-mail, papel efetivo e status do convite. */
export function filterMembers(
  membros: readonly MembroOrganizacao[],
  busca: string,
  papel: FiltroPapelMembro,
  status: FiltroStatusConvite,
): MembroOrganizacao[] {
  const termo = normalize(busca.trim());

  return membros.filter((membro) => {
    const matchesPapel = papel === TODOS_PAPEIS || membro.level === papel;
    const matchesStatus = status === TODOS_STATUS || membro.inviteStatus === status;
    const matchesBusca =
      termo === "" ||
      normalize(membro.fullName).includes(termo) ||
      normalize(membro.email).includes(termo);

    return matchesPapel && matchesStatus && matchesBusca;
  });
}

export const MEMBER_LEVEL_LABELS: Record<OrganizationAccessLevel, string> = {
  manage: "Administrador",
  write: "Membro",
  read: "Leitor",
};

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  ACCEPTED: "Aceito",
  PENDING: "Pendente",
  DECLINED: "Recusado",
};

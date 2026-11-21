import type { OrganizationAccessLevel } from "./usuario";

/** Status do convite de vínculo com a organização (`organization_users.invite_status`). */
export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

/** Papel persistido na API (`organization_users.role`). */
export type OrganizationMemberRole = "admin" | "member";

/** Permissão persistida na API (`organization_users.permission`). */
export type OrganizationMemberPermission = "full" | "read_only";

/** Membro (ou convidado) listado na gestão de equipe da organização (`/conta/membros`). */
export interface MembroOrganizacao {
  id: string;
  userId: string;
  orgId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
  level: OrganizationAccessLevel;
  inviteStatus: InviteStatus;
  /** Verdadeiro para o representante principal/criador da organização. */
  isOwner?: boolean;
}

/** Convite pendente recebido pela pessoa usuária autenticada (exibido em `/conta/perfil`). */
export interface ConviteOrganizacaoPendente {
  id: string;
  orgId: string;
  organizationName: string;
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
  level: OrganizationAccessLevel;
  inviteStatus: "PENDING";
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  createdAt?: string | null;
}

/** Payload de convite por e-mail enviado para a API na integração (GOL-278). */
export interface ConvidarMembroPayload {
  email: string;
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
}

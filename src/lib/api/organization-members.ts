import { toMemberAccessLevel } from "@/lib/validations/organization-member.schema";
import type {
  ConvidarMembroPayload,
  ConviteOrganizacaoPendente,
  InviteStatus,
  MembroOrganizacao,
  OrganizationMemberPermission,
  OrganizationMemberRole,
} from "@/types/membro-organizacao";
import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";

/** Status do convite como a `hubee-api` persiste em `organization_users.invite_status`. */
type ApiInviteStatus = "pending" | "accepted" | "rejected";

/** Vínculo organização-usuário devolvido por `/organizations/:orgId/users` (`OrganizationUserResponseDto`). */
export interface OrganizationMemberApi {
  orgId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  permission: string;
  inviteStatus: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Convite pendente devolvido por `GET /users/me/invites` (`UserInviteResponseDto`). */
export interface UserInviteApi {
  orgId: string;
  organizationName: string;
  userId: string;
  role: string;
  permission: string;
  inviteStatus: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateOrganizationMemberPayload {
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
}

export type InviteResponse = "ACCEPTED" | "DECLINED";

const INVITE_STATUS_FROM_API: Record<ApiInviteStatus, InviteStatus> = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  rejected: "DECLINED",
};

const INVITE_RESPONSE_TO_API: Record<InviteResponse, Exclude<ApiInviteStatus, "pending">> = {
  ACCEPTED: "accepted",
  DECLINED: "rejected",
};

/** Converte o status minúsculo da API para o usado na interface. Valor desconhecido conta como pendente. */
export function toInviteStatus(status: string): InviteStatus {
  return INVITE_STATUS_FROM_API[status.toLowerCase() as ApiInviteStatus] ?? "PENDING";
}

function toRole(role: string): OrganizationMemberRole {
  return role === "admin" ? "admin" : "member";
}

function toPermission(permission: string): OrganizationMemberPermission {
  return permission === "full" ? "full" : "read_only";
}

export function toMembroOrganizacao(member: OrganizationMemberApi): MembroOrganizacao {
  return {
    id: `${member.orgId}-${member.userId}`,
    orgId: member.orgId,
    userId: member.userId,
    fullName: member.userName,
    email: member.userEmail,
    role: toRole(member.role),
    permission: toPermission(member.permission),
    level: toMemberAccessLevel(member.role, member.permission),
    inviteStatus: toInviteStatus(member.inviteStatus),
  };
}

export function toConvitePendente(invite: UserInviteApi): ConviteOrganizacaoPendente {
  return {
    id: `${invite.orgId}-${invite.userId}`,
    orgId: invite.orgId,
    organizationName: invite.organizationName,
    role: toRole(invite.role),
    permission: toPermission(invite.permission),
    level: toMemberAccessLevel(invite.role, invite.permission),
    inviteStatus: "PENDING",
    createdAt: invite.createdAt ?? null,
  };
}

/** Lista membros e convites (pendentes, aceitos e recusados) da organização. Exige nível `manage`. */
export async function getOrganizationMembers(orgId: string): Promise<MembroOrganizacao[]> {
  const response = await apiClient.get<OrganizationMemberApi[]>(`/organizations/${orgId}/users`);
  return response.data.map(toMembroOrganizacao);
}

/**
 * Convida um usuário já cadastrado pelo e-mail; o vínculo nasce `pending`. Exige nível `manage`.
 * A API responde `404` se não houver conta ativa com o e-mail e `409` se o usuário já estiver vinculado.
 */
export async function inviteOrganizationMember(
  orgId: string,
  payload: ConvidarMembroPayload,
): Promise<MembroOrganizacao> {
  const response = await apiClient.post<OrganizationMemberApi>(`/organizations/${orgId}/users`, payload);
  return toMembroOrganizacao(response.data);
}

/** Altera papel e permissão de um membro. Exige nível `manage`. */
export async function updateOrganizationMember(
  orgId: string,
  userId: string,
  payload: UpdateOrganizationMemberPayload,
): Promise<MembroOrganizacao> {
  const response = await apiClient.patch<OrganizationMemberApi>(
    `/organizations/${orgId}/users/${userId}`,
    payload,
  );
  return toMembroOrganizacao(response.data);
}

/** Remove o membro ou cancela o convite pendente. Exige nível `manage`. */
export async function removeOrganizationMember(orgId: string, userId: string): Promise<void> {
  await apiClient.delete(`/organizations/${orgId}/users/${userId}`);
}

/** Convites pendentes recebidos pela pessoa usuária autenticada. */
export async function getMyInvites(): Promise<ConviteOrganizacaoPendente[]> {
  const response = await apiClient.get<UserInviteApi[]>("/users/me/invites");
  return response.data.map(toConvitePendente);
}

/** Aceita ou recusa um convite pendente da organização. `404` se não houver convite pendente. */
export async function respondOrganizationInvite(orgId: string, resposta: InviteResponse): Promise<void> {
  await apiClient.patch(`/organizations/${orgId}/users/me`, {
    inviteStatus: INVITE_RESPONSE_TO_API[resposta],
  });
}

export type OrganizationMemberAction = "load" | "invite" | "update" | "remove" | "respond";

const ACTION_FAILURE: Record<OrganizationMemberAction, string> = {
  load: "Não foi possível carregar os membros da organização.",
  invite: "Não foi possível enviar o convite.",
  update: "Não foi possível atualizar o papel do membro.",
  remove: "Não foi possível remover o membro.",
  respond: "Não foi possível responder ao convite.",
};

const NOT_FOUND: Record<OrganizationMemberAction, string> = {
  load: "Organização não encontrada.",
  invite: "Nenhuma conta encontrada com esse e-mail. Peça para a pessoa criar conta na Hubee primeiro.",
  update: "Este membro não faz mais parte da organização.",
  remove: "Este membro não faz mais parte da organização.",
  respond: "Este convite não está mais disponível.",
};

/** Mensagem em pt-BR para toasts e alertas das ações de membros e convites. */
export function getOrganizationMemberErrorMessage(error: unknown, action: OrganizationMemberAction): string {
  const { status } = parseApiError(error);

  switch (status) {
    case 401:
      return "Sua sessão expirou. Entre novamente para continuar.";
    case 403:
      return "Apenas administradores da organização podem gerenciar membros.";
    case 404:
      return NOT_FOUND[action];
    case 409:
      return "Este usuário já está vinculado ou possui um convite pendente nesta organização.";
    case undefined:
      return "Não foi possível conectar à Hubee. Verifique sua conexão e tente novamente.";
    default:
      return `${ACTION_FAILURE[action]} Tente novamente.`;
  }
}

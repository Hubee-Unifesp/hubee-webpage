import { z } from "zod";
import type {
  ConvidarMembroPayload,
  OrganizationMemberPermission,
  OrganizationMemberRole,
} from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";

export const INVITE_EMAIL_MAX_LENGTH = 255;

export interface MemberRolePresetOption {
  level: OrganizationAccessLevel;
  label: string;
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
  technicalLabel: string;
  description: string;
}

/** Matriz de papéis e permissões disponíveis no convite e alteração de membro (sem criar papéis extras). */
export const MEMBER_ROLE_PRESETS: readonly MemberRolePresetOption[] = [
  {
    level: "manage",
    label: "Administrador",
    role: "admin",
    permission: "full",
    technicalLabel: "admin · full",
    description: "Gerencia dados da organização, convida/remove membros e cria, edita ou cancela eventos.",
  },
  {
    level: "write",
    label: "Membro",
    role: "member",
    permission: "full",
    technicalLabel: "member · full",
    description: "Cria e edita eventos e lotes · Não altera membros nem dados da organização.",
  },
  {
    level: "read",
    label: "Leitor",
    role: "member",
    permission: "read_only",
    technicalLabel: "member · read_only",
    description: "Somente consulta eventos, métricas, equipe e fornecedores.",
  },
];

const emailFormat = z.email();

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Informe o e-mail do usuário convidado." })
    .max(INVITE_EMAIL_MAX_LENGTH, {
      error: `O e-mail deve ter no máximo ${INVITE_EMAIL_MAX_LENGTH} caracteres.`,
    })
    .refine((value) => emailFormat.safeParse(value).success, {
      error: "Informe um e-mail válido.",
    })
    .transform((value) => value.toLowerCase()),
  level: z.enum(["manage", "write", "read"], {
    error: "Selecione um papel válido para o membro.",
  }),
});

export type InviteMemberFormInputs = z.input<typeof inviteMemberSchema>;
export type InviteMemberFormValues = z.output<typeof inviteMemberSchema>;

export const emptyInviteMemberForm: InviteMemberFormInputs = {
  email: "",
  level: "write",
};

/** Converte o nível efetivo (`manage` | `write` | `read`) para `{ role, permission }` da API. */
export function toMemberRolePermission(level: OrganizationAccessLevel): {
  role: OrganizationMemberRole;
  permission: OrganizationMemberPermission;
} {
  if (level === "manage") return { role: "admin", permission: "full" };
  if (level === "write") return { role: "member", permission: "full" };
  return { role: "member", permission: "read_only" };
}

/** Converte `{ role, permission }` da API para o nível efetivo (`manage` | `write` | `read`). */
export function toMemberAccessLevel(
  role: string,
  permission: string,
): OrganizationAccessLevel {
  if (role === "admin" && permission === "full") return "manage";
  if (permission === "full") return "write";
  return "read";
}

/** Converte os valores validados do modal de convite no payload esperado pela API. */
export function toInviteMemberPayload(values: InviteMemberFormValues): ConvidarMembroPayload {
  const { role, permission } = toMemberRolePermission(values.level);
  return {
    email: values.email,
    role,
    permission,
  };
}

/** Extrai até duas iniciais do nome do membro para exibição no avatar. */
export function formatMemberInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

import type { EventCategory } from "@/lib/api/events.types";
import type { OrganizationAccessLevel, UsuarioOrganizacao } from "@/types/usuario";

/** Papel derivado do nível efetivo (`level`) ou da combinação `role` + `permission` em `organization_users`. */
export type PapelOrganizador = "administrador" | "membro" | "leitura";

/** Status do evento retornado pela `hubee-api`. */
export type StatusEvento = "published" | "draft" | "finished" | "cancelled";

/** Filtro de status na tela "Meus Eventos". */
export type FiltroStatusEvento = "all" | StatusEvento;

/** Organização vinculada ao usuário logado com convite aceito. */
export interface OrganizacaoVinculada {
  orgId: string;
  nome: string;
  role: "admin" | "member";
  permission: "full" | "read_only";
  level: OrganizationAccessLevel;
  papel: PapelOrganizador;
}

/** Evento formatado para o painel do organizador ("Meus Eventos"). */
export interface EventoOrganizador {
  id: string;
  nome: string;
  descricao: string;
  categoria: EventCategory;
  status: StatusEvento;
  dataInicio: string;
  dataFim: string;
  local: string;
  precoMinimo: number | null;
  loteMinimo: string | null;
  capacidade: number;
  ingressosVendidos: number;
  percentualVendido: number;
}

/**
 * Converte o nível efetivo (`level` retornado em `GET /auth/me` pela GOL-144) no papel semântico da interface:
 * - `manage` -> `administrador`
 * - `write` -> `membro`
 * - `read` -> `leitura`
 */
export function deriveOrganizerRoleFromLevel(level: OrganizationAccessLevel): PapelOrganizador {
  switch (level) {
    case "manage":
      return "administrador";
    case "write":
      return "membro";
    case "read":
      return "leitura";
  }
}

/**
 * Converte a dupla `role` + `permission` do banco no papel semântico da interface
 * (mesma precedência de `effectiveLevel` na `hubee-api`):
 * - `read_only` -> `leitura`
 * - `admin` + `full` -> `administrador`
 * - `member` + `full` -> `membro`
 */
export function deriveOrganizerRole(role: string, permission: string): PapelOrganizador {
  if (permission === "read_only") return "leitura";
  if (role === "admin") return "administrador";
  return "membro";
}

export function formatOrganizerRoleLabel(papel: PapelOrganizador): string {
  switch (papel) {
    case "administrador":
      return "Administrador";
    case "membro":
      return "Membro";
    case "leitura":
      return "Leitura";
  }
}

export function formatShortOrganizerRoleLabel(papel: PapelOrganizador): string {
  switch (papel) {
    case "administrador":
      return "Admin";
    case "membro":
      return "Membro";
    case "leitura":
      return "Leitura";
  }
}

export function canCreateOrEditEvent(papel: PapelOrganizador): boolean {
  return papel === "administrador" || papel === "membro";
}

export function canDuplicateEvent(papel: PapelOrganizador): boolean {
  return papel === "administrador" || papel === "membro";
}

export function canCancelEvent(papel: PapelOrganizador, status: StatusEvento): boolean {
  return papel === "administrador" && (status === "draft" || status === "published");
}

export function canViewPublicPage(status: StatusEvento): boolean {
  return status === "published" || status === "finished";
}

export function getPrimaryEventActionLabel(papel: PapelOrganizador, status: StatusEvento): string {
  if (papel === "leitura") return "Visualizar";
  if (status === "draft") return "Editar";
  return "Gerenciar";
}

export function calculateSoldPercentage(ticketsSold: number, capacity: number): number {
  if (capacity <= 0 || ticketsSold <= 0) return 0;
  return Math.min(100, Math.round((ticketsSold / capacity) * 100));
}

export function toOrganizacoesVinculadas(
  organizations?: readonly UsuarioOrganizacao[],
): OrganizacaoVinculada[] {
  if (!organizations) return [];
  return organizations.map((org) => {
    const papel = org.level
      ? deriveOrganizerRoleFromLevel(org.level)
      : deriveOrganizerRole(org.role, org.permission);
    return {
      orgId: org.orgId,
      nome: org.organizationName,
      role: org.role === "admin" ? "admin" : "member",
      permission: org.permission === "read_only" ? "read_only" : "full",
      level: org.level ?? (papel === "administrador" ? "manage" : papel === "membro" ? "write" : "read"),
      papel,
    };
  });
}

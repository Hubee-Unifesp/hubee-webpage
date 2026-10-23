import type { UserOrganization } from "@/lib/api/auth";
import type { EventCategory } from "@/lib/api/events.types";

/** Papel derivado da combinação `role` + `permission` em `organization_users`. */
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
 * Converte a dupla `role` + `permission` do banco no papel semântico da interface:
 * - `admin` + `full` -> `administrador`
 * - `member` + `full` -> `membro`
 * - `member` (ou qualquer role) + `read_only` -> `leitura`
 */
export function deriveOrganizerRole(
  role: "admin" | "member",
  permission: "full" | "read_only",
): PapelOrganizador {
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
  organizations?: readonly UserOrganization[],
): OrganizacaoVinculada[] {
  if (!organizations) return [];
  return organizations.map((org) => ({
    orgId: org.orgId,
    nome: org.name,
    role: org.role,
    permission: org.permission,
    papel: deriveOrganizerRole(org.role, org.permission),
  }));
}

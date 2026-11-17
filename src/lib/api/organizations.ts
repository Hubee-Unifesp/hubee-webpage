import { apiClient } from "./apiClient";
import { parseApiError } from "./errors";
import type {
  Organizacao,
  OrganizacaoAtualizarPayload,
  OrganizacaoCriarPayload,
} from "@/types/organizacao";

export type OrganizationAction = "load" | "create" | "update";

export async function getOrganizationById(id: string): Promise<Organizacao> {
  const response = await apiClient.get<Organizacao>(`/organizations/${id}`);
  return response.data;
}

/** O criador vira administrador (`manage`) da organização na própria API. Descrição vazia não é enviada. */
export async function createOrganization(payload: OrganizacaoCriarPayload): Promise<Organizacao> {
  const name = payload.name.trim();
  const description = payload.description?.trim();
  const response = await apiClient.post<Organizacao>("/organizations", {
    name,
    ...(description ? { description } : {}),
  });
  return response.data;
}

/** Exige nível `manage` na organização. */
export async function updateOrganization(
  id: string,
  payload: OrganizacaoAtualizarPayload,
): Promise<Organizacao> {
  const response = await apiClient.patch<Organizacao>(`/organizations/${id}`, payload);
  return response.data;
}

const ACTION_FAILURE: Record<OrganizationAction, string> = {
  load: "Não foi possível carregar os dados da organização.",
  create: "Não foi possível criar a organização.",
  update: "Não foi possível salvar as alterações da organização.",
};

/**
 * Texto em português para o `FormAlert` e o toast. A API devolve a validação em inglês e sem dizer o campo,
 * por isso o `400` usa uma mensagem fixa em vez do texto cru.
 */
export function getOrganizationErrorMessage(error: unknown, action: OrganizationAction): string {
  const { status } = parseApiError(error);

  switch (status) {
    case 400:
      return "Os dados informados são inválidos. Revise o nome e a descrição da organização.";
    case 401:
      return "Sua sessão expirou. Entre novamente para continuar.";
    case 403:
      return action === "update"
        ? "Apenas administradores da organização podem editar os dados cadastrais."
        : "Você não tem permissão para realizar esta ação.";
    case 404:
      return "Organização não encontrada ou sem vínculo com a sua conta.";
    default:
      return `${ACTION_FAILURE[action]} Verifique sua conexão e tente novamente.`;
  }
}

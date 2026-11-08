import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Organizacao } from "@/types/organizacao";

const { getMock, postMock, patchMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
  },
}));

import {
  createOrganization,
  getOrganizationById,
  getOrganizationErrorMessage,
  updateOrganization,
} from "./organizations";

const mockOrganization: Organizacao = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Atlética Unifesp",
  description: "Eventos esportivos e universitários.",
  representativeId: "22222222-2222-4222-8222-222222222222",
  createdAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-01T12:00:00.000Z",
};

function apiError(status: number, data: unknown = {}) {
  return new AxiosError("falhou", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data,
  } as AxiosResponse);
}

describe("organizations API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
  });

  it("getOrganizationById busca GET /organizations/:id", async () => {
    getMock.mockResolvedValue({ data: mockOrganization });

    const result = await getOrganizationById(mockOrganization.id);

    expect(getMock).toHaveBeenCalledWith(`/organizations/${mockOrganization.id}`);
    expect(result).toEqual(mockOrganization);
  });

  it("createOrganization envia nome e descricao para POST /organizations", async () => {
    postMock.mockResolvedValue({ data: mockOrganization });

    const result = await createOrganization({
      name: "Atlética Unifesp",
      description: "Eventos esportivos e universitários.",
    });

    expect(postMock).toHaveBeenCalledWith("/organizations", {
      name: "Atlética Unifesp",
      description: "Eventos esportivos e universitários.",
    });
    expect(result).toEqual(mockOrganization);
  });

  it("createOrganization nao envia descricao vazia nem representativeId", async () => {
    postMock.mockResolvedValue({ data: mockOrganization });

    await createOrganization({ name: "  Atlética Unifesp  ", description: "   " });

    expect(postMock).toHaveBeenCalledWith("/organizations", { name: "Atlética Unifesp" });
  });

  it("createOrganization propaga o erro da API para quem chamou tratar", async () => {
    const error = apiError(400);
    postMock.mockRejectedValue(error);

    await expect(createOrganization({ name: "A" })).rejects.toBe(error);
  });

  it("updateOrganization envia os campos para PATCH /organizations/:id", async () => {
    patchMock.mockResolvedValue({ data: { ...mockOrganization, name: "Nova Atlética" } });

    const result = await updateOrganization(mockOrganization.id, {
      name: "Nova Atlética",
      description: "",
    });

    expect(patchMock).toHaveBeenCalledWith(`/organizations/${mockOrganization.id}`, {
      name: "Nova Atlética",
      description: "",
    });
    expect(result.name).toBe("Nova Atlética");
  });

  it("updateOrganization propaga 403 de quem nao e administrador da organizacao", async () => {
    const error = apiError(403);
    patchMock.mockRejectedValue(error);

    await expect(updateOrganization(mockOrganization.id, { name: "X" })).rejects.toBe(error);
  });
});

describe("getOrganizationErrorMessage", () => {
  it("400 usa mensagem fixa em portugues, sem repassar o texto cru da API", () => {
    const message = getOrganizationErrorMessage(
      apiError(400, { message: ["name should not be empty"] }),
      "create",
    );

    expect(message).toContain("inválidos");
    expect(message).not.toContain("should not be empty");
  });

  it("401 avisa que a sessao expirou", () => {
    expect(getOrganizationErrorMessage(apiError(401), "create")).toContain("sessão expirou");
  });

  it("403 na edicao explica que so administradores editam", () => {
    expect(getOrganizationErrorMessage(apiError(403), "update")).toContain("administradores");
  });

  it("403 na criacao devolve a mensagem generica de permissao", () => {
    expect(getOrganizationErrorMessage(apiError(403), "create")).toBe(
      "Você não tem permissão para realizar esta ação.",
    );
  });

  it("404 informa que a organizacao nao foi encontrada", () => {
    expect(getOrganizationErrorMessage(apiError(404), "update")).toContain("não encontrada");
  });

  it.each([
    ["create", "Não foi possível criar a organização."],
    ["update", "Não foi possível salvar as alterações da organização."],
    ["load", "Não foi possível carregar os dados da organização."],
  ] as const)("sem resposta da API (%s) usa a mensagem de falha da acao", (action, expected) => {
    expect(getOrganizationErrorMessage(new AxiosError("Network Error"), action)).toContain(expected);
  });
});

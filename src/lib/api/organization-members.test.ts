import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

import {
  getMyInvites,
  getOrganizationMemberErrorMessage,
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  respondOrganizationInvite,
  toInviteStatus,
  updateOrganizationMember,
  type OrganizationMemberApi,
  type UserInviteApi,
} from "./organization-members";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

const apiMember: OrganizationMemberApi = {
  orgId: ORG_ID,
  userId: USER_ID,
  userName: "Ana Souza",
  userEmail: "ana@unifesp.br",
  role: "member",
  permission: "full",
  inviteStatus: "accepted",
  createdAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-01T12:00:00.000Z",
};

const apiInvite: UserInviteApi = {
  orgId: ORG_ID,
  organizationName: "Atlética Unifesp",
  userId: USER_ID,
  role: "admin",
  permission: "full",
  inviteStatus: "pending",
  createdAt: "2026-11-02T12:00:00.000Z",
  updatedAt: null,
};

function apiError(status: number, data: unknown = {}) {
  return new AxiosError("falhou", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data,
  } as AxiosResponse);
}

describe("organization members API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("getOrganizationMembers busca GET /organizations/:orgId/users e converte para a interface", async () => {
    getMock.mockResolvedValue({
      data: [apiMember, { ...apiMember, userId: "u2", role: "member", permission: "read_only", inviteStatus: "pending" }],
    });

    const result = await getOrganizationMembers(ORG_ID);

    expect(getMock).toHaveBeenCalledWith(`/organizations/${ORG_ID}/users`);
    expect(result).toEqual([
      {
        id: `${ORG_ID}-${USER_ID}`,
        orgId: ORG_ID,
        userId: USER_ID,
        fullName: "Ana Souza",
        email: "ana@unifesp.br",
        role: "member",
        permission: "full",
        level: "write",
        inviteStatus: "ACCEPTED",
      },
      expect.objectContaining({ userId: "u2", level: "read", permission: "read_only", inviteStatus: "PENDING" }),
    ]);
  });

  it("inviteOrganizationMember envia e-mail, role e permission para POST /organizations/:orgId/users", async () => {
    postMock.mockResolvedValue({ data: { ...apiMember, role: "admin", inviteStatus: "pending" } });
    const payload = { email: "ana@unifesp.br", role: "admin" as const, permission: "full" as const };

    const result = await inviteOrganizationMember(ORG_ID, payload);

    expect(postMock).toHaveBeenCalledWith(`/organizations/${ORG_ID}/users`, payload);
    expect(result).toMatchObject({ level: "manage", inviteStatus: "PENDING" });
  });

  it("updateOrganizationMember envia role e permission para PATCH /organizations/:orgId/users/:userId", async () => {
    patchMock.mockResolvedValue({ data: { ...apiMember, permission: "read_only" } });

    const result = await updateOrganizationMember(ORG_ID, USER_ID, { role: "member", permission: "read_only" });

    expect(patchMock).toHaveBeenCalledWith(`/organizations/${ORG_ID}/users/${USER_ID}`, {
      role: "member",
      permission: "read_only",
    });
    expect(result.level).toBe("read");
  });

  it("removeOrganizationMember chama DELETE /organizations/:orgId/users/:userId", async () => {
    deleteMock.mockResolvedValue({ data: undefined });

    await removeOrganizationMember(ORG_ID, USER_ID);

    expect(deleteMock).toHaveBeenCalledWith(`/organizations/${ORG_ID}/users/${USER_ID}`);
  });

  it("getMyInvites busca GET /users/me/invites e converte para convites pendentes", async () => {
    getMock.mockResolvedValue({ data: [apiInvite] });

    const result = await getMyInvites();

    expect(getMock).toHaveBeenCalledWith("/users/me/invites");
    expect(result).toEqual([
      {
        id: `${ORG_ID}-${USER_ID}`,
        orgId: ORG_ID,
        organizationName: "Atlética Unifesp",
        role: "admin",
        permission: "full",
        level: "manage",
        inviteStatus: "PENDING",
        createdAt: "2026-11-02T12:00:00.000Z",
      },
    ]);
  });

  it.each([
    ["ACCEPTED", "accepted"],
    ["DECLINED", "rejected"],
  ] as const)("respondOrganizationInvite envia %s como %s para PATCH /organizations/:orgId/users/me", async (resposta, enviado) => {
    patchMock.mockResolvedValue({ data: apiMember });

    await respondOrganizationInvite(ORG_ID, resposta);

    expect(patchMock).toHaveBeenCalledWith(`/organizations/${ORG_ID}/users/me`, { inviteStatus: enviado });
  });

  it("toInviteStatus converte os status da API e trata desconhecidos como pendente", () => {
    expect(toInviteStatus("pending")).toBe("PENDING");
    expect(toInviteStatus("accepted")).toBe("ACCEPTED");
    expect(toInviteStatus("rejected")).toBe("DECLINED");
    expect(toInviteStatus("ACCEPTED")).toBe("ACCEPTED");
    expect(toInviteStatus("outro")).toBe("PENDING");
  });

  describe("getOrganizationMemberErrorMessage", () => {
    it("explica 404 de convite como e-mail sem conta", () => {
      expect(getOrganizationMemberErrorMessage(apiError(404), "invite")).toMatch(/Nenhuma conta encontrada/);
    });

    it("explica 404 ao responder como convite indisponível", () => {
      expect(getOrganizationMemberErrorMessage(apiError(404), "respond")).toBe(
        "Este convite não está mais disponível.",
      );
    });

    it("explica 409 como usuário já vinculado", () => {
      expect(getOrganizationMemberErrorMessage(apiError(409), "invite")).toMatch(/já está vinculado/);
    });

    it("explica 403 como falta de permissão de administrador", () => {
      expect(getOrganizationMemberErrorMessage(apiError(403), "remove")).toMatch(/Apenas administradores/);
    });

    it("explica 401 como sessão expirada", () => {
      expect(getOrganizationMemberErrorMessage(apiError(401), "load")).toMatch(/sessão expirou/);
    });

    it("usa mensagem de conexão quando a API não responde", () => {
      expect(getOrganizationMemberErrorMessage(new AxiosError("Network Error"), "load")).toMatch(/conectar/);
    });

    it("usa a falha da ação para outros status", () => {
      expect(getOrganizationMemberErrorMessage(apiError(500), "update")).toBe(
        "Não foi possível atualizar o papel do membro. Tente novamente.",
      );
    });
  });
});

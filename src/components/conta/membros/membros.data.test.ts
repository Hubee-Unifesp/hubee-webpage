import { describe, expect, it } from "vitest";
import type { MembroOrganizacao } from "@/types/membro-organizacao";
import { canManageMembers, filterMembers, TODOS_PAPEIS, TODOS_STATUS } from "./membros.data";

const mockMembers: readonly MembroOrganizacao[] = [
  {
    id: "m-1",
    userId: "u-1",
    orgId: "org-1",
    fullName: "Organizador Hubee",
    email: "organizador@hubee.com.br",
    role: "admin",
    permission: "full",
    level: "manage",
    inviteStatus: "ACCEPTED",
    isOwner: true,
  },
  {
    id: "m-2",
    userId: "u-2",
    orgId: "org-1",
    fullName: "José Ferreira",
    email: "equipe@hubee.com.br",
    role: "member",
    permission: "full",
    level: "write",
    inviteStatus: "ACCEPTED",
  },
  {
    id: "m-3",
    userId: "u-3",
    orgId: "org-1",
    fullName: "Rafael Souza",
    email: "rafael.souza@unifesp.br",
    role: "member",
    permission: "full",
    level: "write",
    inviteStatus: "PENDING",
  },
  {
    id: "m-4",
    userId: "u-4",
    orgId: "org-1",
    fullName: "Camila Nunes",
    email: "camila.nunes@unifesp.br",
    role: "member",
    permission: "read_only",
    level: "read",
    inviteStatus: "DECLINED",
  },
];

describe("membros.data", () => {
  it("libera gestão de membros apenas para nível manage (Administrador)", () => {
    expect(canManageMembers("manage")).toBe(true);
    expect(canManageMembers("write")).toBe(false);
    expect(canManageMembers("read")).toBe(false);
    expect(canManageMembers(null)).toBe(false);
    expect(canManageMembers(undefined)).toBe(false);
  });

  it("filtra membros por busca de nome (ignorando acentos) ou e-mail", () => {
    expect(filterMembers(mockMembers, "jose", TODOS_PAPEIS, TODOS_STATUS).map((m) => m.id)).toEqual(["m-2"]);
    expect(filterMembers(mockMembers, "unifesp.br", TODOS_PAPEIS, TODOS_STATUS).map((m) => m.id)).toEqual([
      "m-3",
      "m-4",
    ]);
  });

  it("filtra por papel e status do convite combinados", () => {
    expect(filterMembers(mockMembers, "", "write", "PENDING").map((m) => m.id)).toEqual(["m-3"]);
    expect(filterMembers(mockMembers, "", "read", "DECLINED").map((m) => m.id)).toEqual(["m-4"]);
    expect(filterMembers(mockMembers, "", "manage", "PENDING")).toEqual([]);
  });
});

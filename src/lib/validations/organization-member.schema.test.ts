import { describe, expect, it } from "vitest";
import {
  emptyInviteMemberForm,
  formatMemberInitials,
  INVITE_EMAIL_MAX_LENGTH,
  inviteMemberSchema,
  toInviteMemberPayload,
  toMemberAccessLevel,
  toMemberRolePermission,
} from "./organization-member.schema";

describe("inviteMemberSchema", () => {
  it("recusa e-mail vazio ou composto apenas por espaços", () => {
    const empty = inviteMemberSchema.safeParse({ email: "", level: "write" });
    const spaces = inviteMemberSchema.safeParse({ email: "   ", level: "write" });

    expect(empty.success).toBe(false);
    expect(spaces.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe("Informe o e-mail do usuário convidado.");
    }
  });

  it("recusa e-mail em formato inválido", () => {
    const parsed = inviteMemberSchema.safeParse({ email: "usuario-invalido", level: "write" });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe um e-mail válido.");
    }
  });

  it("recusa e-mail acima do limite máximo de caracteres", () => {
    const longEmail = `${"a".repeat(INVITE_EMAIL_MAX_LENGTH)}@hubee.com.br`;
    const parsed = inviteMemberSchema.safeParse({ email: longEmail, level: "write" });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toContain(String(INVITE_EMAIL_MAX_LENGTH));
    }
  });

  it("recusa nível de acesso fora da matriz permitida", () => {
    const parsed = inviteMemberSchema.safeParse({ email: "pessoa@unifesp.br", level: "superadmin" });
    expect(parsed.success).toBe(false);
  });

  it("normaliza e-mail com trim e minúsculas e gera o payload da API", () => {
    const parsed = inviteMemberSchema.safeParse({
      email: "  Rafael.Souza@UNIFESP.br  ",
      level: "manage",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        email: "rafael.souza@unifesp.br",
        level: "manage",
      });
      expect(toInviteMemberPayload(parsed.data)).toEqual({
        email: "rafael.souza@unifesp.br",
        role: "admin",
        permission: "full",
      });
    }
  });

  it("define Membro (write) como padrão inicial do formulário", () => {
    expect(emptyInviteMemberForm).toEqual({ email: "", level: "write" });
  });
});

describe("helpers de papel e permissão de membros", () => {
  it("mapeia os três níveis efetivos corretamente entre UI e API", () => {
    expect(toMemberRolePermission("manage")).toEqual({ role: "admin", permission: "full" });
    expect(toMemberRolePermission("write")).toEqual({ role: "member", permission: "full" });
    expect(toMemberRolePermission("read")).toEqual({ role: "member", permission: "read_only" });

    expect(toMemberAccessLevel("admin", "full")).toBe("manage");
    expect(toMemberAccessLevel("member", "full")).toBe("write");
    expect(toMemberAccessLevel("member", "read_only")).toBe("read");
  });

  it("formata iniciais do nome do membro com fallback seguro", () => {
    expect(formatMemberInitials("Organizador Hubee")).toBe("OH");
    expect(formatMemberInitials("Rafael Silva Souza")).toBe("RS");
    expect(formatMemberInitials("Bianca")).toBe("BI");
    expect(formatMemberInitials("   ")).toBe("?");
  });
});

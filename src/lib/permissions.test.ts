import { describe, expect, it } from "vitest";
import type { UsuarioOrganizacao } from "@/types/usuario";
import { canCreateEvents, isOrganizer } from "./permissions";

const organization = (level: UsuarioOrganizacao["level"]): UsuarioOrganizacao => ({
  orgId: "org-1",
  organizationName: "Atlética Unifesp",
  role: "member",
  permission: level === "read" ? "read_only" : "full",
  level,
});

describe("isOrganizer", () => {
  it("é falso sem usuário, sem organizações ou com a lista ausente", () => {
    expect(isOrganizer(null)).toBe(false);
    expect(isOrganizer({ role: "USER", organizations: [] })).toBe(false);
    expect(isOrganizer({ role: "USER" })).toBe(false);
  });

  it("é verdadeiro com qualquer organização, inclusive só leitura", () => {
    expect(isOrganizer({ role: "USER", organizations: [organization("read")] })).toBe(true);
  });
});

describe("canCreateEvents", () => {
  it("permite nível write ou manage", () => {
    expect(canCreateEvents({ role: "USER", organizations: [organization("write")] })).toBe(true);
    expect(canCreateEvents({ role: "USER", organizations: [organization("manage")] })).toBe(true);
  });

  it("nega só leitura, comprador e sessão ausente", () => {
    expect(canCreateEvents({ role: "USER", organizations: [organization("read")] })).toBe(false);
    expect(canCreateEvents({ role: "USER", organizations: [] })).toBe(false);
    expect(canCreateEvents(undefined)).toBe(false);
  });

  it("permite ADMIN mesmo sem organização", () => {
    expect(canCreateEvents({ role: "ADMIN", organizations: [] })).toBe(true);
  });
});

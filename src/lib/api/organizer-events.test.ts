import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGet, publicGet } = vi.hoisted(() => ({
  authGet: vi.fn(),
  publicGet: vi.fn(),
}));

vi.mock("./apiClient", () => ({ apiClient: { get: authGet } }));
vi.mock("./client", () => ({ apiClient: { get: publicGet } }));

import {
  getOrganizerEvents,
  resolveUserOrganizations,
  toEventoOrganizador,
} from "./events";
import {
  calculateSoldPercentage,
  canCancelEvent,
  canCreateOrEditEvent,
  canDuplicateEvent,
  canViewPublicPage,
  deriveOrganizerRole,
  formatOrganizerRoleLabel,
  getPrimaryEventActionLabel,
  toOrganizacoesVinculadas,
} from "@/types/organizacao";

describe("regras de papel e permissões do organizador (RBAC)", () => {
  it("deriva o papel semântico a partir de role e permission", () => {
    expect(deriveOrganizerRole("admin", "full")).toBe("administrador");
    expect(deriveOrganizerRole("member", "full")).toBe("membro");
    expect(deriveOrganizerRole("member", "read_only")).toBe("leitura");
    expect(deriveOrganizerRole("admin", "read_only")).toBe("leitura");
  });

  it("formata o rótulo em português para exibição na interface", () => {
    expect(formatOrganizerRoleLabel("administrador")).toBe("Administrador");
    expect(formatOrganizerRoleLabel("membro")).toBe("Membro");
    expect(formatOrganizerRoleLabel("leitura")).toBe("Leitura");
  });

  it("permite criar, editar e duplicar apenas para administrador e membro", () => {
    expect(canCreateOrEditEvent("administrador")).toBe(true);
    expect(canCreateOrEditEvent("membro")).toBe(true);
    expect(canCreateOrEditEvent("leitura")).toBe(false);

    expect(canDuplicateEvent("administrador")).toBe(true);
    expect(canDuplicateEvent("membro")).toBe(true);
    expect(canDuplicateEvent("leitura")).toBe(false);
  });

  it("permite cancelar evento apenas para administrador em rascunho ou publicado", () => {
    expect(canCancelEvent("administrador", "draft")).toBe(true);
    expect(canCancelEvent("administrador", "published")).toBe(true);
    expect(canCancelEvent("administrador", "finished")).toBe(false);
    expect(canCancelEvent("administrador", "cancelled")).toBe(false);

    expect(canCancelEvent("membro", "draft")).toBe(false);
    expect(canCancelEvent("membro", "published")).toBe(false);
    expect(canCancelEvent("leitura", "published")).toBe(false);
  });

  it("exibe link para página pública apenas para eventos publicados ou encerrados", () => {
    expect(canViewPublicPage("published")).toBe(true);
    expect(canViewPublicPage("finished")).toBe(true);
    expect(canViewPublicPage("draft")).toBe(false);
    expect(canViewPublicPage("cancelled")).toBe(false);
  });

  it("define o rótulo da ação principal do cartão conforme papel e status", () => {
    expect(getPrimaryEventActionLabel("leitura", "draft")).toBe("Visualizar");
    expect(getPrimaryEventActionLabel("leitura", "published")).toBe("Visualizar");
    expect(getPrimaryEventActionLabel("administrador", "draft")).toBe("Editar");
    expect(getPrimaryEventActionLabel("membro", "draft")).toBe("Editar");
    expect(getPrimaryEventActionLabel("administrador", "published")).toBe("Gerenciar");
    expect(getPrimaryEventActionLabel("membro", "finished")).toBe("Gerenciar");
  });

  it("converte organizações da sessão para o modelo de domínio", () => {
    expect(toOrganizacoesVinculadas(undefined)).toEqual([]);
    expect(
      toOrganizacoesVinculadas([
        { orgId: "org-1", name: "AAACH", role: "admin", permission: "full" },
        { orgId: "org-2", name: "CA SI", role: "member", permission: "read_only" },
      ]),
    ).toEqual([
      { orgId: "org-1", nome: "AAACH", role: "admin", permission: "full", papel: "administrador" },
      { orgId: "org-2", nome: "CA SI", role: "member", permission: "read_only", papel: "leitura" },
    ]);
  });
});

describe("calculateSoldPercentage", () => {
  it("retorna 0 quando capacidade ou vendas forem zero ou negativas", () => {
    expect(calculateSoldPercentage(0, 0)).toBe(0);
    expect(calculateSoldPercentage(10, 0)).toBe(0);
    expect(calculateSoldPercentage(0, 100)).toBe(0);
  });

  it("calcula o percentual arredondado e limita a 100%", () => {
    expect(calculateSoldPercentage(342, 500)).toBe(68);
    expect(calculateSoldPercentage(189, 250)).toBe(76);
    expect(calculateSoldPercentage(200, 200)).toBe(100);
    expect(calculateSoldPercentage(250, 200)).toBe(100);
  });
});

describe("resolveUserOrganizations", () => {
  beforeEach(() => {
    authGet.mockReset();
    publicGet.mockReset();
  });

  it("usa user.organizations diretamente quando já estiver presente na sessão (pós-GOL-144)", async () => {
    const result = await resolveUserOrganizations({
      id: "user-1",
      organizations: [{ orgId: "org-1", name: "AAACH", role: "member", permission: "full" }],
    });

    expect(result).toEqual([
      { orgId: "org-1", nome: "AAACH", role: "member", permission: "full", papel: "membro" },
    ]);
    expect(publicGet).not.toHaveBeenCalled();
  });

  it("filtra vínculos aceitos via /organizations e /organizations/:orgId/users quando disponível", async () => {
    publicGet.mockResolvedValueOnce({
      data: [
        { id: "org-1", name: "AAACH" },
        { id: "org-2", name: "CA SI" },
      ],
    });
    authGet.mockImplementation((url: string) => {
      if (url === "/organizations/org-1/users") {
        return Promise.resolve({
          data: [
            { orgId: "org-1", userId: "user-1", role: "member", permission: "read_only", inviteStatus: "accepted" },
          ],
        });
      }
      return Promise.resolve({
        data: [
          { orgId: "org-2", userId: "user-1", role: "admin", permission: "full", inviteStatus: "pending" },
        ],
      });
    });

    const result = await resolveUserOrganizations({ id: "user-1", signupIntent: "BUY" });

    expect(result).toEqual([
      { orgId: "org-1", nome: "AAACH", role: "member", permission: "read_only", papel: "leitura" },
    ]);
  });

  it("usa fallback com signupIntent === 'ORGANIZE' quando /organizations/:orgId/users retorna 403 (pré-GOL-144)", async () => {
    publicGet.mockResolvedValueOnce({
      data: [{ id: "org-1", name: "AAACH — Atlética de Artes, Ciências e Humanidades" }],
    });
    authGet.mockRejectedValue(new Error("403 Forbidden"));

    const result = await resolveUserOrganizations({ id: "user-1", signupIntent: "ORGANIZE" });

    expect(result).toEqual([
      {
        orgId: "org-1",
        nome: "AAACH — Atlética de Artes, Ciências e Humanidades",
        role: "admin",
        permission: "full",
        papel: "administrador",
      },
    ]);
  });
});

describe("getOrganizerEvents & toEventoOrganizador", () => {
  beforeEach(() => {
    authGet.mockReset();
    publicGet.mockReset();
  });

  it("mapeia os campos do evento da API para EventoOrganizador", () => {
    const mapped = toEventoOrganizador({
      id: "ev-1",
      name: "Bixos 2026 — A Recepção",
      description: "Recepção oficial dos calouros",
      organizerId: "org-1",
      venueId: "v-1",
      startDate: "2026-04-28T22:00:00Z",
      endDate: "2026-04-29T04:00:00Z",
      category: "Festas",
      status: "published",
      featured: true,
      venueName: "Espaço Leste",
      venueCity: "São Paulo",
      minPrice: 40,
      minPriceBatch: "1º Lote",
      capacity: 500,
      ticketsSold: 342,
    });

    expect(mapped).toEqual({
      id: "ev-1",
      nome: "Bixos 2026 — A Recepção",
      descricao: "Recepção oficial dos calouros",
      categoria: "festas",
      status: "published",
      dataInicio: "2026-04-28T22:00:00Z",
      dataFim: "2026-04-29T04:00:00Z",
      local: "Espaço Leste · São Paulo",
      precoMinimo: 40,
      loteMinimo: "1º Lote",
      capacidade: 500,
      ingressosVendidos: 342,
      percentualVendido: 68,
    });
  });

  it("calcula capacidade e preço mínimo a partir de /events/:id/ticket-types quando não vêm em /events", async () => {
    authGet.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "ev-1",
            name: "Noite do Calouro",
            description: null,
            organizerId: "org-1",
            venueId: "v-1",
            startDate: "2026-06-12T22:00:00Z",
            endDate: "2026-06-13T04:00:00Z",
            category: "Festas",
            status: "published",
            featured: false,
            venueName: "Quadra",
            venueCity: "São Paulo",
            minPrice: null,
            minPriceBatch: null,
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      },
    });
    publicGet.mockResolvedValueOnce({
      data: [
        { id: "tt-1", batch: "1º Lote", price: "35.00", quantity: 150 },
        { id: "tt-2", batch: "2º Lote", price: "50.00", quantity: 100 },
      ],
    });

    const result = await getOrganizerEvents({ organizerId: "org-1" });

    expect(authGet).toHaveBeenCalledWith("/events", {
      params: { limit: 50, organizerId: "org-1" },
    });
    expect(publicGet).toHaveBeenCalledWith("/events/ev-1/ticket-types");
    expect(result[0]).toMatchObject({
      id: "ev-1",
      nome: "Noite do Calouro",
      local: "Quadra · São Paulo",
      precoMinimo: 35,
      loteMinimo: "1º Lote",
      capacidade: 250,
      ingressosVendidos: 0,
      percentualVendido: 0,
    });
  });
});

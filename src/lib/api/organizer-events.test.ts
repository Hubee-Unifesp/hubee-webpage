import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOrganizerEvents, resolveUserOrganizations, toEventoOrganizador } from "./events";
import {
  calculateSoldPercentage,
  canCancelEvent,
  canCreateOrEditEvent,
  canDuplicateEvent,
  canViewPublicPage,
  deriveOrganizerRole,
  deriveOrganizerRoleFromLevel,
  formatOrganizerRoleLabel,
  formatShortOrganizerRoleLabel,
  getPrimaryEventActionLabel,
  toOrganizacoesVinculadas,
} from "@/types/organizacao";

const { getAuthMock, getPublicMock } = vi.hoisted(() => ({
  getAuthMock: vi.fn(),
  getPublicMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: { get: getAuthMock },
}));

vi.mock("./client", () => ({
  apiClient: { get: getPublicMock },
}));

describe("organizacao helpers (RBAC e cálculos)", () => {
  it("deriva o papel a partir de level (manage, write, read)", () => {
    expect(deriveOrganizerRoleFromLevel("manage")).toBe("administrador");
    expect(deriveOrganizerRoleFromLevel("write")).toBe("membro");
    expect(deriveOrganizerRoleFromLevel("read")).toBe("leitura");
  });

  it("deriva o papel correto a partir de role + permission", () => {
    expect(deriveOrganizerRole("admin", "full")).toBe("administrador");
    expect(deriveOrganizerRole("member", "full")).toBe("membro");
    expect(deriveOrganizerRole("member", "read_only")).toBe("leitura");
    expect(deriveOrganizerRole("admin", "read_only")).toBe("leitura");
  });

  it("formata os rótulos completos e curtos dos papéis", () => {
    expect(formatOrganizerRoleLabel("administrador")).toBe("Administrador");
    expect(formatOrganizerRoleLabel("membro")).toBe("Membro");
    expect(formatOrganizerRoleLabel("leitura")).toBe("Leitura");

    expect(formatShortOrganizerRoleLabel("administrador")).toBe("Admin");
    expect(formatShortOrganizerRoleLabel("membro")).toBe("Membro");
    expect(formatShortOrganizerRoleLabel("leitura")).toBe("Leitura");
  });

  it("aplica as permissões de criar/editar, duplicar e cancelar por papel e status", () => {
    expect(canCreateOrEditEvent("administrador")).toBe(true);
    expect(canCreateOrEditEvent("membro")).toBe(true);
    expect(canCreateOrEditEvent("leitura")).toBe(false);

    expect(canDuplicateEvent("administrador")).toBe(true);
    expect(canDuplicateEvent("membro")).toBe(true);
    expect(canDuplicateEvent("leitura")).toBe(false);

    expect(canCancelEvent("administrador", "published")).toBe(true);
    expect(canCancelEvent("administrador", "draft")).toBe(true);
    expect(canCancelEvent("administrador", "finished")).toBe(false);
    expect(canCancelEvent("administrador", "cancelled")).toBe(false);
    expect(canCancelEvent("membro", "published")).toBe(false);
    expect(canCancelEvent("leitura", "published")).toBe(false);
  });

  it("define corretamente quando a página pública pode ser aberta", () => {
    expect(canViewPublicPage("published")).toBe(true);
    expect(canViewPublicPage("finished")).toBe(true);
    expect(canViewPublicPage("draft")).toBe(true);
    expect(canViewPublicPage("cancelled")).toBe(false);
  });

  it("retorna o rótulo da ação principal por papel e status", () => {
    expect(getPrimaryEventActionLabel("leitura", "published")).toBe("Visualizar");
    expect(getPrimaryEventActionLabel("leitura", "draft")).toBe("Visualizar");
    expect(getPrimaryEventActionLabel("administrador", "draft")).toBe("Editar");
    expect(getPrimaryEventActionLabel("membro", "draft")).toBe("Editar");
    expect(getPrimaryEventActionLabel("administrador", "published")).toBe("Gerenciar");
    expect(getPrimaryEventActionLabel("membro", "finished")).toBe("Gerenciar");
  });

  it("calcula o percentual vendido truncando entre 0 e 100", () => {
    expect(calculateSoldPercentage(0, 0)).toBe(0);
    expect(calculateSoldPercentage(0, 200)).toBe(0);
    expect(calculateSoldPercentage(50, 200)).toBe(25);
    expect(calculateSoldPercentage(250, 200)).toBe(100);
  });

  it("mapeia a lista de organizações do usuário em OrganizacaoVinculada usando organizationName e level", () => {
    const result = toOrganizacoesVinculadas([
      {
        orgId: "org-1",
        organizationName: "Atlética Unifesp",
        role: "admin",
        permission: "full",
        level: "manage",
      },
      {
        orgId: "org-2",
        organizationName: "Bateria",
        role: "member",
        permission: "read_only",
        level: "read",
      },
    ]);

    expect(result).toEqual([
      {
        orgId: "org-1",
        nome: "Atlética Unifesp",
        role: "admin",
        permission: "full",
        level: "manage",
        papel: "administrador",
      },
      {
        orgId: "org-2",
        nome: "Bateria",
        role: "member",
        permission: "read_only",
        level: "read",
        papel: "leitura",
      },
    ]);
  });
});

describe("resolveUserOrganizations", () => {
  it("retorna as organizações vindas em user.organizations", () => {
    const resolved = resolveUserOrganizations({
      id: "user-1",
      organizations: [
        {
          orgId: "org-1",
          organizationName: "DAComp",
          role: "member",
          permission: "full",
          level: "write",
        },
      ],
    });

    expect(resolved).toEqual([
      {
        orgId: "org-1",
        nome: "DAComp",
        role: "member",
        permission: "full",
        level: "write",
        papel: "membro",
      },
    ]);
  });

  it("retorna lista vazia quando user é nulo ou não possui organizações vinculadas", () => {
    expect(resolveUserOrganizations(null)).toEqual([]);
    expect(resolveUserOrganizations({ id: "user-1" })).toEqual([]);
    expect(resolveUserOrganizations({ id: "user-1", organizations: [] })).toEqual([]);
  });
});

describe("getOrganizerEvents & toEventoOrganizador", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
    getPublicMock.mockReset();
  });

  it("mapeia resposta paginada de /events quando capacity já está presente", async () => {
    getAuthMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "evt-1",
            name: "Festa do Bixo",
            description: "Recepção",
            organizerId: "org-1",
            venueId: "ven-1",
            startDate: "2026-05-10T22:00:00.000Z",
            endDate: "2026-05-11T04:00:00.000Z",
            status: "published",
            category: "Festas",
            featured: true,
            venueName: "Quadra",
            venueCity: "São José dos Campos",
            minPrice: "45.00",
            minPriceBatch: "1º Lote",
            capacity: 200,
            ticketsSold: 50,
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      },
    });

    getPublicMock.mockResolvedValueOnce({ data: [] });

    const events = await getOrganizerEvents({ organizerId: "org-1" });

    expect(getAuthMock).toHaveBeenCalledWith("/events", {
      params: { limit: 50, organizerId: "org-1" },
    });
    expect(getPublicMock).toHaveBeenCalledWith("/events/summary");
    expect(getPublicMock).not.toHaveBeenCalledWith(expect.stringContaining("/ticket-types"));
    expect(events).toEqual([
      {
        id: "evt-1",
        nome: "Festa do Bixo",
        descricao: "Recepção",
        categoria: "festas",
        status: "published",
        dataInicio: "2026-05-10T22:00:00.000Z",
        dataFim: "2026-05-11T04:00:00.000Z",
        local: "Quadra · São José dos Campos",
        precoMinimo: 45,
        loteMinimo: "1º Lote",
        capacidade: 200,
        ingressosVendidos: 50,
        percentualVendido: 25,
      },
    ]);
  });

  it("enriquece a capacidade via /events/:id/ticket-types quando capacity não vem em /events nem em summary", async () => {
    getAuthMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "evt-2",
            name: "Workshop IA",
            description: null,
            organizerId: "org-1",
            venueId: "ven-2",
            startDate: "2026-06-01T14:00:00.000Z",
            endDate: "2026-06-01T18:00:00.000Z",
            status: "draft",
            category: "Palestras",
            featured: false,
            venueName: "Auditório",
            venueCity: "São Paulo",
            minPrice: null,
            minPriceBatch: null,
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      },
    });
    getPublicMock
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          { id: "tt-1", batch: "Lote Promocional", price: "20.00", quantity: 40 },
          { id: "tt-2", batch: "2º Lote", price: "35.00", quantity: 60 },
        ],
      });

    const events = await getOrganizerEvents({ organizerId: "org-1" });

    expect(getPublicMock).toHaveBeenCalledWith("/events/summary");
    expect(getPublicMock).toHaveBeenCalledWith("/events/evt-2/ticket-types");
    expect(events[0]?.capacidade).toBe(100);
    expect(events[0]?.precoMinimo).toBe(20);
    expect(events[0]?.loteMinimo).toBe("Lote Promocional");
  });

  it("mescla capacity e ticketsSold a partir de /events/summary para evento publicado sem chamar /ticket-types", async () => {
    getAuthMock.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: "evt-published",
            name: "Festival de Inverno",
            description: null,
            organizerId: "org-1",
            venueId: "ven-3",
            startDate: "2026-07-15T20:00:00.000Z",
            endDate: "2026-07-16T02:00:00.000Z",
            status: "published",
            category: "Shows",
            featured: false,
            venueName: "Parque",
            venueCity: "Campos do Jordão",
            minPrice: "50.00",
            minPriceBatch: "1º Lote",
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      },
    });
    getPublicMock.mockResolvedValueOnce({
      data: [
        {
          id: "evt-published",
          name: "Festival de Inverno",
          description: null,
          category: "Shows",
          startDate: "2026-07-15T20:00:00.000Z",
          endDate: "2026-07-16T02:00:00.000Z",
          featured: false,
          organizerName: "Org 1",
          venueName: "Parque",
          venueCity: "Campos do Jordão",
          minPrice: 50,
          minPriceBatch: "1º Lote",
          capacity: 500,
          ticketsSold: 350,
        },
      ],
    });

    const events = await getOrganizerEvents({ organizerId: "org-1" });

    expect(getPublicMock).toHaveBeenCalledWith("/events/summary");
    expect(getPublicMock).not.toHaveBeenCalledWith("/events/evt-published/ticket-types");
    expect(events[0]?.capacidade).toBe(500);
    expect(events[0]?.ingressosVendidos).toBe(350);
    expect(events[0]?.percentualVendido).toBe(70);
  });

  it("usa 'Local a definir' quando venueName e venueCity estão ausentes", () => {
    const mapped = toEventoOrganizador({
      id: "evt-3",
      name: "Evento Sem Local",
      description: null,
      organizerId: "org-1",
      venueId: "ven-1",
      startDate: "2026-07-01T10:00:00.000Z",
      endDate: "2026-07-01T12:00:00.000Z",
      category: null,
      featured: false,
    });

    expect(mapped.local).toBe("Local a definir");
    expect(mapped.status).toBe("draft");
  });
});

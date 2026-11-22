import { describe, expect, it } from "vitest";
import {
  buyerAccountNavItems,
  formatBadgeCount,
  formatCartLabel,
  formatNotificationsLabel,
  getAccountNavGroups,
  getAccountNavItems,
  getProfileMenuItems,
  membersNavItem,
  myTicketsNavItem,
  organizerEventsNavItem,
  organizerManageEventsNavItem,
  suppliersNavItem,
} from "./account-nav.config";

describe("account-nav.config", () => {
  it("aponta as rotas de organizador para a página dedicada /meus-eventos", () => {
    expect(organizerEventsNavItem.href).toBe("/meus-eventos");
    expect(organizerManageEventsNavItem.href).toBe("/meus-eventos");
  });

  it("mostra Meus ingressos, pedidos e perfil no menu mobile para quem não pertence a uma organização", () => {
    expect(getAccountNavItems().map((i) => i.href)).toEqual([
      "/meus-ingressos",
      "/conta/pedidos",
      "/conta/perfil",
    ]);
    expect(getAccountNavItems(false)).toEqual([myTicketsNavItem, ...buyerAccountNavItems]);
  });

  it("acrescenta Meus eventos, Fornecedores e Membros no menu mobile para membros de organizações", () => {
    expect(getAccountNavItems(true).map((i) => i.href)).toEqual([
      "/meus-ingressos",
      "/meus-eventos",
      "/conta/pedidos",
      "/conta/perfil",
      "/conta/fornecedores",
      "/conta/membros",
    ]);
    expect(suppliersNavItem.organizerOnly).toBe(true);
    expect(membersNavItem.organizerOnly).toBe(true);
  });

  it("retorna Meus ingressos, pedidos e perfil no dropdown do perfil e acrescenta Meus eventos para organizadores", () => {
    expect(getProfileMenuItems(false).map((i) => i.href)).toEqual([
      "/meus-ingressos",
      "/conta/pedidos",
      "/conta/perfil",
    ]);
    expect(getProfileMenuItems(true).map((i) => i.href)).toEqual([
      "/meus-ingressos",
      "/meus-eventos",
      "/conta/pedidos",
      "/conta/perfil",
    ]);
  });

  it("agrupa a sidebar em Minha Conta e, para organizadores, Organização com Fornecedores e Membros", () => {
    expect(getAccountNavGroups(false).map((group) => group.label)).toEqual(["Minha Conta"]);

    const grupos = getAccountNavGroups(true);
    expect(grupos.map((group) => group.label)).toEqual(["Minha Conta", "Organização"]);
    expect(grupos[0].items).toEqual(buyerAccountNavItems);
    expect(grupos[1].items.map((item) => item.href)).toEqual([
      "/conta/fornecedores",
      "/conta/membros",
    ]);
  });

  it("formata o label do carrinho de acordo com a quantidade", () => {
    expect(formatCartLabel(0)).toBe("Carrinho vazio");
    expect(formatCartLabel(1)).toBe("Carrinho, 1 item");
    expect(formatCartLabel(3)).toBe("Carrinho, 3 itens");
  });

  it("formata o label de notificações e trunca o badge em 99+", () => {
    expect(formatNotificationsLabel(0)).toBe("Notificações");
    expect(formatNotificationsLabel(1)).toBe("Notificações, 1 não lida");
    expect(formatNotificationsLabel(3)).toBe("Notificações, 3 não lidas");
    expect(formatBadgeCount(3)).toBe("3");
    expect(formatBadgeCount(99)).toBe("99");
    expect(formatBadgeCount(128)).toBe("99+");
  });
});

import { describe, expect, it } from "vitest";
import {
  buyerAccountNavItems,
  formatCartLabel,
  getAccountNavItems,
  organizerEventsNavItem,
  organizerManageEventsNavItem,
} from "./account-nav.config";

describe("account-nav.config", () => {
  it("aponta as rotas de organizador para a página dedicada /meus-eventos", () => {
    expect(organizerEventsNavItem.href).toBe("/meus-eventos");
    expect(organizerManageEventsNavItem.href).toBe("/meus-eventos");
  });

  it("mantém a navegação da conta pessoal restrita a pedidos e perfil", () => {
    const items = getAccountNavItems();
    const hrefs = items.map((i) => i.href);

    expect(hrefs).toEqual(["/conta/pedidos", "/conta/perfil"]);
    expect(hrefs).not.toContain("/conta/eventos");
    expect(hrefs).not.toContain("/meus-eventos");
  });

  it("garante consistência entre buyerAccountNavItems e getAccountNavItems", () => {
    expect(getAccountNavItems()).toEqual(buyerAccountNavItems);
  });

  it("formata o label do carrinho de acordo com a quantidade", () => {
    expect(formatCartLabel(0)).toBe("Carrinho vazio");
    expect(formatCartLabel(1)).toBe("Carrinho, 1 item");
    expect(formatCartLabel(3)).toBe("Carrinho, 3 itens");
  });
});

import { describe, expect, it } from "vitest";
import {
  buyerAccountNavItems,
  formatCartLabel,
  getAccountNavItems,
  organizerEventsNavItem,
  organizerManageEventsNavItem,
  suppliersNavItem,
} from "./account-nav.config";

describe("account-nav.config", () => {
  it("aponta as rotas de organizador para a página dedicada /meus-eventos", () => {
    expect(organizerEventsNavItem.href).toBe("/meus-eventos");
    expect(organizerManageEventsNavItem.href).toBe("/meus-eventos");
  });

  it("mostra só pedidos e perfil para quem não pertence a uma organização", () => {
    expect(getAccountNavItems().map((i) => i.href)).toEqual(["/conta/pedidos", "/conta/perfil"]);
    expect(getAccountNavItems(false)).toEqual(buyerAccountNavItems);
  });

  it("acrescenta Fornecedores para membros de organizações, depois das seções pessoais", () => {
    expect(getAccountNavItems(true).map((i) => i.href)).toEqual([
      "/conta/pedidos",
      "/conta/perfil",
      "/conta/fornecedores",
    ]);
    expect(suppliersNavItem.organizerOnly).toBe(true);
  });

  it("mantém Meus Eventos fora da navegação da conta, inclusive para organizadores", () => {
    const hrefs = getAccountNavItems(true).map((i) => i.href);

    expect(hrefs).not.toContain("/conta/eventos");
    expect(hrefs).not.toContain("/meus-eventos");
  });

  it("formata o label do carrinho de acordo com a quantidade", () => {
    expect(formatCartLabel(0)).toBe("Carrinho vazio");
    expect(formatCartLabel(1)).toBe("Carrinho, 1 item");
    expect(formatCartLabel(3)).toBe("Carrinho, 3 itens");
  });
});

import { describe, expect, it } from "vitest";
import { getNavigationItems, isActiveRoute } from "./navigation.config";

describe("navigation.config", () => {
  describe("getNavigationItems", () => {
    it("deve retornar Início, Eventos e Sobre para visitante", () => {
      const items = getNavigationItems("guest", "/");
      expect(items).toEqual([
        { href: "/#inicio", label: "Início" },
        { href: "/eventos", label: "Eventos" },
        { href: "/sobre", label: "Sobre" },
      ]);
    });

    it("deve incluir Meus Ingressos para usuário comum", () => {
      const items = getNavigationItems("user", "/");
      expect(items).toEqual([
        { href: "/#inicio", label: "Início" },
        { href: "/eventos", label: "Eventos" },
        { href: "/meus-ingressos", label: "Meus Ingressos" },
        { href: "/sobre", label: "Sobre" },
      ]);
    });

    it("deve incluir Meus Ingressos e Meus Eventos para organizador", () => {
      const items = getNavigationItems("organizer", "/");
      expect(items).toEqual([
        { href: "/#inicio", label: "Início" },
        { href: "/eventos", label: "Eventos" },
        { href: "/meus-ingressos", label: "Meus Ingressos" },
        { href: "/meus-eventos", label: "Meus Eventos" },
        { href: "/sobre", label: "Sobre" },
      ]);
    });
  });

  describe("isActiveRoute", () => {
    it("deve marcar /eventos como ativo na rota exata e em subrotas de evento", () => {
      expect(isActiveRoute("/eventos", "/eventos")).toBe(true);
      expect(isActiveRoute("/eventos/123", "/eventos")).toBe(true);
      expect(isActiveRoute("/", "/eventos")).toBe(false);
      expect(isActiveRoute("/meus-eventos", "/eventos")).toBe(false);
    });

    it("não deve considerar âncoras com hashtag como rota ativa", () => {
      expect(isActiveRoute("/#eventos", "#eventos")).toBe(false);
    });
  });
});

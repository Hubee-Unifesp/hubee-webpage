import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function requestFor(pathname: string, token?: string) {
  return new NextRequest(
    new URL(pathname, "http://localhost:3001"),
    token ? { headers: { cookie: `token=${token}` } } : undefined,
  );
}

describe("proxy (BUG-20 e BUG-25)", () => {
  it.each([
    "/carrinho",
    "/checkout",
    "/conta",
    "/conta/perfil",
    "/conta/pedidos/123",
    "/conta/fornecedores",
    "/conta/fornecedores/f1/avaliacoes",
    "/meus-eventos",
    "/meus-eventos/novo",
    "/meus-eventos/evt-1/editar",
    "/meus-ingressos",
    "/minha-organizacao",
    "/notificacoes",
    "/organizacoes/nova",
  ])("redireciona rota privada %s sem sessão para /login", (pathname) => {
    const response = proxy(requestFor(pathname));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3001/login");
  });

  it.each([
    "/rota-inexistente",
    "/pagina/que/nao/existe",
    "/conta-falsa",
    "/register",
  ])("permite passagem de rota inexistente %s sem sessão para renderizar 404 (BUG-20)", (pathname) => {
    const response = proxy(requestFor(pathname));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([
    "/",
    "/sobre",
    "/eventos",
    "/eventos/evt-1",
    "/login",
    "/cadastro",
  ])("permite passagem de rota pública %s sem sessão", (pathname) => {
    const response = proxy(requestFor(pathname));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/login", "/cadastro"])(
    "redireciona %s para / quando há cookie de sessão",
    (pathname) => {
      const response = proxy(requestFor(pathname, "jwt-ativo"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3001/");
    },
  );

  it.each(["/conta/perfil", "/eventos", "/rota-inexistente"])(
    "permite acesso autenticado em %s",
    (pathname) => {
      const response = proxy(requestFor(pathname, "jwt-ativo"));

      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("location")).toBeNull();
    },
  );
});

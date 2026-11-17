import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getToken, saveSession } from "../session";
import { apiClient } from "./apiClient";
import { COLD_START_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, resetApiStatus } from "./api-status";

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
}

function make401Adapter(): AxiosAdapter {
  return async (config) => {
    const response: AxiosResponse = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
      data: { message: "Unauthorized", statusCode: 401 },
    };
    throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, response);
  };
}

describe("apiClient (BUG-23 e BUG-24)", () => {
  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();
  let cookieJar = "";
  let locationMock: { pathname: string; href: string; protocol: string };

  beforeEach(() => {
    resetApiStatus();
    localStorageMock.clear();
    sessionStorageMock.clear();
    cookieJar = "";
    locationMock = {
      pathname: "/conta/perfil",
      href: "http://localhost:3001/conta/perfil",
      protocol: "http:",
    };

    vi.stubGlobal("window", { location: locationMock });
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("sessionStorage", sessionStorageMock);
    vi.stubGlobal("document", {
      get cookie() {
        return cookieJar;
      },
      set cookie(value: string) {
        if (value.includes("Max-Age=0")) {
          cookieJar = "";
          return;
        }
        cookieJar = value.split(";")[0] ?? "";
      },
    });
  });

  afterEach(() => {
    clearSession();
    vi.unstubAllGlobals();
  });

  it("configura timeout padrão de 10s e baseURL válida", () => {
    expect(apiClient.defaults.timeout).toBe(10_000);
    expect(apiClient.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    );
  });

  it("injeta Authorization Bearer automaticamente quando existe token salvo", async () => {
    saveSession("token-sessao");
    let capturedAuth: unknown;

    await apiClient.get("/users/me", {
      adapter: async (config) => {
        capturedAuth = config.headers?.Authorization ?? config.headers?.get?.("Authorization");
        return {
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { ok: true },
        };
      },
    });

    expect(capturedAuth).toBe("Bearer token-sessao");
  });

  it("preserva header Authorization explícito (ex.: chamadas SSR)", async () => {
    saveSession("token-navegador");
    let capturedAuth: unknown;

    await apiClient.get("/events/123", {
      headers: { Authorization: "Bearer token-ssr" },
      adapter: async (config) => {
        capturedAuth = config.headers?.Authorization ?? config.headers?.get?.("Authorization");
        return {
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { ok: true },
        };
      },
    });

    expect(capturedAuth).toBe("Bearer token-ssr");
  });

  it("limpa sessão e redireciona para /login em 401 fora de rotas de autenticação", async () => {
    saveSession("token-expirado");

    await expect(apiClient.get("/users/me", { adapter: make401Adapter() })).rejects.toThrow();

    expect(getToken()).toBeNull();
    expect(locationMock.href).toBe("/login");
  });

  it("não redireciona em 401 quando usuário está em /cadastro (BUG-23)", async () => {
    saveSession("token-qualquer");
    locationMock.pathname = "/cadastro";
    locationMock.href = "http://localhost:3001/cadastro";

    await expect(apiClient.post("/auth/register", {}, { adapter: make401Adapter() })).rejects.toThrow();

    expect(getToken()).toBeNull();
    expect(locationMock.href).toBe("http://localhost:3001/cadastro");
  });

  it("não redireciona em 401 quando usuário já está em /login", async () => {
    saveSession("token-qualquer");
    locationMock.pathname = "/login";
    locationMock.href = "http://localhost:3001/login";

    await expect(apiClient.post("/auth/login", {}, { adapter: make401Adapter() })).rejects.toThrow();

    expect(getToken()).toBeNull();
    expect(locationMock.href).toBe("http://localhost:3001/login");
  });

  it("não limpa sessão nem redireciona quando skipAuthRedirect é true", async () => {
    saveSession("token-valido");

    await expect(
      apiClient.patch("/users/me/password", {}, { skipAuthRedirect: true, adapter: make401Adapter() }),
    ).rejects.toThrow();

    expect(getToken()).toBe("token-valido");
    expect(locationMock.href).toBe("http://localhost:3001/conta/perfil");
  });
});

function makeTimeoutCapturingAdapter(captured: unknown[], status = 200): AxiosAdapter {
  return async (config) => {
    captured.push(config.timeout);
    const response: AxiosResponse = { status, statusText: "", headers: {}, config, data: {} };
    if (status >= 400) throw new AxiosError("Erro", "ERR_BAD_RESPONSE", config, undefined, response);
    return response;
  };
}

describe("apiClient cold start (GOL-256)", () => {
  beforeEach(() => resetApiStatus());

  afterEach(() => vi.useRealTimers());

  it("usa timeout de 60s até a API responder e 10s depois", async () => {
    const captured: unknown[] = [];
    const adapter = makeTimeoutCapturingAdapter(captured);

    await apiClient.get("/events", { adapter });
    await apiClient.get("/events", { adapter });

    expect(captured).toEqual([COLD_START_TIMEOUT_MS, DEFAULT_TIMEOUT_MS]);
  });

  it("considera a API acordada também quando ela responde com erro HTTP", async () => {
    const captured: unknown[] = [];

    await expect(apiClient.get("/events/x", { adapter: makeTimeoutCapturingAdapter(captured, 404) })).rejects.toThrow();
    await apiClient.get("/events", { adapter: makeTimeoutCapturingAdapter(captured) });

    expect(captured).toEqual([COLD_START_TIMEOUT_MS, DEFAULT_TIMEOUT_MS]);
  });

  it("continua em 60s quando a chamada falha sem resposta do servidor", async () => {
    const captured: unknown[] = [];
    const networkError: AxiosAdapter = async (config) => {
      captured.push(config.timeout);
      throw new AxiosError("timeout", "ECONNABORTED", config);
    };

    await expect(apiClient.get("/events", { adapter: networkError })).rejects.toThrow();
    await expect(apiClient.get("/events", { adapter: networkError })).rejects.toThrow();

    expect(captured).toEqual([COLD_START_TIMEOUT_MS, COLD_START_TIMEOUT_MS]);
  });

  it("volta a 60s depois de 10 minutos sem respostas", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
    const captured: unknown[] = [];
    const adapter = makeTimeoutCapturingAdapter(captured);

    await apiClient.get("/events", { adapter });
    vi.setSystemTime(new Date("2026-11-16T12:10:00Z"));
    await apiClient.get("/events", { adapter });

    expect(captured).toEqual([COLD_START_TIMEOUT_MS, COLD_START_TIMEOUT_MS]);
  });

  it("respeita timeout explícito da chamada", async () => {
    const captured: unknown[] = [];

    await apiClient.get("/events", { timeout: 5_000, adapter: makeTimeoutCapturingAdapter(captured) });

    expect(captured).toEqual([5_000]);
  });
});

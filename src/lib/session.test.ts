import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getToken, saveSession } from "./session";

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

describe("session", () => {
  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();
  let cookieJar = "";

  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    cookieJar = "";

    vi.stubGlobal("window", {
      location: { protocol: "http:" },
    });
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("sessionStorage", sessionStorageMock);
    vi.stubGlobal("document", {
      get cookie() {
        return cookieJar;
      },
      set cookie(value: string) {
        cookieJar = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("salva em localStorage e cookie com Max-Age quando rememberMe é true", () => {
    saveSession("jwt-persistente", { rememberMe: true });

    expect(localStorageMock.getItem("hubee_token")).toBe("jwt-persistente");
    expect(sessionStorageMock.getItem("hubee_token")).toBeNull();
    expect(getToken()).toBe("jwt-persistente");
    expect(cookieJar).toContain("token=jwt-persistente");
    expect(cookieJar).toContain("Max-Age=86400");
  });

  it("salva em sessionStorage e cookie de sessão (sem Max-Age) quando rememberMe é false", () => {
    saveSession("jwt-sessao", { rememberMe: false });

    expect(sessionStorageMock.getItem("hubee_token")).toBe("jwt-sessao");
    expect(localStorageMock.getItem("hubee_token")).toBeNull();
    expect(getToken()).toBe("jwt-sessao");
    expect(cookieJar).toContain("token=jwt-sessao");
    expect(cookieJar).not.toContain("Max-Age=");
  });

  it("clearSession remove o token de ambos os storages e expira o cookie", () => {
    saveSession("jwt-sessao", { rememberMe: false });
    clearSession();

    expect(getToken()).toBeNull();
    expect(cookieJar).toContain("Max-Age=0");
  });

  it("getToken recupera cookie de sessão quando outra aba usa rememberMe=false", () => {
    cookieJar = "token=jwt-outra-aba; Path=/; SameSite=Lax";

    expect(getToken()).toBe("jwt-outra-aba");
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_ORGANIZATION_BRANDING,
  ORG_IMAGE_MAX_BYTES,
  loadOrganizationBranding,
  resetOrganizationBranding,
  saveOrganizationBranding,
  validateOrganizationImageFile,
} from "./organization-branding";

const ORG_ID = "org-123";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

describe("organization-branding", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: createMemoryStorage(),
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
  });

  it("valida formato e tamanho das imagens da organização", () => {
    expect(validateOrganizationImageFile({ type: "image/jpeg", size: 1024 })).toBeNull();
    expect(validateOrganizationImageFile({ type: "image/png", size: ORG_IMAGE_MAX_BYTES })).toBeNull();

    expect(validateOrganizationImageFile({ type: "image/webp", size: 500 })).toMatch(/JPG ou PNG/);
    expect(validateOrganizationImageFile({ type: "image/gif", size: 100 })).toMatch(/Formato inválido/);
    expect(
      validateOrganizationImageFile({ type: "image/png", size: ORG_IMAGE_MAX_BYTES + 1 }),
    ).toMatch(/máximo 2MB/);
  });

  it("retorna padrão quando não há customização salva", () => {
    expect(loadOrganizationBranding(ORG_ID)).toEqual(DEFAULT_ORGANIZATION_BRANDING);
  });

  it("salva, recarrega e limpa customização por organização", () => {
    const saved = saveOrganizationBranding(ORG_ID, {
      coverImage: "data:image/png;base64,AAA",
      titleColor: "#f5b800",
      descriptionColor: null,
    });

    expect(saved).toBe(true);
    expect(loadOrganizationBranding(ORG_ID)).toEqual({
      coverImage: "data:image/png;base64,AAA",
      titleColor: "#F5B800",
      descriptionColor: null,
    });

    resetOrganizationBranding(ORG_ID);
    expect(loadOrganizationBranding(ORG_ID)).toEqual(DEFAULT_ORGANIZATION_BRANDING);
  });

  it("ignora valores inválidos com fallback seguro", () => {
    window.localStorage.setItem(
      `hubee:org-branding:${ORG_ID}`,
      JSON.stringify({
        coverImage: "javascript:alert(1)",
        titleColor: "azul",
        descriptionColor: "#12",
      }),
    );

    expect(loadOrganizationBranding(ORG_ID)).toEqual({
      coverImage: null,
      titleColor: null,
      descriptionColor: null,
    });
  });
});

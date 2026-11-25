export type OrganizationAccent = "yellow" | "gold" | "hive" | "cream";

export interface OrganizationAccentOption {
  id: OrganizationAccent;
  label: string;
  swatchClassName: string;
  headerClassName: string;
  patternClassName: string;
}

export const ORGANIZATION_ACCENTS: readonly OrganizationAccentOption[] = [
  {
    id: "yellow",
    label: "Amarelo Hubee",
    swatchClassName: "bg-hubee-400 border-hubee-600",
    headerClassName: "bg-hubee-400 text-hubee-900",
    patternClassName: "text-hubee-800/15",
  },
  {
    id: "gold",
    label: "Ouro Colmeia",
    swatchClassName: "bg-hubee-500 border-hubee-700",
    headerClassName: "bg-hubee-500 text-hubee-900",
    patternClassName: "text-hubee-900/15",
  },
  {
    id: "hive",
    label: "Colmeia Escura",
    swatchClassName: "bg-hubee-800 border-hubee-400",
    headerClassName: "bg-hubee-800 text-hubee-50",
    patternClassName: "text-hubee-400/20",
  },
  {
    id: "cream",
    label: "Creme Claro",
    swatchClassName: "bg-hubee-200 border-hubee-500",
    headerClassName: "bg-hubee-200 text-hubee-900",
    patternClassName: "text-hubee-800/15",
  },
];

export interface OrganizationBranding {
  coverImage: string | null;
  logoImage: string | null;
  tagline: string;
  accent: OrganizationAccent;
}

export const DEFAULT_ORGANIZATION_BRANDING: OrganizationBranding = {
  coverImage: null,
  logoImage: null,
  tagline: "",
  accent: "yellow",
};

export const ORG_TAGLINE_MAX_LENGTH = 40;
export const ORG_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const ORG_IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const STORAGE_PREFIX = "hubee:org-branding:";
const BRANDING_CHANGE_EVENT = "hubee:org-branding-change";

const snapshotCache = new Map<string, { raw: string | null; value: OrganizationBranding }>();

function notifyBrandingChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BRANDING_CHANGE_EVENT));
}

export function subscribeOrganizationBranding(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(BRANDING_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(BRANDING_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function isValidAccent(value: unknown): value is OrganizationAccent {
  return ORGANIZATION_ACCENTS.some((option) => option.id === value);
}

export function getOrganizationAccentOption(accent: OrganizationAccent): OrganizationAccentOption {
  return (
    ORGANIZATION_ACCENTS.find((option) => option.id === accent) ?? ORGANIZATION_ACCENTS[0]
  );
}

export function validateOrganizationImageFile(file: { type: string; size: number }): string | null {
  if (!(ORG_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Formato inválido. Use uma imagem JPG, PNG ou WebP.";
  }
  if (file.size > ORG_IMAGE_MAX_BYTES) {
    return "A imagem deve ter no máximo 2MB.";
  }
  return null;
}

export function loadOrganizationBranding(orgId: string): OrganizationBranding {
  if (typeof window === "undefined" || !orgId) {
    return DEFAULT_ORGANIZATION_BRANDING;
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${orgId}`);
    const cached = snapshotCache.get(orgId);
    if (cached && cached.raw === raw) {
      return cached.value;
    }

    if (!raw) {
      snapshotCache.set(orgId, { raw: null, value: DEFAULT_ORGANIZATION_BRANDING });
      return DEFAULT_ORGANIZATION_BRANDING;
    }

    const parsed = JSON.parse(raw) as Partial<OrganizationBranding>;
    const value: OrganizationBranding = {
      coverImage: typeof parsed.coverImage === "string" && parsed.coverImage.startsWith("data:image/")
        ? parsed.coverImage
        : null,
      logoImage: typeof parsed.logoImage === "string" && parsed.logoImage.startsWith("data:image/")
        ? parsed.logoImage
        : null,
      tagline: typeof parsed.tagline === "string" ? parsed.tagline.slice(0, ORG_TAGLINE_MAX_LENGTH) : "",
      accent: isValidAccent(parsed.accent) ? parsed.accent : DEFAULT_ORGANIZATION_BRANDING.accent,
    };

    snapshotCache.set(orgId, { raw, value });
    return value;
  } catch {
    return DEFAULT_ORGANIZATION_BRANDING;
  }
}

export function saveOrganizationBranding(orgId: string, branding: OrganizationBranding): boolean {
  if (typeof window === "undefined" || !orgId) return false;
  try {
    const sanitized: OrganizationBranding = {
      coverImage: branding.coverImage,
      logoImage: branding.logoImage,
      tagline: branding.tagline.trim().slice(0, ORG_TAGLINE_MAX_LENGTH),
      accent: isValidAccent(branding.accent) ? branding.accent : DEFAULT_ORGANIZATION_BRANDING.accent,
    };
    const serialized = JSON.stringify(sanitized);
    window.localStorage.setItem(`${STORAGE_PREFIX}${orgId}`, serialized);
    snapshotCache.set(orgId, { raw: serialized, value: sanitized });
    notifyBrandingChange();
    return true;
  } catch {
    return false;
  }
}

export function resetOrganizationBranding(orgId: string): void {
  if (typeof window === "undefined" || !orgId) return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${orgId}`);
    snapshotCache.delete(orgId);
    notifyBrandingChange();
  } catch {
    // Ignora bloqueio de storage no navegador
  }
}

function readAsDataUrlFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Não foi possível ler a imagem."));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensiona a imagem no navegador antes de converter em Data URL, mantendo nitidez
 * sem estourar o limite de armazenamento local.
 */
export async function compressOrganizationImage(
  file: File,
  maxWidth: number,
  quality = 0.84,
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return readAsDataUrlFallback(file);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = objectUrl;
    await img.decode();

    const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return await readAsDataUrlFallback(file);

    context.drawImage(img, 0, 0, width, height);
    const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(outputMime, quality);
  } catch {
    return readAsDataUrlFallback(file);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

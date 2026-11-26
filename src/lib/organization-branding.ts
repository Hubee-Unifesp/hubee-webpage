export interface OrganizationBranding {
  coverImage: string | null;
  titleColor: string | null;
  descriptionColor: string | null;
}

export const DEFAULT_ORGANIZATION_BRANDING: OrganizationBranding = {
  coverImage: null,
  titleColor: null,
  descriptionColor: null,
};

export const ORG_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const ORG_IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png"] as const;

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

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toUpperCase() : null;
}

function isValidCoverImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("data:image/") || value.startsWith("https://") || value.startsWith("http://"))
  );
}

export function validateOrganizationImageFile(file: { type: string; size: number }): string | null {
  if (!(ORG_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Formato inválido. Use uma imagem JPG ou PNG.";
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
      coverImage: isValidCoverImage(parsed.coverImage) ? parsed.coverImage : null,
      titleColor: normalizeHexColor(parsed.titleColor),
      descriptionColor: normalizeHexColor(parsed.descriptionColor),
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
      titleColor: normalizeHexColor(branding.titleColor),
      descriptionColor: normalizeHexColor(branding.descriptionColor),
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

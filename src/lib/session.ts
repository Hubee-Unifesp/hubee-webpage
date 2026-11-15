const TOKEN_KEY = 'hubee_token';
const COOKIE_NAME = 'token';
// Mesma validade do JWT emitido pela API (`expiresIn: '1d'`).
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export interface SaveSessionOptions {
  /** Quando `true` (padrão), persiste em `localStorage` e cookie com `Max-Age`; quando `false`, usa `sessionStorage` e cookie de sessão. */
  rememberMe?: boolean;
}

function getCookieToken(): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  const raw = entry.slice(COOKIE_NAME.length + 1);
  return raw ? decodeURIComponent(raw) : null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(TOKEN_KEY) ??
    sessionStorage.getItem(TOKEN_KEY) ??
    getCookieToken()
  );
}

/**
 * Guarda o token para o axios (`localStorage` se `rememberMe`, senão `sessionStorage`) e um cookie
 * para o middleware, que roda no servidor e não enxerga o Web Storage. O cookie só indica que há
 * uma sessão; quem valida o token é a API.
 */
export function saveSession(token: string, options?: SaveSessionOptions): void {
  if (typeof window === 'undefined') return;
  const rememberMe = options?.rememberMe ?? true;

  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = rememberMe ? `; Max-Age=${COOKIE_MAX_AGE_SECONDS}` : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/${maxAge}; SameSite=Lax${secure}`;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

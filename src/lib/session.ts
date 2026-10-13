const TOKEN_KEY = 'hubee_token';
const COOKIE_NAME = 'token';
// Mesma validade do JWT emitido pela API (`expiresIn: '1d'`).
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Guarda o token para o axios (localStorage) e um cookie para o middleware, que roda no servidor
 * e não enxerga o localStorage. O cookie só indica que há uma sessão; quem valida o token é a API.
 */
export function saveSession(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

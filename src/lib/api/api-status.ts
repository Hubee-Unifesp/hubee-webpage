export const DEFAULT_TIMEOUT_MS = 10_000;
export const COLD_START_TIMEOUT_MS = 60_000;
export const AWAKE_WINDOW_MS = 10 * 60_000;

let lastResponseAt: number | null = null;

export function markApiAwake(now: number = Date.now()): void {
  lastResponseAt = now;
}

export function isApiAwake(now: number = Date.now()): boolean {
  return lastResponseAt !== null && now - lastResponseAt < AWAKE_WINDOW_MS;
}

export function resolveTimeout(requested: number | undefined, now: number = Date.now()): number | undefined {
  if (requested !== DEFAULT_TIMEOUT_MS) return requested;
  return isApiAwake(now) ? DEFAULT_TIMEOUT_MS : COLD_START_TIMEOUT_MS;
}

export function resetApiStatus(): void {
  lastResponseAt = null;
}

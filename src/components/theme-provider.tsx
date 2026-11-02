"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, parseThemeCookie, type Theme } from "@/lib/theme";

export type { Theme };

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();

function setTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
  document.documentElement.classList.toggle("dark", theme === "dark");
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getClientTheme = () => parseThemeCookie(document.cookie);
/** No servidor e na hidratação o tema é claro; logo depois o cliente passa a usar o cookie. */
const getServerTheme = (): Theme => "light";

/**
 * Tema global salvo no cookie `hubee_theme`. A classe `.dark` inicial é aplicada pelo script de
 * `src/app/layout.tsx` antes da primeira pintura; aqui ela só muda quando o usuário troca o tema.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}

"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}

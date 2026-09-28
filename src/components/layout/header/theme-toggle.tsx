"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const label = theme === "light" ? "Ativar tema escuro" : "Ativar tema claro";

  return (
    <Button type="button" variant="hubee_header" size="icon" aria-label={label} title={label} className={className}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <Sun aria-hidden="true" className="size-[18px]" /> : <Moon aria-hidden="true" className="size-[18px]" />}
    </Button>
  );
}

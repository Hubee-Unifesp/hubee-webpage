import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const label = theme === "light" ? "Ativar tema escuro" : "Ativar tema claro";

  return (
    <Button type="button" variant="hubee_header" size="icon-lg" aria-label={label} title={label}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <Sun aria-hidden="true" className="size-5" /> : <Moon aria-hidden="true" className="size-5" />}
    </Button>
  );
}

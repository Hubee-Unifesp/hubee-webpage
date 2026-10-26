import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Variantes de cor do logotipo Hubee1 (ver `public/logo/hubee/` e a folha de variações em
 * docs/figma/logotipo.md no Alexandrita):
 * - `white`: letras claras e asa amarela, para fundos escuros (`hubee-800`, `hubee-900`, `hubee-neutral-*`).
 * - `dark`: letras escuras e asa amarela, para fundos claros (`hubee-50`).
 * - `dark_alt`: letras escuras e asa clara, para fundos amarelos (`hubee-400`), onde a asa amarela sumiria.
 */
export type HubeeLogoTone = "white" | "dark" | "dark_alt";

const LOGO_WIDTH = 527;
const LOGO_HEIGHT = 204;

interface HubeeLogoProps {
  tone: HubeeLogoTone;
  /** Controla tamanho e visibilidade. Defina a altura (ex.: `h-8`); a largura acompanha a proporção. */
  className?: string;
  priority?: boolean;
}

/**
 * Logotipo Hubee1 decorativo (`alt=""`): o nome acessível fica no link que o envolve
 * (ex.: `aria-label="Hubee - página inicial"`).
 */
export function HubeeLogo({ tone, className, priority = false }: HubeeLogoProps) {
  return (
    <Image
      src={`/logo/hubee/Hubee1_${tone}.svg`}
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      unoptimized
      priority={priority}
      className={cn("h-8 w-auto", className)}
    />
  );
}

interface ThemedHubeeLogoProps {
  /** Variante exibida no tema claro. */
  light: HubeeLogoTone;
  /** Variante exibida no tema escuro. */
  dark: HubeeLogoTone;
  className?: string;
  priority?: boolean;
}

/**
 * Renderiza as duas variantes e alterna por CSS (`dark:`), sem depender do tema no JS:
 * evita divergência de hidratação e o "pisca" do logo errado ao carregar a página.
 */
export function ThemedHubeeLogo({ light, dark, className, priority }: ThemedHubeeLogoProps) {
  return (
    <>
      <HubeeLogo tone={light} priority={priority} className={cn(className, "dark:hidden")} />
      <HubeeLogo tone={dark} priority={priority} className={cn(className, "hidden dark:block")} />
    </>
  );
}

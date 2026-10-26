import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { displayFont } from "./fonts";

interface EventPageShellProps {
  children: ReactNode;
  /** Nome acessível do `<main>`. */
  label: string;
  className?: string;
}

/** Estrutura comum da página de evento e dos estados de carregamento e 404: header, conteúdo e footer. */
export function EventPageShell({ children, label, className }: EventPageShellProps) {
  return (
    <div
      id="inicio"
      className={cn(
        "flex min-h-screen flex-col bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50",
        displayFont.variable,
      )}
    >
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-hubee-800 px-3 py-2 text-sm font-medium text-hubee-50 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 dark:bg-hubee-400 dark:text-hubee-800"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" aria-label={label} className={cn("flex-1 pt-4", className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** Container horizontal usado em todas as seções da página. */
export const containerClassName = "mx-auto w-full max-w-6xl px-4 sm:px-8 md:px-6";

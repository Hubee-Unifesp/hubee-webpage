import type { Metadata } from "next";
import {
  RequireSession,
  SessionFooter,
  SessionHeader,
} from "@/components/layout/logged/logged-session";
import { MinhaOrganizacaoContent } from "@/components/organizacao/minha-organizacao-content";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "Minha Organização | Hubee",
  description:
    "Visualize e personalize os dados da sua organização, gerencie eventos, lotes, membros e fornecedores na Hubee.",
};

/**
 * Página full-width `/minha-organizacao` (fora do container `max-w-6xl` de `(logado)/layout.tsx`),
 * mantendo a mesma largura `max-w-[1600px]` da Home e de `/sobre` com proteção de sessão e header sticky.
 */
export default function MinhaOrganizacaoPage() {
  return (
    <ToastProvider>
      <div
        id="inicio"
        className="flex min-h-screen flex-col bg-hubee-50 text-hubee-800 dark:bg-hubee-900 dark:text-hubee-50"
      >
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-hubee-800 px-3 py-2 text-sm font-medium text-hubee-50 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 dark:bg-hubee-400 dark:text-hubee-800"
        >
          Pular para o conteúdo
        </a>

        <SessionHeader />

        <main
          id="conteudo"
          aria-label="Minha Organização"
          className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-12 px-3 pt-4 pb-12 sm:px-6 md:gap-16"
        >
          <RequireSession>
            <MinhaOrganizacaoContent />
          </RequireSession>
        </main>

        <SessionFooter />
      </div>
    </ToastProvider>
  );
}

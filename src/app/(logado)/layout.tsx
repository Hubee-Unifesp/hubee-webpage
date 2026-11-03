import type { ReactNode } from "react";
import { ToastProvider } from "@/components/toast";
import {
  RequireSession,
  SessionFooter,
  SessionHeader,
} from "@/components/layout/logged/logged-session";

/** Layout compartilhado da área logada: header com a sessão, conteúdo protegido, footer e toasts. */
export default function LogadoLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-hubee-800 px-3 py-2 text-sm font-medium text-hubee-50 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 dark:bg-hubee-400 dark:text-hubee-800"
        >
          Pular para o conteúdo
        </a>
        <SessionHeader />
        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 md:px-6">
          <RequireSession>{children}</RequireSession>
        </main>
        <SessionFooter />
      </div>
    </ToastProvider>
  );
}

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/toast";
import { LoggedHeader } from "@/components/layout/logged";
import { usuarioLogadoMock } from "@/mocks/usuario";

/**
 * Layout compartilhado da área logada: header, conteúdo e toasts.
 * TODO(auth-api): trocar o mock pelos dados da sessão e proteger as rotas.
 */
export default function LogadoLayout({ children }: { children: ReactNode }) {
  const { usuario, itensNoCarrinho } = usuarioLogadoMock;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-md bg-hubee-800 px-3 py-2 text-sm font-medium text-hubee-50 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 dark:bg-hubee-400 dark:text-hubee-800"
        >
          Pular para o conteúdo
        </a>
        <LoggedHeader usuario={usuario} itensNoCarrinho={itensNoCarrinho} />
        <main id="conteudo" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 md:px-6">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

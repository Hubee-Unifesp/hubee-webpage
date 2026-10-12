"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { LoggedHeader } from "./logged-header";

/** Header da área logada com os dados da sessão. Enquanto carrega (ou se a sessão falhar), mostra só a barra. */
export function SessionHeader() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="w-full px-4 pt-4 sm:px-8 md:px-6">
        <Skeleton className="mx-auto h-14 max-w-[52rem] rounded-xl" />
      </div>
    );
  }

  // TODO(cart-api): ligar o contador ao carrinho real quando a API existir.
  return <LoggedHeader usuario={user} itensNoCarrinho={0} />;
}

/**
 * Protege as páginas da área logada: sem sessão válida (token ausente ou expirado), vai para o login
 * e volta para a página pedida depois. Falha de rede não derruba a sessão; cada página mostra seu erro.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const { user, isLoading, hasError, sessionEnded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const unauthenticated = !isLoading && !user && !hasError && !sessionEnded;

  useEffect(() => {
    if (unauthenticated) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [unauthenticated, router, pathname]);

  // Depois do logout a página está de saída (a navegação para a home já começou): não mostra nem redireciona.
  return unauthenticated || sessionEnded ? null : children;
}

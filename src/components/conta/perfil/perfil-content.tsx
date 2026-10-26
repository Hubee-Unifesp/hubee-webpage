"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { ListMessage } from "@/components/home/events/list-states";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DadosPessoaisForm } from "./dados-pessoais-form";
import { ExcluirContaCard } from "./excluir-conta-card";
import { PerfilSkeleton } from "./perfil-skeleton";
import { PermissoesCard } from "./permissoes-card";
import { TrocarSenhaForm } from "./trocar-senha-form";

/** Conteúdo da página Meu Perfil: dados do usuário logado, com carregando, erro e o aviso de perfil incompleto. */
export function PerfilContent() {
  const { user, isLoading, hasError, refreshUser } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <ContaPageTitle>Meu Perfil</ContaPageTitle>

      {user ? (
        <>
          {!user.profileComplete && (
            <section
              aria-labelledby="aviso-perfil-titulo"
              className="flex items-start gap-3 rounded-xl border border-hubee-400 bg-hubee-200 p-4 text-hubee-750"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-hubee-600" />
              <div className="flex flex-col items-start gap-1">
                <h2 id="aviso-perfil-titulo" className="text-sm font-semibold text-hubee-800">
                  Complete seu perfil
                </h2>
                <p className="text-xs">Complete o seu perfil para comprar ingressos.</p>
                <Button
                  asChild
                  size="sm"
                  className="mt-2 h-7 bg-hubee-800 text-xs text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800/40"
                >
                  <Link href="/conta/completar-perfil">Completar perfil</Link>
                </Button>
              </div>
            </section>
          )}

          <DadosPessoaisForm usuario={user} />
          <PermissoesCard usuario={user} />
          <TrocarSenhaForm />
          <ExcluirContaCard />
        </>
      ) : hasError && !isLoading ? (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={() => void refreshUser()}
        />
      ) : (
        <PerfilSkeleton />
      )}
    </div>
  );
}

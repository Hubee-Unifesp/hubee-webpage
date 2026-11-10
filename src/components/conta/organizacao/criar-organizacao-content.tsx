"use client";

import { useRouter } from "next/navigation";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";
import { OrganizacaoForm } from "./organizacao-form";

/** Página `/organizacoes/nova`: cadastra a organização e leva a pessoa ao painel de eventos já como administradora. */
export function CriarOrganizacaoContent() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <ContaPageTitle>Criar organização</ContaPageTitle>
      <ContaCard
        title="Dados da organização"
        description="Cadastre sua atlética, coletivo, centro acadêmico ou produtora para organizar eventos no Hubee. Você será o administrador."
      >
        <OrganizacaoForm
          mode={{ type: "create" }}
          onCancel={() => router.push("/meus-eventos")}
          onSuccess={() => router.push("/meus-eventos")}
        />
      </ContaCard>
    </div>
  );
}

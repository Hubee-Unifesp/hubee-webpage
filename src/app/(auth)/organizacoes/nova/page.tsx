import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateOrganizationScreen } from "@/components/auth/create-organization-screen";

export const metadata: Metadata = {
  title: "Criar organização | Hubee",
  description: "Cadastre sua organização no Hubee para publicar e gerenciar eventos.",
};

export default function NovaOrganizacaoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CreateOrganizationScreen />
    </Suspense>
  );
}


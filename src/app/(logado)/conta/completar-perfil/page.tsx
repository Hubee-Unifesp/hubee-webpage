import type { Metadata } from "next";
import Link from "next/link";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";

export const metadata: Metadata = { title: "Completar perfil | Hubee" };

// Placeholder: o formulário de CPF e data de nascimento entra em uma próxima task. Existe para o aviso
// "Complete seu perfil" do Meu perfil não levar a um 404.
export default function CompletarPerfilPage() {
  return (
    <div className="flex flex-col gap-4">
      <ContaPageTitle>Completar Perfil</ContaPageTitle>
      <ContaCard title="Em breve" description="Estamos preparando esta etapa">
        <p className="text-sm">
          Em breve você poderá informar os dados que faltam para comprar ingressos.{" "}
          <Link
            href="/conta/perfil"
            className="font-semibold underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400"
          >
            Voltar para Meu perfil
          </Link>
        </p>
      </ContaCard>
    </div>
  );
}

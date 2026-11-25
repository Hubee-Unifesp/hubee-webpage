import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { OrganizacaoPublicaContent } from "@/components/organizacao/organizacao-publica-content";

export const metadata: Metadata = {
  title: "Organização | Hubee",
  description: "Conheça a organização, sua descrição e os eventos disponíveis na Hubee.",
};

interface OrganizacaoPublicaPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página pública `/organizacoes/[id]`: acessível por visitantes e usuários logados ao clicar
 * no nome da organização nos cards ou na página de detalhes de um evento.
 */
export default async function OrganizacaoPublicaPage({ params }: OrganizacaoPublicaPageProps) {
  const { id } = await params;

  return (
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

      <Header />

      <main
        id="conteudo"
        aria-label="Perfil da organização"
        className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-12 px-3 pt-4 pb-12 sm:px-6 md:gap-16"
      >
        <OrganizacaoPublicaContent orgId={id} />
      </main>

      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import { AvaliacoesContent } from "@/components/conta/fornecedores/avaliacoes/avaliacoes-content";

export const metadata: Metadata = {
  title: "Avaliações do fornecedor | Hubee",
  description: "Avaliações dos fornecedores da organização após os eventos na plataforma Hubee.",
};

interface AvaliacoesPageProps {
  params: Promise<{ id: string }>;
}

export default async function AvaliacoesFornecedorPage({ params }: AvaliacoesPageProps) {
  const { id } = await params;
  return <AvaliacoesContent supplierId={id} />;
}

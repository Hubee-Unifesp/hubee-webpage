import type { Metadata } from "next";
import { PlanejamentoEvento } from "@/components/conta/eventos/planejamento/planejamento-evento";

export const metadata: Metadata = {
  title: "Planejamento do evento | Hubee",
  description: "Orçamento, fornecedores e break-even do evento na plataforma Hubee.",
};

interface PlanejamentoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanejamentoPage({ params }: PlanejamentoPageProps) {
  const { id } = await params;
  return <PlanejamentoEvento key={id} eventoId={id} />;
}

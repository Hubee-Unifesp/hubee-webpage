import type { Metadata } from "next";
import { EventoEditor } from "@/components/conta/eventos/editor/evento-editor";
import { isEtapaEvento } from "@/components/conta/eventos/editor/evento-editor.data";

export const metadata: Metadata = {
  title: "Editar evento | Hubee",
  description: "Edição do evento e dos lotes de ingressos da organização na plataforma Hubee.",
};

interface EditarEventoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ etapa?: string | string[] }>;
}

export default async function EditarEventoPage({ params, searchParams }: EditarEventoPageProps) {
  const [{ id }, { etapa }] = await Promise.all([params, searchParams]);

  return <EventoEditor key={id} eventoId={id} etapaInicial={isEtapaEvento(etapa) ? etapa : undefined} />;
}

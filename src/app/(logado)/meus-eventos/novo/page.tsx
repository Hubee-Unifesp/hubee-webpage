import type { Metadata } from "next";
import { EventoEditor } from "@/components/conta/eventos/editor/evento-editor";

export const metadata: Metadata = {
  title: "Novo evento | Hubee",
  description: "Criação de evento e dos lotes de ingressos da organização na plataforma Hubee.",
};

export default function NovoEventoPage() {
  return <EventoEditor />;
}

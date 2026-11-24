import type { Metadata } from "next";
import { AssistenteEvento } from "@/components/conta/eventos/assistente/assistente-evento";

export const metadata: Metadata = {
  title: "Criar evento com assistente | Hubee",
  description: "Crie um evento conversando com o assistente de IA da Hubee.",
};

export default function AssistenteEventoPage() {
  return <AssistenteEvento />;
}

import type { Metadata } from "next";
import { MeusEventosContent } from "@/components/conta/eventos/meus-eventos-content";

export const metadata: Metadata = { title: "Meus Eventos | Hubee" };

export default function MeusEventosPage() {
  return <MeusEventosContent />;
}


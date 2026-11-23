import type { Metadata } from "next";
import { PerfilPageContent } from "@/components/conta/perfil/perfil-page-content";

export const metadata: Metadata = { title: "Meu perfil | Hubee" };

export default function PerfilPage() {
  return <PerfilPageContent />;
}

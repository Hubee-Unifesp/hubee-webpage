import type { Metadata } from "next";
import { CompletarPerfilContent } from "@/components/conta/perfil/completar-perfil-content";

export const metadata: Metadata = { title: "Completar perfil | Hubee" };

export default function CompletarPerfilPage() {
  return <CompletarPerfilContent />;
}

import type { Metadata } from "next";
import { PerfilContent } from "@/components/conta/perfil/perfil-content";

export const metadata: Metadata = { title: "Meu perfil | Hubee" };

export default function PerfilPage() {
  return <PerfilContent />;
}

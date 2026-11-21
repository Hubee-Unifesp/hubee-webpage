import type { Metadata } from "next";
import { MembrosContent } from "@/components/conta/membros/membros-content";

export const metadata: Metadata = {
  title: "Membros | Hubee",
  description: "Gestão de membros, convites por e-mail e permissões da organização na plataforma Hubee.",
};

export default function MembrosPage() {
  return <MembrosContent />;
}

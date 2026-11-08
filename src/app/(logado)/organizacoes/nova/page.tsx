import type { Metadata } from "next";
import { CriarOrganizacaoContent } from "@/components/conta/organizacao/criar-organizacao-content";

export const metadata: Metadata = {
  title: "Criar organização | Hubee",
  description: "Cadastre sua organização no Hubee para publicar e gerenciar eventos.",
};

export default function NovaOrganizacaoPage() {
  return <CriarOrganizacaoContent />;
}

import type { Metadata } from "next";
import { FornecedoresContent } from "@/components/conta/fornecedores/fornecedores-content";

export const metadata: Metadata = {
  title: "Fornecedores | Hubee",
  description: "Cadastro e gestão dos fornecedores da organização na plataforma Hubee.",
};

export default function FornecedoresPage() {
  return <FornecedoresContent />;
}

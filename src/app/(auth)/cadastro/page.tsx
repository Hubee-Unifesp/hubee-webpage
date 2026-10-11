import type { Metadata } from "next";
import { RegisterScreen } from "@/components/auth/register-screen";

export const metadata: Metadata = {
  title: "Criar conta | Hubee",
  description: "Crie sua conta no Hubee para comprar ingressos e acompanhar seus eventos.",
};

export default function CadastroPage() {
  return <RegisterScreen />;
}

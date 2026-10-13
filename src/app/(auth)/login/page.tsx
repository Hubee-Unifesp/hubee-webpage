import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen"; // Ajusta o caminho se necessário

export const metadata: Metadata = {
  title: "Login | Hubee",
  description: "Faça login para acessar sua conta no Hubee.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginScreen />
    </Suspense>
  );
}
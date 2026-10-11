import type { Metadata } from "next";
import { LoginScreen } from "@/components/auth/login-screen";

export const metadata: Metadata = {
  title: "Entrar | Hubee",
  description: "Acesse sua conta no Hubee.",
};

export default function LoginPage() {
  return <LoginScreen />;
}

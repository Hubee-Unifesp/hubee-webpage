import type { Metadata } from "next";
import { NotificacoesContent } from "@/components/notificacoes";

export const metadata: Metadata = { title: "Notificações | Hubee" };

export default function NotificacoesPage() {
  return <NotificacoesContent />;
}

import type { Metadata } from "next";
import { NotificacoesConectadas } from "@/components/notificacoes";

export const metadata: Metadata = { title: "Notificações | Hubee" };

export default function NotificacoesPage() {
  return <NotificacoesConectadas />;
}

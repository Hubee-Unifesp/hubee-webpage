import type { Metadata } from "next";
import { MeusIngressosContent } from "@/components/conta/ingressos/meus-ingressos-content";

export const metadata: Metadata = { title: "Meus Ingressos | Hubee" };

export default function MeusIngressosPage() {
  return <MeusIngressosContent />;
}

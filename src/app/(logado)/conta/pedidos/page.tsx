import type { Metadata } from "next";
import { PedidosContent } from "@/components/conta/pedidos/pedidos-content";

export const metadata: Metadata = { title: "Meus pedidos | Hubee" };

export default function PedidosPage() {
  return <PedidosContent />;
}

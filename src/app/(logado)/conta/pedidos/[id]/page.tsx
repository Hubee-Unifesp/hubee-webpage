import type { Metadata } from "next";
import { PedidoDetalheContent } from "@/components/conta/pedidos/pedido-detalhe-content";

export const metadata: Metadata = { title: "Detalhes do pedido | Hubee" };

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <PedidoDetalheContent id={id} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PedidoDetalhe } from "@/components/conta/pedidos/pedido-detalhe";
import { getPedidoMock } from "@/mocks/pedidos";

export const metadata: Metadata = { title: "Detalhes do pedido | Hubee" };

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO(orders-api): buscar o pedido na API.
  const pedido = getPedidoMock(id);
  if (!pedido) notFound();

  return <PedidoDetalhe pedido={pedido} />;
}

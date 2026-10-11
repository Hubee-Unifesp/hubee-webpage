import type { Metadata } from "next";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { PedidosLista } from "@/components/conta/pedidos/pedidos-lista";
import { pedidosMock } from "@/mocks/pedidos";

export const metadata: Metadata = { title: "Meus pedidos | Hubee" };

export default function PedidosPage() {
  return (
    <div className="flex flex-col gap-4">
      <ContaPageTitle>Meus Pedidos</ContaPageTitle>
      {/* TODO(orders-api): trocar o mock pela listagem real de pedidos. */}
      <PedidosLista pedidos={pedidosMock} />
    </div>
  );
}

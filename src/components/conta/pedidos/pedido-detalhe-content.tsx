"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { useAuth } from "@/contexts/AuthContext";
import { usePedido } from "@/hooks/usePedidos";
import { PedidoDetalhe } from "./pedido-detalhe";
import { PedidoDetalheSkeleton } from "./pedidos-skeleton";

/** Página de detalhe: busca o pedido pelo id da rota e cuida dos estados de carregando, erro e não encontrado. */
export function PedidoDetalheContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { status, data, notFound, retry } = usePedido(id);

  if (status === "loading") return <PedidoDetalheSkeleton />;

  if (status === "error" && notFound) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Pedido não encontrado"
        description="Esse pedido não existe ou não pertence à sua conta."
        action={{ label: "Voltar para Meus pedidos", onClick: () => router.push("/conta/pedidos") }}
      />
    );
  }

  if (status === "error") {
    return (
      <ListMessage
        role="alert"
        variant="primary"
        title="Não foi possível carregar o pedido"
        description="Verifique sua conexão e tente novamente."
        actionLabel="Tentar novamente"
        onAction={retry}
      />
    );
  }

  return <PedidoDetalhe pedido={data} participante={user?.fullName ?? ""} />;
}

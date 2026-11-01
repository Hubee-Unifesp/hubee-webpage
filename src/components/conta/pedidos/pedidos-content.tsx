"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidosLista } from "./pedidos-lista";
import { PedidosSkeleton } from "./pedidos-skeleton";

/** Página Meus pedidos: busca os pedidos do usuário logado e cuida dos estados de carregando, erro e vazio. */
export function PedidosContent() {
  const router = useRouter();
  const { status, data, retry } = usePedidos();

  return (
    <div className="flex flex-col gap-4">
      <ContaPageTitle>Meus Pedidos</ContaPageTitle>

      {status === "loading" && <PedidosSkeleton />}

      {status === "error" && (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar seus pedidos"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={retry}
        />
      )}

      {status === "ok" &&
        (data.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Você ainda não fez nenhum pedido"
            description="Quando você comprar ingressos, seus pedidos aparecem aqui."
            action={{ label: "Ver eventos", onClick: () => router.push("/eventos") }}
          />
        ) : (
          <PedidosLista pedidos={data} />
        ))}
    </div>
  );
}

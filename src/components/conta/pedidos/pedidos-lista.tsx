"use client";

import { useState } from "react";
import { ListFilter, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import type { Pedido, StatusPedido } from "@/types/pedido";
import { PedidoCard } from "./pedido-card";
import { statusPedidoConfig, statusPedidoOrdem } from "./status-pedido";

/** Lista de pedidos com filtro por status (clique de novo no filtro ativo para limpar). */
export function PedidosLista({ pedidos }: { pedidos: Pedido[] }) {
  const [filtro, setFiltro] = useState<StatusPedido | null>(null);
  const visiveis = filtro ? pedidos.filter((pedido) => pedido.status === filtro) : pedidos;

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Filtrar pedidos por status" className="flex flex-wrap items-center gap-2">
        <ListFilter aria-hidden="true" className="size-4" />
        {statusPedidoOrdem.map((status) => {
          const ativo = filtro === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={ativo}
              onClick={() => setFiltro(ativo ? null : status)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-0.5 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-hubee-800 dark:focus-visible:ring-hubee-400",
                ativo
                  ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                  : "border-current hover:bg-hubee-100 dark:hover:bg-hubee-750",
              )}
            >
              {statusPedidoConfig[status].filterLabel}
            </button>
          );
        })}
      </div>

      <p role="status" className="sr-only">
        {visiveis.length} {visiveis.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
      </p>

      {visiveis.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum pedido encontrado"
          description="Você não tem pedidos com esse status."
          action={filtro ? { label: "Limpar filtro", onClick: () => setFiltro(null) } : undefined}
        />
      ) : (
        <ul className="divide-y divide-hubee-300 overflow-hidden rounded-xl border border-hubee-300 bg-hubee-100 shadow-sm">
          {visiveis.map((pedido) => (
            <li key={pedido.id}>
              <PedidoCard pedido={pedido} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

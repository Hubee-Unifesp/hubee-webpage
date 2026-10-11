import type { StatusPedido } from "@/types/pedido";
import { cn } from "@/lib/utils";

export const statusPedidoConfig: Record<StatusPedido, { label: string; filterLabel: string; className: string }> = {
  pago: { label: "Pago", filterLabel: "Pagos", className: "bg-emerald-100 text-emerald-800" },
  pendente: { label: "Pendente", filterLabel: "Pendentes", className: "bg-orange-100 text-orange-800" },
  cancelado: { label: "Cancelado", filterLabel: "Cancelados", className: "bg-rose-100 text-rose-800" },
  estornado: { label: "Estornado", filterLabel: "Estornados", className: "bg-sky-100 text-sky-800" },
};

export const statusPedidoOrdem: readonly StatusPedido[] = ["pago", "pendente", "cancelado", "estornado"];

export function StatusBadge({ status, className }: { status: StatusPedido; className?: string }) {
  const { label, className: color } = statusPedidoConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", color, className)}>
      {label}
    </span>
  );
}

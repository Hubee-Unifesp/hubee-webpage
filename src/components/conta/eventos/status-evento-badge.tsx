import { cn } from "@/lib/utils";
import type { FiltroStatusEvento, StatusEvento } from "@/types/organizacao";

export const statusEventoConfig: Record<
  StatusEvento,
  { label: string; filterLabel: string; className: string }
> = {
  published: {
    label: "Publicado",
    filterLabel: "Publicados",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  draft: {
    label: "Rascunho",
    filterLabel: "Rascunhos",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  finished: {
    label: "Encerrado",
    filterLabel: "Encerrados",
    className:
      "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300",
  },
  cancelled: {
    label: "Cancelado",
    filterLabel: "Cancelados",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300",
  },
};

export const filtroStatusEventoOrdem: readonly FiltroStatusEvento[] = [
  "all",
  "published",
  "draft",
  "finished",
  "cancelled",
];

export function getFiltroStatusLabel(filtro: FiltroStatusEvento): string {
  if (filtro === "all") return "Todos";
  return statusEventoConfig[filtro].filterLabel;
}

export function StatusEventoBadge({
  status,
  className,
}: {
  status: StatusEvento;
  className?: string;
}) {
  const { label, className: badgeColors } = statusEventoConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        badgeColors,
        className,
      )}
    >
      {label}
    </span>
  );
}


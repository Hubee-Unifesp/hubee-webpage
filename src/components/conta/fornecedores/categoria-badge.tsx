import { cn } from "@/lib/utils";

/** Selo da categoria do fornecedor. Sem categoria, mostra "—". */
export function CategoriaBadge({ category, className }: { category: string | null; className?: string }) {
  if (!category) {
    return (
      <span className={cn("text-hubee-neutral-300 dark:text-hubee-200", className)}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Sem categoria</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full bg-hubee-200 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-hubee-800 dark:bg-hubee-750 dark:text-hubee-50",
        className,
      )}
    >
      {category}
    </span>
  );
}

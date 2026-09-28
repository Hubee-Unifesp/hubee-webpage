import type { CategorySummary, EventCategory } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./categories.config";

interface CategoryFilterProps {
  categories: CategorySummary[];
  selected: EventCategory | null;
  onChange: (category: EventCategory | null) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const visible = categories.filter(({ count }) => count > 0);
  if (visible.length === 0) return null;

  return (
    <div role="group" aria-label="Filtrar por categoria" className="mt-3 flex flex-wrap justify-center gap-2">
      {visible.map(({ category, count }) => {
        const { label, icon: Icon } = categoryConfig[category];
        const active = selected === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : category)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-hubee-400",
              active
                ? "border-hubee-750 bg-hubee-750 text-hubee-50 hover:text-hubee-400 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:border-hubee-50 dark:hover:bg-hubee-50"
                : "border-hubee-400 bg-hubee-100 text-hubee-750 hover:bg-hubee-400 hover:text-hubee-800 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:border-hubee-400 dark:hover:bg-hubee-400 dark:hover:text-hubee-800",
            )}
          >
            <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
            {label}
            <span className="tabular-nums opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

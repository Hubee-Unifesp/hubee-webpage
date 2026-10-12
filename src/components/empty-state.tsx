import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/** Estado vazio: ícone, texto e botão de ação opcional. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-center rounded-xl border border-hubee-400 bg-hubee-100 px-6 py-10 text-center text-hubee-750 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-hubee-400 text-hubee-800">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm">{description}</p>}
      {action && (
        <Button
          type="button"
          variant="hubee_750"
          onClick={action.onClick}
          className="mt-4 h-10 px-5 text-sm font-semibold hover:text-hubee-400 focus-visible:ring-hubee-400 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:hover:text-hubee-800"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

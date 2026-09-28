import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { eventCardClassName } from "./event-card";

export function EventCardSkeleton() {
  return (
    <div aria-hidden="true" className={cn(eventCardClassName, "animate-pulse")}>
      <div className="h-24 bg-hubee-200 md:h-32 dark:bg-hubee-700" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-4 w-1/4 rounded-full bg-hubee-200 dark:bg-hubee-700" />
        <div className="h-4 w-4/5 rounded-full bg-hubee-200 dark:bg-hubee-700" />
        <div className="h-4 w-1/2 rounded-full bg-hubee-200 dark:bg-hubee-700" />
        <div className="h-4 w-3/5 rounded-full bg-hubee-200 dark:bg-hubee-700" />
      </div>
    </div>
  );
}

export function EventListsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex w-full flex-col gap-10">
      <span className="sr-only">Carregando eventos…</span>
      {Array.from({ length: 2 }, (_, row) => (
        <div key={row}>
          <div className="h-5 w-32 animate-pulse rounded-full bg-hubee-200 dark:bg-hubee-700" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-hubee-200 dark:bg-hubee-700" />
          <div className="mt-4 flex gap-3 overflow-hidden md:gap-4">
            {Array.from({ length: 5 }, (_, card) => (
              <div key={card} className="w-44 shrink-0 md:w-60">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ListMessageProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant: "primary" | "outline";
  role?: "alert" | "status";
}

export function ListMessage({ title, description, actionLabel, onAction, variant, role = "status" }: ListMessageProps) {
  return (
    <div
      role={role}
      className="flex w-full flex-col items-center rounded-xl border border-hubee-400 bg-hubee-100 px-6 py-10 text-center text-hubee-750 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50"
    >
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
      <Button
        type="button"
        onClick={onAction}
        variant={variant === "primary" ? "hubee_750" : "outline"}
        className={cn(
          "mt-4 h-10 px-5 text-sm font-semibold focus-visible:ring-hubee-400",
          variant === "primary"
            ? "hover:text-hubee-400 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:hover:text-hubee-800"
            : "border-hubee-750 bg-transparent text-hubee-750 hover:bg-hubee-200 dark:border-hubee-50 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-700",
        )}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

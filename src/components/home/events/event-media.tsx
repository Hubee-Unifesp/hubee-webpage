import { cn } from "@/lib/utils";
import type { EventCategory } from "@/lib/api/events";
import { categoryConfig } from "./categories.config";
import { formatDateBadge } from "./format";

const hexagons = [
  { cx: 30, cy: 128, r: 30 },
  { cx: 150, cy: 18, r: 46 },
  { cx: 214, cy: 112, r: 26 },
  { cx: 268, cy: 44, r: 40 },
];

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

export function HexPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 280 150"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 size-full", className)}
    >
      {hexagons.map(({ cx, cy, r }) => (
        <polygon
          key={`${cx}-${cy}`}
          points={hexPoints(cx, cy, r)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
        />
      ))}
    </svg>
  );
}

export function DateBadge({ date, className }: { date: string; className?: string }) {
  const { day, month } = formatDateBadge(date);
  return (
    <span
      className={cn(
        "absolute top-3 left-3 flex min-w-11 flex-col items-center rounded-lg bg-hubee-50 px-2 py-1 leading-none text-hubee-800 shadow-sm",
        className,
      )}
    >
      <span className="text-lg font-bold">{day}</span>
      <span className="mt-0.5 text-[10px] font-semibold">{month}</span>
    </span>
  );
}

interface EventMediaProps {
  category: EventCategory;
  startDate: string;
  soldOut?: boolean;
  className?: string;
}


export function EventMedia({ category, startDate, soldOut, className }: EventMediaProps) {
  const { label, icon: Icon, mediaClassName, patternClassName } = categoryConfig[category];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        mediaClassName,
        soldOut && "opacity-60",
        className,
      )}
    >
      <HexPattern className={patternClassName} />
      <DateBadge date={startDate} />
      {soldOut && (
        <span className="absolute top-3 right-3 rounded-full bg-hubee-neutral-50 px-2.5 py-1 text-xs font-semibold text-hubee-neutral-500">
          Esgotado
        </span>
      )}
      <Icon aria-hidden="true" strokeWidth={1.5} className="relative hidden size-9 md:block" />
      <span aria-hidden="true" className="relative truncate pl-14 pr-2 text-[10px] font-semibold tracking-[0.15em] uppercase md:hidden">
        {label}
      </span>
    </div>
  );
}

export function CategoryPill({ category, className }: { category: EventCategory; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full border border-hubee-400 bg-hubee-50 px-2.5 py-0.5 text-xs font-medium text-hubee-800 dark:border-hubee-500 dark:bg-hubee-800 dark:text-hubee-50",
        className,
      )}
    >
      {categoryConfig[category].label}
    </span>
  );
}

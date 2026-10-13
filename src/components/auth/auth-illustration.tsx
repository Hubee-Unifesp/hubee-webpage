import { cn } from "@/lib/utils";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";

const singleCell: readonly HoneycombCell[] = [[0, 0]];

const desktopCells: readonly HoneycombCell[] = [
  [0, 0], [0, 2], [0, 4],
  [1, 1], [1, 3], [1, 5], [1, 7],
  [2, 0], [2, 2], [2, 4],
  [3, 1], [3, 3], [3, 5], [3, 7],
];

const outlinedCell = "fill-none stroke-hubee-800 stroke-1 dark:stroke-hubee-50";

const mobileCells = [
  { left: "-15%", top: "40%", width: "40%", className: "fill-hubee-neutral-50 stroke-none dark:opacity-15" },
  { left: "0%", top: "0%", width: "40%", className: outlinedCell },
  { left: "10%", top: "40%", width: "40%", className: outlinedCell },
  { left: "30%", top: "0%", width: "30%", className: cn(outlinedCell, "[stroke-width:0.5]") },
  { left: "35%", top: "50%", width: "40%", className: outlinedCell },
];

export function AuthIllustration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-0 h-50 overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[37%]",
        className,
      )}
    >
      <div className="relative h-full w-full lg:hidden">
        {mobileCells.map(({ left, top, width, className: cellClassName }) => (
          <Honeycomb
            key={`${left}-${top}`}
            cells={singleCell}
            className={cn("absolute h-auto", cellClassName)}
            style={{ left, top, width }}
          />
        ))}
      </div>
      <Honeycomb
        cells={desktopCells}
        className="absolute top-0 left-[11.3%] hidden h-auto w-[92.4%] -translate-y-[14.3%] fill-hubee-750/70 stroke-hubee-700 stroke-2 lg:block"
      />
    </div>
  );
}

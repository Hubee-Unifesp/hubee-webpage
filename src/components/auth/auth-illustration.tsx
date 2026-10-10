import { cn } from "@/lib/utils";
import { HoneycombPattern } from "@/components/ui/honeycomb-pattern";
import { HoneycombGrid } from "@/components/auth/honeycomb-grid";

const mobileCells = [
    { left: "-15%", top: "40%", size: "40%", strokeWidth: "0", fill: "#E6E2D8", darkOpacity: "dark:opacity-15" },
    { left: "0%", top: "0%", size: "40%", color: "text-hubee-800 dark:text-hubee-50", strokeWidth: "1", fill: "transparent" },
    { left: "10%", top: "40%", size: "40%", color: "text-hubee-800 dark:text-hubee-50", strokeWidth: "1", fill: "transparent" },
    { left: "30%", top: "0%", size: "30%", color: "text-hubee-800 dark:text-hubee-50", strokeWidth: "0.5", fill: "transparent" },
    { left: "35%", top: "50%", size: "40%", color: "text-hubee-800 dark:text-hubee-50", strokeWidth: "1", fill: "transparent" },
];

type AuthIllustrationProps = {
    className?: string;
};

export function AuthIllustration({ className }: AuthIllustrationProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-0 h-50 overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[37%]",
                className,
            )}
        >
            <div className="relative h-full w-full lg:hidden">
                {mobileCells.map(({ left, top, size, color, strokeWidth, fill, darkOpacity }) => (
                    <HoneycombPattern
                        key={`${left}-${top}`}
                        className={cn("absolute h-auto transition-all", color, darkOpacity)}
                        style={{ left, top, width: size }}
                        strokeWidth={strokeWidth}
                        fill={fill}
                    />
                ))}
            </div>
            <HoneycombGrid className="hidden h-auto w-full lg:block" />
        </div>
    );
}
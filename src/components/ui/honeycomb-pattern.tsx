import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type HoneycombPatternProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: string | number;
  fill?: string;
  fillOpacity?: string | number;
};

export function HoneycombPattern({
  className,
  strokeWidth = "2",
  fill = "none",
  fillOpacity,
  ...props
}: HoneycombPatternProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 120 110"
      className={cn("pointer-events-none", className)}
      {...props}
    >
      <path
        d="M30 5h60l27 50-27 50H30L3 55 30 5Z"
        fill={fill}
        fillOpacity={fillOpacity}
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
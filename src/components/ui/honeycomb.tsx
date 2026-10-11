import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Posição de um hexágono em coordenadas dobradas: na mesma coluna, vizinhos ficam a 2 linhas;
 * em colunas vizinhas, a 1 linha. Ex.: `[0, 0]`, `[0, 2]`, `[1, 1]` formam três hexágonos encostados.
 */
export type HoneycombCell = readonly [col: number, row: number];

export type HoneycombOrientation = "flat" | "pointy";

type HoneycombProps = Omit<ComponentProps<"svg">, "children" | "viewBox"> & {
  cells: readonly HoneycombCell[];
  orientation?: HoneycombOrientation;
};

const RADIUS = 100;
const PADDING = 5;
const HALF_SIDE = (Math.sqrt(3) / 2) * RADIUS;

const cornerOffsets: Record<HoneycombOrientation, readonly (readonly [number, number])[]> = {
  flat: Array.from({ length: 6 }, (_, i) => polar((Math.PI / 3) * i)),
  pointy: Array.from({ length: 6 }, (_, i) => polar((Math.PI / 3) * i - Math.PI / 2)),
};

function polar(angle: number) {
  return [RADIUS * Math.cos(angle), RADIUS * Math.sin(angle)] as const;
}

function cellCenter([col, row]: HoneycombCell, orientation: HoneycombOrientation) {
  return orientation === "flat"
    ? { x: col * 1.5 * RADIUS, y: row * HALF_SIDE }
    : { x: col * HALF_SIDE, y: row * 1.5 * RADIUS };
}

export function Honeycomb({ cells, orientation = "flat", className, ...props }: HoneycombProps) {
  const corners = cornerOffsets[orientation];
  const polygons = cells.map((cell) => {
    const { x, y } = cellCenter(cell, orientation);
    return corners.map(([dx, dy]) => [x + dx, y + dy] as const);
  });

  const xs = polygons.flat().map(([x]) => x);
  const ys = polygons.flat().map(([, y]) => y);
  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const width = Math.max(...xs) + PADDING - minX;
  const height = Math.max(...ys) + PADDING - minY;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={[minX, minY, width, height].map((value) => value.toFixed(1)).join(" ")}
      strokeLinejoin="round"
      className={cn("pointer-events-none", className)}
      {...props}
    >
      {polygons.map((points, index) => (
        <polygon
          key={cells[index].join(",")}
          points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

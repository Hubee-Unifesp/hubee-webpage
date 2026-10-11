
const S = 14;                    
const DX = 1.5 * S;              // passo horizontal entre colunas
const DY = Math.sqrt(3) * S;     // passo vertical entre linhas
const COLS = 4, ROWS = 3;
const X0 = 26, Y0 = -3;          // deslocamento inicial 

function hexPoints(cx: number, cy: number) {
  return [0, 60, 120, 180, 240, 300]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `${cx + S * Math.cos(r)},${cy + S * Math.sin(r)}`;
    })
    .join(" ");
}

const cells = Array.from({ length: COLS }, (_, col) =>
  Array.from({ length: ROWS + (col % 2) }, (_, row) => ({
    cx: X0 + col * DX,
    cy: Y0 + row * DY + (col % 2) * (DY / 2),
  })),
).flat();

export function HoneycombGrid({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      {cells.map(({ cx, cy }) => (
        <polygon
          key={`${cx}-${cy}`}
          points={hexPoints(cx, cy)}
          className="fill-[#4a3100] stroke-hubee-700"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
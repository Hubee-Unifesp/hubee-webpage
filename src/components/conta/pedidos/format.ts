const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Data da compra, no formato 12/10/2026. */
export function formatOrderDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

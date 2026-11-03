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

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Data e hora da compra, no formato 12/10/2026 às 14:30. */
export function formatOrderDateTime(iso: string): string {
  const parts = dateTimeFormatter.formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  return `${day}/${month}/${year} às ${hour}:${minute}`;
}

/** Nome legível do método de pagamento. */
export function formatPaymentMethod(method?: string | null): string {
  if (!method) return "Não informado";
  const normalized = method.toLowerCase();
  const map: Record<string, string> = {
    pix: "PIX",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
    boleto: "Boleto Bancário",
    transferencia: "Transferência Bancária",
  };
  return map[normalized] ?? method;
}

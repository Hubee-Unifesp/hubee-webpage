import type { AgeRating, EventAddress } from "@/lib/api/events";

const TIME_ZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
});

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "21 nov 2026 • Sábado • 20h" (ou "20h30" quando há minutos). */
export function formatEventDateTime(iso: string): string {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(new Date(iso)).map(({ type, value }) => [type, value.replace(".", "")]),
  );
  const time = parts.minute === "00" ? `${parts.hour}h` : `${parts.hour}h${parts.minute}`;
  return `${parts.day} ${parts.month} ${parts.year} • ${capitalize(parts.weekday)} • ${time}`;
}

/** "05404005" → "05404-005". */
export function formatZipCode(zipCode: string): string {
  const digits = zipCode.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : zipCode;
}

/** Linhas do endereço: "Rua X, 123 — Bairro" e "Cidade – UF • CEP 00000-000". */
export function formatAddressLines(address: EventAddress): [string, string] {
  const complement = address.complement ? ` (${address.complement})` : "";
  return [
    `${address.street}, ${address.number}${complement} — ${address.neighborhood}`,
    `${address.city} – ${address.state} • CEP ${formatZipCode(address.zipCode)}`,
  ];
}

export function mapsHref(venueName: string, address: EventAddress): string {
  const query = [venueName, `${address.street}, ${address.number}`, address.city, address.state].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Texto curto ("18+") e acessível ("Classificação: 18 anos") da classificação indicativa. */
export function formatAgeRating(rating: AgeRating): { short: string; label: string } {
  if (rating === "L") return { short: "Livre", label: "Classificação indicativa: livre para todos os públicos" };
  return { short: `${rating}+`, label: `Classificação indicativa: a partir de ${rating} anos` };
}

/** Inicial do avatar da organização, pela última palavra do nome ("Coletivo Entro" → "e."). */
export function organizerInitial(name: string): string {
  const lastWord = name.trim().split(/\s+/).at(-1) ?? "";
  return `${lastWord.charAt(0).toLowerCase()}.`;
}

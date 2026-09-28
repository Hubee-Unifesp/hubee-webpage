const TIME_ZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
});

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface DateParts {
  weekday: string;
  day: string;
  month: string;
  time: string;
  key: string;
}

function getParts(iso: string): DateParts {
  const parts = Object.fromEntries(
    dateFormatter
      .formatToParts(new Date(iso))
      .map(({ type, value }) => [type, value.replace(".", "")]),
  );
  const weekday = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1);
  const time = parts.minute === "00" ? `${parts.hour}h` : `${parts.hour}h${parts.minute}`;
  return {
    weekday,
    day: parts.day,
    month: parts.month,
    time,
    key: `${parts.day}-${parts.month}`,
  };
}

export function formatEventDate(startDate: string, endDate: string): string {
  const start = getParts(startDate);
  const end = getParts(endDate);
  const spansDays =
    new Date(endDate).getTime() - new Date(startDate).getTime() > 24 * 60 * 60 * 1000;

  if (!spansDays || start.key === end.key) {
    return `${start.weekday}, ${start.day} ${start.month} · ${start.time}`;
  }
  const from = start.month === end.month ? start.day : `${start.day} ${start.month}`;
  return `${from} a ${end.day} ${end.month} · ${start.time}`;
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = getParts(startDate);
  const end = getParts(endDate);
  return `${start.day} ${start.month} – ${end.day} ${end.month}`;
}

export function formatDateBadge(iso: string): { day: string; month: string } {
  const { day, month } = getParts(iso);
  return { day: day.padStart(2, "0"), month: month.toUpperCase() };
}

export function formatPrice(price: number | null): string {
  if (price === null) return "Em breve";
  return price === 0 ? "Gratuito" : priceFormatter.format(price);
}

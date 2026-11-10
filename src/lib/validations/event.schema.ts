import { z } from "zod";
import type { AgeRating, EventCategory } from "@/lib/api/events.types";
import type { EventoEditavel, EventoPayload } from "@/types/evento-editor";

export const EVENT_NAME_MAX_LENGTH = 255;
export const EVENT_EDITION_MAX_LENGTH = 100;

export const EVENT_CATEGORIES = ["festas", "shows", "palestras", "esportes", "academicos", "outros"] as const satisfies
  readonly EventCategory[];

export const AGE_RATINGS = ["L", "10", "12", "14", "16", "18"] as const satisfies readonly AgeRating[];

function toTime(value: string): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

const dateField = (message: string) => z.string().refine((value) => toTime(value) !== null, { error: message });

function hasDateStrings(payload: { value: unknown }): boolean {
  const value = payload.value as Record<string, unknown>;
  return typeof value.startDate === "string" && typeof value.endDate === "string";
}

function hasSalesDateStrings(payload: { value: unknown }): boolean {
  const value = payload.value as Record<string, unknown>;
  return typeof value.startDate === "string" && typeof value.salesStartDate === "string";
}

export const eventSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "O nome do evento é obrigatório." })
      .max(EVENT_NAME_MAX_LENGTH, { error: `O nome deve ter no máximo ${EVENT_NAME_MAX_LENGTH} caracteres.` }),
    category: z.union([z.literal(""), z.enum(EVENT_CATEGORIES)]),
    edition: z
      .string()
      .trim()
      .max(EVENT_EDITION_MAX_LENGTH, { error: `A edição deve ter no máximo ${EVENT_EDITION_MAX_LENGTH} caracteres.` }),
    ageRating: z.union([z.literal(""), z.enum(AGE_RATINGS)]),
    description: z.string().trim(),
    startDate: dateField("Informe a data e o horário de início."),
    endDate: dateField("Informe a data e o horário de término."),
    salesStartDate: z.string().refine((value) => !value || toTime(value) !== null, { error: "Data inválida." }),
    venueId: z.string().min(1, { error: "Selecione o local do evento." }),
  })
  .refine(
    ({ startDate, endDate }) => {
      const start = toTime(startDate);
      const end = toTime(endDate);
      return start === null || end === null || end > start;
    },
    {
      path: ["endDate"],
      error: "A data de término deve ser posterior à data de início.",
      when: hasDateStrings,
    },
  )
  .refine(
    ({ startDate, salesStartDate }) => {
      const start = toTime(startDate);
      const sales = toTime(salesStartDate);
      return start === null || sales === null || sales <= start;
    },
    {
      path: ["salesStartDate"],
      error: "A data de início das vendas não pode ser posterior ao início do evento.",
      when: hasSalesDateStrings,
    },
  );

export type EventFormInputs = z.input<typeof eventSchema>;
export type EventFormValues = z.output<typeof eventSchema>;

export const emptyEventForm: EventFormInputs = {
  name: "",
  category: "",
  edition: "",
  ageRating: "",
  description: "",
  startDate: "",
  endDate: "",
  salesStartDate: "",
  venueId: "",
};

export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toEventFormValues(evento: EventoEditavel | null): EventFormInputs {
  if (!evento) return emptyEventForm;
  return {
    name: evento.name,
    category: evento.category ?? "",
    edition: evento.edition ?? "",
    ageRating: evento.ageRating ?? "",
    description: evento.description ?? "",
    startDate: toDateTimeLocal(evento.startDate),
    endDate: toDateTimeLocal(evento.endDate),
    salesStartDate: toDateTimeLocal(evento.salesStartDate),
    venueId: evento.venueId,
  };
}

/**
 * Opcionais vazios vão como `null`, e não omitidos: na edição o `PATCH` só muda o que vem no corpo,
 * então omitir um campo apagado manteria o valor antigo gravado.
 */
export function toEventPayload(values: EventFormValues, organizerId: string): EventoPayload {
  return {
    name: values.name,
    organizerId,
    venueId: values.venueId,
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
    salesStartDate: values.salesStartDate ? new Date(values.salesStartDate).toISOString() : null,
    description: values.description || null,
    category: values.category || null,
    edition: values.edition || null,
    ageRating: values.ageRating || null,
  };
}

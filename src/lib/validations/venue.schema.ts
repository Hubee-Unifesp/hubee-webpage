import { z } from "zod";
import type { LocalPayload } from "@/types/evento-editor";

export const VENUE_NAME_MAX_LENGTH = 255;
export const ADDRESS_STREET_MAX_LENGTH = 255;
export const ADDRESS_NUMBER_MAX_LENGTH = 20;
export const ADDRESS_COMPLEMENT_MAX_LENGTH = 255;
export const ADDRESS_NEIGHBORHOOD_MAX_LENGTH = 100;
export const ADDRESS_CITY_MAX_LENGTH = 100;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const requiredText = (label: string, max: number, feminino = false) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} é ${feminino ? "obrigatória" : "obrigatório"}.` })
    .max(max, { error: `${label} deve ter no máximo ${max} caracteres.` });

export const venueSchema = z.object({
  name: requiredText("O nome do local", VENUE_NAME_MAX_LENGTH),
  maxCapacity: z.string().superRefine((value, ctx) => {
    const raw = value.trim();
    if (raw === "") {
      ctx.addIssue({ code: "custom", message: "Informe a capacidade máxima." });
    } else if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
      ctx.addIssue({ code: "custom", message: "A capacidade deve ser um número inteiro maior que zero." });
    }
  }),
  zipCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, { error: "CEP inválido." }),
  street: requiredText("O logradouro", ADDRESS_STREET_MAX_LENGTH),
  number: requiredText("O número", ADDRESS_NUMBER_MAX_LENGTH),
  complement: z.string().trim().max(ADDRESS_COMPLEMENT_MAX_LENGTH, {
    error: `O complemento deve ter no máximo ${ADDRESS_COMPLEMENT_MAX_LENGTH} caracteres.`,
  }),
  neighborhood: requiredText("O bairro", ADDRESS_NEIGHBORHOOD_MAX_LENGTH),
  city: requiredText("A cidade", ADDRESS_CITY_MAX_LENGTH, true),
  state: z.union([z.literal(""), z.enum(UFS)]).refine((value) => value !== "", { error: "Selecione o estado." }),
});

export type VenueFormInputs = z.input<typeof venueSchema>;
export type VenueFormValues = z.output<typeof venueSchema>;

export const emptyVenueForm: VenueFormInputs = {
  name: "",
  maxCapacity: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function toVenuePayload(values: VenueFormValues): LocalPayload {
  return {
    name: values.name,
    maxCapacity: Number(values.maxCapacity.trim()),
    address: {
      zipCode: values.zipCode,
      street: values.street,
      number: values.number,
      ...(values.complement && { complement: values.complement }),
      neighborhood: values.neighborhood,
      city: values.city,
      state: values.state,
    },
  };
}

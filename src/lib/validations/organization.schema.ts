import { z } from "zod";

export const ORGANIZATION_NAME_MIN_LENGTH = 2;
export const ORGANIZATION_NAME_MAX_LENGTH = 255;
export const ORGANIZATION_DESCRIPTION_MAX_LENGTH = 500;

export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Informe o nome da organização." })
    .min(ORGANIZATION_NAME_MIN_LENGTH, {
      error: `O nome da organização deve ter pelo menos ${ORGANIZATION_NAME_MIN_LENGTH} caracteres.`,
    })
    .max(ORGANIZATION_NAME_MAX_LENGTH, {
      error: `O nome da organização deve ter no máximo ${ORGANIZATION_NAME_MAX_LENGTH} caracteres.`,
    }),
  description: z
    .string()
    .trim()
    .max(ORGANIZATION_DESCRIPTION_MAX_LENGTH, {
      error: `A descrição deve ter no máximo ${ORGANIZATION_DESCRIPTION_MAX_LENGTH} caracteres.`,
    })
    .optional(),
});

export type OrganizationFormInputs = z.infer<typeof organizationSchema>;

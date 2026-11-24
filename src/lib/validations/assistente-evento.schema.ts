import { z } from "zod";
import { ASSISTANT_ANSWER_MAX_LENGTH } from "@/lib/api/event-ai-assistant.types";

export const respostaAssistenteSchema = z.object({
  resposta: z
    .string()
    .trim()
    .min(1, "Escreva uma resposta para continuar.")
    .max(ASSISTANT_ANSWER_MAX_LENGTH, `A resposta deve ter no máximo ${ASSISTANT_ANSWER_MAX_LENGTH} caracteres.`),
});

export type RespostaAssistenteInputs = z.input<typeof respostaAssistenteSchema>;
export type RespostaAssistenteValues = z.output<typeof respostaAssistenteSchema>;

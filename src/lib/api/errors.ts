import { isAxiosError } from 'axios';

export type ApiError = {
  /** Ausente quando a API nem respondeu (rede fora do ar, timeout). */
  status?: number;
  /** O Nest devolve `message` como texto ou como lista (falhas de validação). */
  messages: string[];
};

export function parseApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) return { messages: [] };

  const message: unknown = error.response?.data?.message;
  const messages = Array.isArray(message) ? message : typeof message === 'string' ? [message] : [];
  return { status: error.response?.status, messages: messages.filter((item) => typeof item === 'string') };
}

/**
 * A API não diz em qual campo a validação falhou, só devolve o texto. Associa cada mensagem ao
 * primeiro campo cujo padrão ela casa (a ordem de `matchers` desempata) e devolve o que sobrou.
 */
export function mapMessagesToFields<Field extends string>(
  messages: readonly string[],
  matchers: Record<Field, RegExp>,
): { fields: Partial<Record<Field, string>>; rest: string[] } {
  const fields: Partial<Record<Field, string>> = {};
  const rest: string[] = [];

  for (const message of messages) {
    const field = (Object.keys(matchers) as Field[]).find((name) => matchers[name].test(message));
    if (field && !(field in fields)) fields[field] = message;
    else rest.push(message);
  }

  return { fields, rest };
}

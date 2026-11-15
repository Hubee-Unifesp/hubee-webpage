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

const MENSAGENS_POR_STATUS: Record<number, string> = {
  400: 'Confira os dados informados e tente novamente.',
  403: 'Você não tem permissão para fazer isso nesta organização.',
  404: 'Não encontramos o que você procura. Ele pode ter sido removido.',
};

/**
 * Mensagem em português para mostrar ao usuário. 400, 409 e 422 usam o texto da API (as regras de
 * negócio já respondem em pt-BR); 403 e 404 têm texto fixo, porque a API não explica o motivo.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a ação. Tente novamente.',
): string {
  if (!isAxiosError(error)) return fallback;
  const { status, messages } = parseApiError(error);
  if (status === undefined) return 'Não foi possível conectar à Hubee. Verifique sua conexão e tente novamente.';
  if ((status === 400 || status === 409 || status === 422) && messages.length > 0) return messages[0];
  return MENSAGENS_POR_STATUS[status] ?? fallback;
}

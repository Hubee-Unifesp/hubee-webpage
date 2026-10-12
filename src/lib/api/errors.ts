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

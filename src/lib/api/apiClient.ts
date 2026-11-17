import axios from 'axios';
import { clearSession, getToken } from '../session';
import { DEFAULT_TIMEOUT_MS, markApiAwake, resolveTimeout } from './api-status';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Um 401 desta chamada é erro de negócio (ex.: senha atual incorreta), não sessão expirada.
     * Sem isso o interceptor apaga o token e manda a pessoa para o login.
     */
    skipAuthRedirect?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.timeout = resolveTimeout(config.timeout);

  const token = getToken();
  const hasExplicitAuth =
    typeof config.headers?.has === 'function'
      ? config.headers.has('Authorization')
      : Boolean(config.headers?.Authorization);

  if (token && config.headers && !hasExplicitAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    markApiAwake();
    return response;
  },
  (error) => {
    if (error.response) markApiAwake();

    if (error.response?.status === 401 && !error.config?.skipAuthRedirect && typeof window !== 'undefined') {
      clearSession();

      const currentPath = window.location.pathname;

      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/cadastro')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

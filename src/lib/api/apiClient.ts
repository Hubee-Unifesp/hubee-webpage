import axios from 'axios';
import { clearSession, getToken } from '../session';

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
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect && typeof window !== 'undefined') {
      clearSession();

      const currentPath = window.location.pathname;

      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

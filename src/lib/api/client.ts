import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

if (!API_URL && typeof window !== "undefined") {
  console.error(
    "NEXT_PUBLIC_API_URL não está definida. Verifique seu arquivo .env.local."
  );
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error(
        `[API] ${error.response.status} - ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error("[API] Sem resposta do servidor:", error.config?.url);
    } else {
      console.error("[API] Erro na configuração da requisição:", error.message);
    }
    return Promise.reject(error);
  }
);
import { apiClient } from "./apiClient";

export interface HealthCheckResponse {
  status: string;
  database?: string;
  [key: string]: unknown;
}

export async function checkHealth(): Promise<HealthCheckResponse> {
  const { data } = await apiClient.get<HealthCheckResponse>("/health");
  return data;
}

export async function pingApi(): Promise<void> {
  await apiClient.get("/health/ping");
}

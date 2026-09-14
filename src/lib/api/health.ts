import { apiClient } from "./client";

export interface HealthCheckResponse {
  status: string;
  database?: string;
  [key: string]: unknown;
}

export async function checkHealth(): Promise<HealthCheckResponse> {
  const { data } = await apiClient.get<HealthCheckResponse>("/health");
  return data;
}
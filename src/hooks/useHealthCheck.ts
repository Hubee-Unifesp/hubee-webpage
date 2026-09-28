import { useEffect, useState } from "react";
import { checkHealth, HealthCheckResponse } from "@/lib/api/health";

export function useHealthCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [data, setData] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    checkHealth()
      .then((res) => {
        setData(res);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, []);

  return { status, data };
}

"use client";
import { useHealthCheck } from "@/hooks/useHealthCheck";

export default function Home() {
  const { status, data } = useHealthCheck();
  return (
    <div style={{ padding: 32 }}>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
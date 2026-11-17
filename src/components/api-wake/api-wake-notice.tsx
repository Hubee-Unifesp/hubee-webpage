"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { pingApi } from "@/lib/api/health";

export const NOTICE_DELAY_MS = 3000;

export function ApiWakeNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) setVisible(true);
    }, NOTICE_DELAY_MS);

    pingApi()
      .catch(() => undefined)
      .finally(() => {
        settled = true;
        clearTimeout(timer);
        setVisible(false);
      });

    return () => {
      settled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="flex items-center gap-2.5 rounded-lg border border-hubee-400 bg-hubee-100 px-4 py-2.5 text-sm text-hubee-800 shadow-lg dark:border-hubee-500 dark:bg-hubee-50 dark:text-hubee-800">
        <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
        <span>Iniciando serviços da colmeia… isso pode levar até um minuto.</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  className?: string;
}

/** Compartilha a página pelo menu nativo do dispositivo ou copia o link como alternativa. */
export function ShareButton({ title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Compartilhamento cancelado pelo usuário: nada a fazer.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copiado" : "Compartilhar evento"}
      className={cn(
        "flex size-9 items-center justify-center rounded-lg bg-hubee-50 text-hubee-800 shadow-sm outline-none transition-colors hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-400",
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Share2 aria-hidden="true" className="size-4" />}
      <span role="status" className="sr-only">
        {copied ? "Link copiado para a área de transferência" : ""}
      </span>
    </button>
  );
}

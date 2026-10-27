"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Parágrafos exibidos antes do "Ver mais". */
const COLLAPSED_PARAGRAPHS = 2;

interface EventDescriptionProps {
  description: string;
}

/** Descrição longa do evento: respeita quebras de linha e recolhe o texto excedente. */
export function EventDescription({ description }: EventDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const paragraphs = description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const canCollapse = paragraphs.length > COLLAPSED_PARAGRAPHS;
  const visible = expanded || !canCollapse ? paragraphs : paragraphs.slice(0, COLLAPSED_PARAGRAPHS);

  return (
    <div>
      <div id={contentId} className="max-w-3xl space-y-4 text-sm leading-relaxed text-hubee-750 md:text-[15px] dark:text-hubee-100">
        {visible.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      {canCollapse && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-hubee-800 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-50"
        >
          {expanded ? "Ver menos" : "Ver mais"}
          <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

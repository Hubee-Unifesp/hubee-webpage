"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const searches = ["calourada", "interatlética", "show de sexta", "palestra de UX", "sunset"];
const TYPE_MS = 85;
const HOLD_MS = 1600;

export function AboutSearchDemo() {
  const [wordIndex, setWordIndex] = useState(0);
  const [length, setLength] = useState(searches[0].length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const word = searches[wordIndex];
    const timer = window.setTimeout(
      () => {
        if (length < word.length) {
          setLength(length + 1);
          return;
        }
        setWordIndex((wordIndex + 1) % searches.length);
        setLength(0);
      },
      length < word.length ? TYPE_MS : HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [wordIndex, length]);

  return (
    <div aria-hidden="true" className="flex h-12 items-center gap-3 rounded-full bg-hubee-50 px-5 text-hubee-800 dark:bg-hubee-50/5 dark:text-hubee-50">
      <Search className="size-4 shrink-0 dark:text-hubee-400" strokeWidth={2.25} />
      <span className="truncate text-sm font-medium">
        {searches[wordIndex].slice(0, length)}
        <span className="ml-px inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-current motion-reduce:animate-none" />
      </span>
    </div>
  );
}

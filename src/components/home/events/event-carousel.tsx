"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface EventCarouselProps {
  id: string;
  title: string;
  subtitle: string;
  viewAllHref?: string;
  itemClassName: string;
  children: ReactNode[];
}

export function EventCarousel({ id, title, subtitle, viewAllHref, itemClassName, children }: EventCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScroll({
      prev: track.scrollLeft > 1,
      next: track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateScrollState]);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  const titleId = `${id}-titulo`;

  return (
    <section aria-labelledby={titleId} className="group/row w-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3
            id={titleId}
            className={cn(displayFont.className, "text-2xl leading-none uppercase text-hubee-800 md:text-[2rem] dark:text-hubee-50")}
          >
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-hubee-750 dark:text-hubee-200/80">{subtitle}</p>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            aria-label={`Ver todos: ${title}`}
            className="group/link inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-hubee-750 outline-none transition-colors hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-400 dark:hover:bg-hubee-50/10"
          >
            Ver todos
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="relative -mx-4 mt-4 sm:-mx-8">
        <ul
          ref={trackRef}
          onScroll={updateScrollState}
          className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-4 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 md:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {children.map((child, index) => (
            <li key={index} className={cn("shrink-0 snap-start", itemClassName)}>
              {child}
            </li>
          ))}
        </ul>

        <EdgeButton side="prev" label={`Anteriores: ${title}`} visible={canScroll.prev} onClick={() => scroll(-1)} />
        <EdgeButton side="next" label={`Próximos: ${title}`} visible={canScroll.next} onClick={() => scroll(1)} />
      </div>
    </section>
  );
}

function EdgeButton({
  side,
  label,
  visible,
  onClick,
}: {
  side: "prev" | "next";
  label: string;
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = side === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "absolute top-[38%] z-20 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-hubee-50 text-hubee-900 shadow-lg transition-[opacity,transform] duration-300 hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400 md:flex dark:bg-hubee-50 dark:text-hubee-900",
        side === "prev" ? "left-3 sm:left-5" : "right-3 sm:right-5",
        visible ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon aria-hidden="true" className="size-6" />
    </button>
  );
}

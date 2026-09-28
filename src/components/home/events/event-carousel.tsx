"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  const titleId = `${id}-titulo`;

  return (
    <section aria-labelledby={titleId} className="w-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id={titleId} className="font-sans text-lg font-bold text-hubee-800 md:text-xl dark:text-hubee-50">
            {title}
          </h3>
          <p className="text-xs text-hubee-750 md:text-sm dark:text-hubee-100">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              aria-label={`Ver todos: ${title}`}
              className="inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-hubee-750 outline-none hover:text-hubee-600 focus-visible:ring-3 focus-visible:ring-hubee-400 md:text-sm dark:text-hubee-400 dark:hover:text-hubee-200"
            >
              Ver todos
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          )}
          <div className="hidden items-center gap-1.5 md:flex">
            <CarouselButton label={`Anteriores: ${title}`} disabled={!canScroll.prev} onClick={() => scroll(-1)}>
              <ChevronLeft aria-hidden="true" />
            </CarouselButton>
            <CarouselButton label={`Próximos: ${title}`} disabled={!canScroll.next} onClick={() => scroll(1)}>
              <ChevronRight aria-hidden="true" />
            </CarouselButton>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={updateScrollState}
        className="-mx-1 mt-3 flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto px-1 pt-1 pb-3 [scrollbar-width:none] md:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <li key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CarouselButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="size-7 border-hubee-400 bg-hubee-100 text-hubee-800 hover:bg-hubee-200 focus-visible:ring-hubee-400 disabled:opacity-40 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:bg-hubee-700"
    >
      {children}
    </Button>
  );
}

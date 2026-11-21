"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventCategory } from "@/lib/api/events";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { displayFont as display } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./events/categories.config";
import { HexPattern } from "./events/event-media";


interface HeroTicket {
  category: EventCategory;
  title: string;
  detail: string;
}

const tickets: readonly HeroTicket[] = [
  { category: "festas", title: "Festa", detail: "Pista cheia até o sol nascer" },
  { category: "shows", title: "Show", detail: "Palco aberto, setlist completa" },
  { category: "esportes", title: "Jogos", detail: "Arquibancada lotada e torcida" },
  { category: "palestras", title: "Palestra", detail: "Gente boa falando do que sabe" },
  { category: "academicos", title: "Calourada", detail: "Recepção dos bixos da turma" },
  { category: "outros", title: "Sunset", detail: "Fim de tarde com som e drinks" },
];

const hiveCells: readonly HoneycombCell[] = Array.from({ length: 30 * 8 }, (_, index) => {
  const col = index % 30;
  const row = Math.floor(index / 30);
  return [col, row] as const;
}).filter(([col, row]) => (col + row) % 2 === 0);

const TICKET_CODE = "HB-2026";

const barcode = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1];

const AUTOPLAY_MS = 3200;
const SWIPE_THRESHOLD = 40;
const BEE_EASING = 0.075;

const slots: Record<number, string> = {
  0: "z-30 translate-x-0 rotate-0 scale-100 opacity-100",
  1: "z-20 translate-x-[60%] rotate-[8deg] scale-[0.82] opacity-100 brightness-[0.92] dark:brightness-[0.5]",
  [-1]: "z-20 -translate-x-[60%] -rotate-[8deg] scale-[0.82] opacity-100 brightness-[0.92] dark:brightness-[0.5]",
  2: "z-10 translate-x-[104%] rotate-[14deg] scale-[0.66] opacity-0 pointer-events-none",
  [-2]: "z-10 -translate-x-[104%] -rotate-[14deg] scale-[0.66] opacity-0 pointer-events-none",
};

const hiddenSlot = "z-0 translate-x-0 scale-[0.6] opacity-0 pointer-events-none";

function offsetFrom(index: number, active: number): number {
  const total = tickets.length;
  const half = Math.floor(total / 2);
  return ((index - active + total + half) % total) - half;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface HeroAction {
  label: string;
  href: string;
}

function Ticket({ ticket, offset, onSelect }: { ticket: HeroTicket; offset: number; onSelect: () => void }) {
  const { icon: Icon, label, mediaClassName, patternClassName } = categoryConfig[ticket.category];
  const isFront = offset === 0;
  const isReachable = Math.abs(offset) <= 1;

  return (
    <button
      type="button"
      onClick={onSelect}
      tabIndex={isReachable ? 0 : -1}
      aria-hidden={!isReachable}
      aria-label={isFront ? `Ingresso de ${label} em destaque` : `Mostrar ingresso de ${label}`}
      aria-current={isFront}
      className={cn(
        "absolute top-6 left-1/2 -ml-[clamp(115px,12.5vw,170px)] w-[clamp(230px,25vw,340px)] cursor-pointer rounded-[26px] text-left transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400 motion-reduce:transition-none",
        slots[offset] ?? hiddenSlot,
        !isFront && isReachable && "hover:brightness-100",
      )}
    >
      <span
        className={cn(
          "flex flex-col overflow-hidden rounded-[26px] bg-white transition-transform dark:bg-hubee-50 duration-200 ease-out motion-reduce:transform-none",
          isFront && "[transform:perspective(1000px)_rotateY(calc(var(--tilt-x,0)*14deg))_rotateX(calc(var(--tilt-y,0)*-12deg))]",
        )}
      >
        <span className={cn("relative flex aspect-[4/3.5] items-center justify-center overflow-hidden", mediaClassName)}>
          <HexPattern className={patternClassName} />
          <Icon aria-hidden="true" strokeWidth={1.25} className="relative size-[34%]" />
          <span className={cn(display.className, "absolute bottom-4 left-5 text-[clamp(2.5rem,4.4vw,4rem)] leading-none uppercase")}>
            {ticket.title}
          </span>
        </span>

        <span aria-hidden="true" className="relative flex h-7 items-center">
          <span className="absolute -left-3.5 size-7 rounded-full bg-hubee-100 dark:bg-hubee-900" />
          <span className="mx-6 h-0 w-full border-t-2 border-dashed border-hubee-200" />
          <span className="absolute -right-3.5 size-7 rounded-full bg-hubee-100 dark:bg-hubee-900" />
        </span>

        <span className="flex flex-col gap-3 px-6 pt-1 pb-6 text-hubee-800">
          <span className="text-base leading-snug font-medium">{ticket.detail}</span>
          <span className="flex items-end justify-between gap-3">
            <span aria-hidden="true" className="flex h-10 items-stretch gap-[2px]">
              {barcode.map((width, index) => (
                <span key={index} className="bg-hubee-800" style={{ width }} />
              ))}
            </span>
            <span className="text-xs font-semibold tabular-nums text-hubee-700">{TICKET_CODE}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

function TicketCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = (step: number) => setActive((value) => (value + step + tickets.length) % tickets.length);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % tickets.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const setTilt = (x: number, y: number) => {
    trackRef.current?.style.setProperty("--tilt-x", x.toFixed(3));
    trackRef.current?.style.setProperty("--tilt-y", y.toFixed(3));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) >= SWIPE_THRESHOLD) go(distance < 0 ? 1 : -1);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Tipos de evento na Hubee"
      className="flex flex-col items-center gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div
        ref={trackRef}
        className="relative h-[clamp(370px,42vw,540px)] w-full touch-pan-y"
        onPointerDown={(event) => {
          swipeStart.current = event.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTilt(0, 0)}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {tickets.map((ticket, index) => (
          <Ticket
            key={ticket.category}
            ticket={ticket}
            offset={offsetFrom(index, active)}
            onSelect={() => setActive(index)}
          />
        ))}
      </div>

      <ul className="flex max-w-[520px] flex-wrap justify-center gap-2">
        {tickets.map((ticket, index) => {
          const { icon: Icon, label } = categoryConfig[ticket.category];
          const isActive = index === active;
          return (
            <li key={ticket.category}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-[background-color,color,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hubee-400 focus-visible:ring-offset-2 focus-visible:ring-offset-hubee-100 dark:focus-visible:ring-offset-hubee-900 active:scale-95",
                  isActive
                    ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-50/10 dark:text-hubee-50"
                    : "bg-hubee-50 text-hubee-800 hover:bg-hubee-200 dark:bg-transparent dark:text-hubee-200/70 dark:hover:bg-hubee-50/5 dark:hover:text-hubee-50",
                )}
              >
                <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function useFlyingBee(
  sectionRef: RefObject<HTMLElement | null>,
  beeRef: RefObject<HTMLDivElement | null>,
  perchRef: RefObject<HTMLSpanElement | null>,
) {
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0, placed: false });

  useEffect(() => {
    const section = sectionRef.current;
    const bee = beeRef.current;
    const perch = perchRef.current;
    if (!section || !bee || !perch) return;
    const current = state.current;

    const home = () => {
      const sectionRect = section.getBoundingClientRect();
      const perchRect = perch.getBoundingClientRect();
      return {
        x: perchRect.right - sectionRect.left + perchRect.height * 0.25,
        y: perchRect.top - sectionRect.top - perchRect.height * 0.15,
      };
    };

    const paint = (tilt: number) => {
      bee.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${tilt}deg)`;
    };

    const step = () => {
      const dx = current.tx - current.x;
      const dy = current.ty - current.y;
      current.x += dx * BEE_EASING;
      current.y += dy * BEE_EASING;
      paint(Math.max(-24, Math.min(24, dx * 0.12)));
      current.frame = Math.hypot(dx, dy) > 0.5 ? requestAnimationFrame(step) : 0;
    };

    const flyTo = (x: number, y: number) => {
      current.tx = x;
      current.ty = y;
      if (prefersReducedMotion()) {
        current.x = x;
        current.y = y;
        paint(0);
        return;
      }
      if (!current.frame) current.frame = requestAnimationFrame(step);
    };

    const goHome = () => {
      const { x, y } = home();
      flyTo(x, y);
    };

    const placeHome = () => {
      const { x, y } = home();
      current.tx = current.x = x;
      current.ty = current.y = y;
      paint(0);
      current.placed = true;
    };

    const onPointer = (event: globalThis.PointerEvent) => {
      if (prefersReducedMotion()) return;
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      section.style.setProperty("--hive-x", `${x}px`);
      section.style.setProperty("--hive-y", `${y}px`);
      section.style.setProperty("--hive-glow", "1");
      flyTo(x + 18, y + 14);
    };

    const onLeave = () => {
      section.style.setProperty("--hive-glow", "0");
      goHome();
    };

    placeHome();
    const settle = window.setTimeout(placeHome, 800);
    void document.fonts.ready.then(() => !current.frame && placeHome());
    const observer = new ResizeObserver(() => (current.placed ? goHome() : placeHome()));
    observer.observe(section);
    section.addEventListener("pointermove", onPointer);
    section.addEventListener("pointerdown", onPointer);
    section.addEventListener("pointerleave", onLeave);

    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(current.frame);
      current.frame = 0;
      observer.disconnect();
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerdown", onPointer);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [sectionRef, beeRef, perchRef]);
}

export function HeroSection({ primary, secondary }: { primary: HeroAction; secondary?: HeroAction }) {
  const sectionRef = useRef<HTMLElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);
  const perchRef = useRef<HTMLSpanElement>(null);
  useFlyingBee(sectionRef, beeRef, perchRef);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden rounded-[32px] bg-hubee-100 text-hubee-800 lg:flex dark:bg-hubee-900 dark:text-hubee-50 lg:min-h-[min(calc(100svh-7rem),880px)] lg:items-center"
    >
      <Honeycomb
        cells={hiveCells}
        orientation="pointy"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 -z-10 size-full fill-none stroke-hubee-600/15 stroke-[1.5] dark:stroke-hubee-400/[0.04]"
      />
      <Honeycomb
        cells={hiveCells}
        orientation="pointy"
        preserveAspectRatio="xMidYMid slice"
        className="hero-hive-glow absolute inset-0 -z-10 size-full fill-hubee-400/15 stroke-hubee-500 stroke-2 dark:fill-transparent dark:stroke-hubee-400/40"
      />

      <div
        ref={beeRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-50 -mt-7 -ml-7 size-14 will-change-transform md:-mt-9 md:-ml-9 md:size-[72px]"
      >
        <Image
          src="/logo/logo-icon/Logo.svg"
          alt=""
          width={72}
          height={72}
          className="hero-bee size-full object-contain dark:hidden"
          priority
        />
        <Image
          src="/logo/logo-icon/LogoMono_yellow.svg"
          alt=""
          width={72}
          height={72}
          className="hero-bee hidden size-full object-contain dark:block"
          priority
        />
      </div>

      <div className="grid w-full gap-12 px-6 pt-16 pb-12 sm:px-10 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-4 lg:px-16 lg:py-16">
        <div className="hero-rise flex flex-col items-start">
          <h1
            id="hero-titulo"
            className={cn(
              display.className,
              "text-[clamp(2.6rem,6.2vw,7.5rem)] leading-[0.9] tracking-[-0.01em] uppercase",
            )}
          >
            <span className="block">
              <span ref={perchRef}>Todo rolê</span>
            </span>
            <span className="block text-hubee-700 dark:text-hubee-400">cabe na colmeia</span>
          </h1>

          <p className="mt-8 max-w-[36rem] text-lg leading-relaxed text-hubee-750 md:text-xl dark:text-hubee-100 lg:text-[1.375rem]">
            Festas, shows e campeonatos das agremiações perto de você. Compre seu ingresso em
            poucos cliques ou crie seu evento e venda no mesmo lugar.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href={primary.href}
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-hubee-800 px-8 text-base font-semibold text-hubee-50 transition-[background-color,transform] hover:bg-hubee-750 dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97] lg:h-16 lg:text-lg"
            >
              {primary.label}
              <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex h-14 items-center rounded-full bg-hubee-200 px-8 text-base font-semibold text-hubee-800 transition-[background-color,transform] hover:bg-hubee-300 dark:bg-transparent dark:text-hubee-100 dark:hover:bg-hubee-50/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97] lg:h-16 lg:text-lg"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>

        <div className="hero-rise relative mx-auto w-full max-w-[680px] [animation-delay:120ms]">
          <TicketCarousel />
        </div>
      </div>
    </section>
  );
}

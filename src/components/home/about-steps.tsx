"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { AboutSearchDemo } from "./about-search-demo";

const STEP_MS = 2600;

interface Step {
  title: string;
  description: string;
  cardClassName: string;
  art: ReactNode;
}

const steps: readonly Step[] = [
  {
    title: "Descubra",
    description: "Encontre o próximo rolê perto de você.",
    cardClassName: "bg-hubee-400 text-hubee-900 dark:bg-hubee-850 dark:text-hubee-50",
    art: (
      <div className="flex h-full w-full flex-col justify-center">
        <AboutSearchDemo />
      </div>
    ),
  },
  {
    title: "Compre",
    description: "Pix ou cartão, em poucos cliques.",
    cardClassName: "bg-white text-hubee-800 dark:bg-hubee-850 dark:text-hubee-50",
    art: (
      <div aria-hidden="true" className="relative w-full rounded-2xl bg-hubee-100 p-5 dark:bg-hubee-50/5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Ingresso</span>
          <span className={cn(displayFont.className, "text-2xl")}>R$ 40,00</span>
        </div>
        <span className="absolute -top-4 -right-2 inline-flex scale-75 items-center gap-1.5 rounded-full bg-hubee-800 px-3 py-1.5 text-xs font-semibold text-hubee-50 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.3,1.6,.5,1)] group-data-[reached=true]:scale-100 group-data-[reached=true]:opacity-100 group-data-[active=true]:-rotate-3 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none dark:bg-hubee-400 dark:text-hubee-900">
          <Check className="size-3.5" strokeWidth={3} />
          Pagamento aprovado
        </span>
      </div>
    ),
  },
  {
    title: "Entre",
    description: "Mostre o QR Code na entrada.",
    cardClassName: "bg-hubee-900 text-hubee-50 dark:bg-hubee-850 dark:text-hubee-50",
    art: (
      <div
        aria-hidden="true"
        className="flex items-center gap-4 rounded-2xl bg-hubee-50 p-3 pr-5 text-hubee-900 transition-transform duration-500 group-data-[active=true]:-rotate-2 group-data-[active=true]:scale-105 motion-reduce:transition-none dark:bg-hubee-50/5 dark:text-hubee-50"
      >
        <span className="rounded-xl bg-white p-2">
          <QRCodeSVG value="https://hubee.app" size={92} bgColor="#ffffff" fgColor="#181000" />
        </span>
        <span className="flex flex-col">
          <span className={cn(displayFont.className, "text-2xl leading-none uppercase")}>Calourada</span>
          <span className="mt-1 text-xs font-medium opacity-75">Sáb · 22h</span>
        </span>
      </div>
    ),
  },
];

export function AboutSteps() {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(steps.length - 1);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setActive(0);
      },
      { threshold: 0.45 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [inView, paused, active]);

  return (
    <ol
      ref={listRef}
      aria-label="Como funciona"
      className="grid gap-12 md:grid-cols-3 md:gap-10"
      onMouseLeave={() => setPaused(false)}
    >
      {steps.map((step, index) => {
        const isActive = index === active;
        const reached = index <= active;
        return (
          <li
            key={step.title}
            data-active={isActive}
            data-reached={reached}
            onMouseEnter={() => {
              setPaused(true);
              setActive(index);
            }}
            className={cn(
              "group relative flex flex-col rounded-[28px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
              step.cardClassName,
              isActive ? "-translate-y-2" : "scale-[0.97] motion-reduce:scale-100",
            )}
          >
            <div className="flex h-44 items-center justify-center px-6 pt-6">{step.art}</div>
            <div className="flex flex-1 flex-col p-6 pt-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500",
                    reached
                      ? "bg-hubee-900 text-hubee-50 group-[.bg-hubee-900]:bg-hubee-400 group-[.bg-hubee-900]:text-hubee-900 dark:bg-hubee-400 dark:text-hubee-900"
                      : "bg-current/15",
                  )}
                >
                  {index + 1}
                </span>
                <h3 className={cn(displayFont.className, "text-3xl leading-none uppercase")}>{step.title}</h3>
              </div>
              <p className="mt-2 text-base opacity-80">{step.description}</p>
            </div>

            {index < steps.length - 1 && <Connector lit={index < active} />}
          </li>
        );
      })}
    </ol>
  );
}

function Connector({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute z-10 flex size-11 items-center justify-center rounded-full ring-[6px] ring-hubee-50 transition-[background-color,color,transform] duration-500 dark:ring-hubee-900",
        "-bottom-[2.875rem] left-1/2 -translate-x-1/2 md:top-1/2 md:bottom-auto md:left-auto md:-right-[2.625rem] md:translate-x-0 md:-translate-y-1/2",
        lit
          ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-900"
          : "bg-hubee-200 text-hubee-750 dark:bg-hubee-850 dark:text-hubee-200",
      )}
    >
      <ArrowRight className={cn("hidden size-5 transition-transform duration-500 md:block", lit && "translate-x-0.5")} strokeWidth={2.5} />
      <ArrowDown className={cn("size-5 transition-transform duration-500 md:hidden", lit && "translate-y-0.5")} strokeWidth={2.5} />
    </span>
  );
}

"use client";

import Link from "next/link";
import { Anton } from "next/font/google";
import { ArrowRight, Calendar, Ticket, type LucideIcon } from "lucide-react";
import { HexPattern } from "@/components/home/events/event-media";
import { Footer } from "@/components/layout/footer";
import { Header, type HeaderRole } from "@/components/layout/header";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { TeamMemberProfile } from "./team.config";
import { TeamCarousel } from "./team-carousel";

const display = Anton({ subsets: ["latin"], weight: "400", display: "swap" });

const hiveCells: readonly HoneycombCell[] = Array.from({ length: 30 * 8 }, (_, index) => {
  const col = index % 30;
  const row = Math.floor(index / 30);
  return [col, row] as const;
}).filter(([col, row]) => (col + row) % 2 === 0);

const barcode = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2];

interface ValuePillar {
  title: string;
  badge: string;
  code: string;
  stamp: string;
  description: string;
  icon: LucideIcon;
  headerClassName: string;
  patternClassName: string;
}

const VALUE_PILLARS: readonly ValuePillar[] = [
  {
    title: "Para quem participa",
    badge: "Participante",
    code: "HB-0101",
    stamp: "✓ Ingresso liberado",
    description:
      "Descubra eventos de diferentes tipos e encontre ingressos para fazer parte desses encontros.",
    icon: Ticket,
    headerClassName: "bg-hubee-400 text-hubee-900",
    patternClassName: "text-hubee-800/15",
  },
  {
    title: "Para quem organiza",
    badge: "Organizador",
    code: "HB-0202",
    stamp: "✓ Palco liberado",
    description:
      "Reúna o planejamento do evento e a venda de ingressos em um só lugar.",
    icon: Calendar,
    headerClassName: "bg-hubee-900 text-hubee-50",
    patternClassName: "text-hubee-400/20",
  },
];

interface SobreContentProps {
  members: readonly TeamMemberProfile[];
}

export function SobreContent({ members }: SobreContentProps) {
  const { user, isOrganizer } = useAuth();
  const currentRole: HeaderRole = user
    ? isOrganizer
      ? "organizer"
      : "user"
    : "guest";

  const organizerHref = user
    ? isOrganizer
      ? "/meus-eventos"
      : "/conta/perfil"
    : "/cadastro?intent=ORGANIZE";

  return (
    <div
      id="inicio"
      className="flex min-h-screen flex-col bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50"
    >
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-hubee-800 px-3 py-2 text-sm font-medium text-hubee-50 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 dark:bg-hubee-400 dark:text-hubee-800"
      >
        Pular para o conteúdo
      </a>

      <Header />

      <main
        id="conteudo"
        aria-label="Sobre o Hubee"
        className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-12 px-3 pt-4 pb-12 sm:px-6 md:gap-16"
      >
        {/* Hero Institucional + O que é o Hubee no padrão da Hero da Home */}
        <section
          aria-labelledby="sobre-hero-titulo"
          className="relative isolate flex min-h-[340px] items-center overflow-hidden rounded-[32px] bg-hubee-900 px-6 py-12 text-hubee-50 sm:px-10 md:min-h-[380px] md:py-16 lg:px-16 lg:py-20"
        >
          <Honeycomb
            cells={hiveCells}
            orientation="pointy"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 -z-10 size-full fill-none stroke-hubee-400/10 stroke-[1.5]"
          />
          <Honeycomb
            cells={hiveCells}
            orientation="pointy"
            preserveAspectRatio="xMidYMid slice"
            className="hero-hive-glow absolute inset-0 -z-10 size-full fill-hubee-400/[0.06] stroke-hubee-400 stroke-2"
          />

          <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12 lg:gap-16">
            <h1
              id="sobre-hero-titulo"
              className={cn(
                display.className,
                "text-[clamp(2.9rem,6.6vw,6.8rem)] leading-[0.9] tracking-[-0.01em] uppercase",
              )}
            >
              <span className="block text-hubee-50">O que é</span>
              <span className="block text-hubee-400">o Hubee?</span>
            </h1>

            <div className="max-w-xl space-y-3.5 text-base leading-relaxed text-hubee-100 md:justify-self-end md:text-lg">
              <p>
                O Hubee é uma plataforma pública que conecta quem procura
                eventos de diferentes tipos a quem os organiza.
              </p>
              <p>
                Para participantes, um lugar para descobrir eventos e comprar
                ingressos. Para organizadores, um espaço que reúne o
                planejamento e a venda no mesmo lugar.
              </p>
            </div>
          </div>
        </section>

        {/* Seção: De cada lado do evento (estilo Ingressos da Hero) */}
        <section
          aria-labelledby="de-cada-lado-titulo"
          className="mx-auto w-full max-w-6xl px-2 md:px-4"
        >
          <h2
            id="de-cada-lado-titulo"
            className={cn(
              display.className,
              "text-3xl tracking-tight text-hubee-800 uppercase md:text-5xl dark:text-hubee-50",
            )}
          >
            De cada lado <span className="text-hubee-600 dark:text-hubee-400">do evento</span>
          </h2>

          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {VALUE_PILLARS.map(
              ({
                title,
                badge,
                code,
                stamp,
                description,
                icon: Icon,
                headerClassName,
                patternClassName,
              }) => (
                <li
                  key={title}
                  className="group relative flex flex-col"
                >
                  {/* Parte superior do ingresso (descola levemente para cima no hover) */}
                  <div
                    className={cn(
                      "relative flex min-h-44 items-end justify-between overflow-hidden rounded-t-[26px] border border-b-0 border-hubee-300/70 p-6 transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1.5 group-hover:rotate-[-0.8deg] group-hover:border-hubee-400 group-hover:shadow-lg md:p-7 motion-reduce:transition-none dark:border-hubee-50/15",
                      headerClassName,
                    )}
                  >
                    <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transition-none">
                      <HexPattern className={patternClassName} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                      <span className="w-fit rounded-full bg-black/15 px-3 py-1 text-xs font-semibold uppercase transition-transform duration-300 group-hover:translate-x-1">
                        {badge}
                      </span>
                      <h3
                        className={cn(
                          display.className,
                          "text-2xl leading-none uppercase transition-transform duration-300 group-hover:translate-x-1 md:text-3xl",
                        )}
                      >
                        {title}
                      </h3>
                    </div>
                    <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-black/10 transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-115 group-hover:-rotate-12 group-hover:bg-black/20 md:size-18">
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.75}
                        className="size-9 md:size-10"
                      />
                    </div>
                  </div>

                  {/* Picote do ingresso (abre o corte no hover) */}
                  <div
                    aria-hidden="true"
                    className="relative z-10 flex h-7 items-center bg-hubee-100 transition-colors duration-300 dark:bg-hubee-900"
                  >
                    <span className="absolute -left-3.5 size-7 rounded-full bg-hubee-50 transition-transform duration-300 group-hover:scale-115 dark:bg-hubee-800" />
                    <span className="mx-6 h-0 w-full border-t-2 border-dashed border-hubee-300 transition-all duration-300 group-hover:border-hubee-500 dark:border-hubee-700 dark:group-hover:border-hubee-400" />
                    <span className="absolute -right-3.5 size-7 rounded-full bg-hubee-50 transition-transform duration-300 group-hover:scale-115 dark:bg-hubee-800" />
                  </div>

                  {/* Canhoto inferior (descola levemente para baixo + carimbo de validação no hover) */}
                  <div className="relative flex flex-1 flex-col justify-between gap-5 rounded-b-[26px] border border-t-0 border-hubee-300/70 bg-hubee-100 px-6 pt-2 pb-6 text-hubee-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-1.5 group-hover:rotate-[0.6deg] group-hover:border-hubee-400 group-hover:shadow-[0_18px_36px_-12px_rgba(255,193,7,0.35)] md:px-7 motion-reduce:transition-none dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50">
                    <p className="text-base leading-relaxed font-medium text-hubee-750 dark:text-hubee-100">
                      {description}
                    </p>

                    <div className="flex items-end justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="relative flex h-8 items-stretch gap-[2px] overflow-hidden pr-1 transition-transform duration-300 origin-left group-hover:scale-x-105"
                      >
                        {barcode.map((width, index) => (
                          <span
                            key={index}
                            className="bg-hubee-800 transition-colors duration-300 group-hover:bg-hubee-900 dark:bg-hubee-400 dark:group-hover:bg-hubee-300"
                            style={{ width }}
                          />
                        ))}
                      </span>

                      <div className="flex items-center gap-2.5">
                        <span className="scale-125 -rotate-6 rounded-md border-2 border-hubee-700 bg-hubee-400/30 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-hubee-900 uppercase opacity-0 transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-100 group-hover:-rotate-3 group-hover:opacity-100 dark:border-hubee-400 dark:bg-hubee-400/20 dark:text-hubee-300">
                          {stamp}
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-hubee-700 dark:text-hubee-300">
                          {code}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>

        {/* Seção: Nosso time (Carrossel + Modal com foto e README do GitHub) */}
        <div className="mx-auto w-full max-w-6xl px-2 md:px-4">
          <TeamCarousel members={members} />
        </div>

        {/* Bloco CTA Final: Encontre seu próximo evento */}
        <section
          aria-labelledby="cta-proximo-evento-titulo"
          className="mx-auto w-full max-w-6xl px-2 md:px-4"
        >
          <div className="relative isolate overflow-hidden rounded-[32px] bg-hubee-900 p-8 text-hubee-50 sm:p-10 md:p-14">
            <Honeycomb
              cells={hiveCells}
              orientation="pointy"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 -z-10 size-full fill-none stroke-hubee-400/10 stroke-[1.5]"
            />

            <h2
              id="cta-proximo-evento-titulo"
              className={cn(
                display.className,
                "text-3xl leading-[0.95] tracking-tight uppercase md:text-5xl",
              )}
            >
              <span>Encontre seu </span>
              <span className="text-hubee-400">próximo evento</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-hubee-100 md:text-lg">
              Conheça os eventos de diferentes tipos no Hubee ou publique o seu.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/eventos"
                prefetch={true}
                className="group inline-flex h-13 items-center gap-3 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
              >
                Explorar eventos
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>

              <Link
                href={organizerHref}
                prefetch={true}
                className="inline-flex h-13 items-center rounded-full bg-hubee-800 px-7 text-base font-semibold text-hubee-50 transition-[background-color,transform] hover:bg-hubee-750 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
              >
                Quero organizar um evento
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer role={currentRole} />
    </div>
  );
}

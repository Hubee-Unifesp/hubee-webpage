"use client";

import Link from "next/link";
import { Calendar, Ticket, type LucideIcon } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header, type HeaderRole } from "@/components/layout/header";
import { useAuth } from "@/contexts/AuthContext";
import type { TeamMemberProfile } from "./team.config";
import { TeamCarousel } from "./team-carousel";

interface ValuePillar {
  title: string;
  description: string;
  icon: LucideIcon;
}

const VALUE_PILLARS: readonly ValuePillar[] = [
  {
    title: "Para quem participa",
    description:
      "Descubra eventos de diferentes tipos e encontre ingressos para fazer parte desses encontros.",
    icon: Ticket,
  },
  {
    title: "Para quem organiza",
    description:
      "Reúna o planejamento do evento e a venda de ingressos em um só lugar.",
    icon: Calendar,
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

      <main id="conteudo" aria-label="Sobre o Hubee" className="flex-1">
        {/* Hero Institucional */}
        <section
          aria-labelledby="sobre-hero-titulo"
          className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16"
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold text-hubee-750 dark:text-hubee-200">
            <span
              aria-hidden="true"
              className="h-0.5 w-4 rounded-full bg-hubee-800 dark:bg-hubee-400"
            />
            <span>Institucional</span>
          </div>

          <h1
            id="sobre-hero-titulo"
            className="mt-4 font-heading text-3xl leading-tight font-extrabold tracking-tight text-hubee-800 md:text-5xl md:leading-[3.5rem] dark:text-hubee-50"
          >
            Sobre o Hubee
          </h1>

          <p className="mt-4 max-w-[696px] text-base leading-relaxed text-hubee-750 dark:text-hubee-50/90">
            Um ponto de encontro para descobrir eventos de diferentes tipos e
            comprar ingressos.
          </p>
        </section>

        {/* Seção: O que é o Hubee? */}
        <section
          aria-labelledby="o-que-e-hubee-titulo"
          className="w-full bg-hubee-100 py-12 md:py-16 dark:bg-hubee-900"
        >
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <h2
              id="o-que-e-hubee-titulo"
              className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
            >
              O que é o Hubee?
            </h2>

            <div className="mt-4 max-w-[696px] space-y-4 text-base leading-relaxed text-hubee-800 dark:text-hubee-50/90">
              <p>
                O Hubee é uma plataforma pública que conecta quem procura
                eventos de diferentes tipos a quem os organiza.
              </p>
              <p>
                Para participantes, um lugar para descobrir eventos e comprar
                ingressos. Para organizadores, um espaço que reúne o
                planejamento e a venda.
              </p>
            </div>
          </div>
        </section>

        {/* Seção: De cada lado do evento */}
        <section
          aria-labelledby="de-cada-lado-titulo"
          className="mx-auto w-full max-w-6xl px-4 pt-12 md:px-6 md:pt-16"
        >
          <h2
            id="de-cada-lado-titulo"
            className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
          >
            De cada lado do evento
          </h2>

          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {VALUE_PILLARS.map(({ title, description, icon: Icon }) => (
              <li
                key={title}
                className="flex flex-col rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-6 md:p-7 dark:border-hubee-50/15 dark:bg-hubee-800/80"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-hubee-100 text-hubee-750 dark:bg-hubee-900 dark:text-hubee-400">
                  <Icon
                    aria-hidden="true"
                    className="size-5 stroke-[1.75]"
                  />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-hubee-800 dark:text-hubee-50">
                  {title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-hubee-750 dark:text-hubee-50/90">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Seção: Nosso time (Carrossel + Modal com foto e README do GitHub) */}
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <TeamCarousel members={members} />
        </div>

        {/* Bloco CTA Final: Encontre seu próximo evento */}
        <section
          aria-labelledby="cta-proximo-evento-titulo"
          className="mx-auto w-full max-w-6xl px-4 pb-8 md:px-6"
        >
          <div className="rounded-2xl bg-hubee-100 p-6 sm:p-8 md:p-10 dark:bg-hubee-900">
            <h2
              id="cta-proximo-evento-titulo"
              className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
            >
              Encontre seu próximo evento
            </h2>
            <p className="mt-2 max-w-[696px] text-base text-hubee-750 dark:text-hubee-50/90">
              Conheça os eventos de diferentes tipos no Hubee.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/eventos"
                prefetch={true}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-hubee-800 px-5 py-2.5 text-sm font-semibold text-hubee-50 transition-colors outline-none hover:bg-hubee-750 hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 focus-visible:ring-offset-hubee-100 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:focus-visible:ring-hubee-400 dark:focus-visible:ring-offset-hubee-900"
              >
                Explorar eventos
              </Link>

              <Link
                href={organizerHref}
                prefetch={true}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-hubee-200 bg-hubee-50 px-5 py-2.5 text-sm font-semibold text-hubee-800 transition-colors outline-none hover:bg-hubee-200/60 hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 focus-visible:ring-offset-hubee-100 dark:border-hubee-50/15 dark:bg-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400 dark:focus-visible:ring-offset-hubee-900"
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

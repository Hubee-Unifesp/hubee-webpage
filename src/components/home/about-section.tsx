import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { AboutSteps } from "./about-steps";

const bandCells: readonly HoneycombCell[] = [
  [0, 1], [0, 3],
  [1, 0], [1, 2], [1, 4],
  [2, 1], [2, 3],
  [3, 0], [3, 2], [3, 4],
  [4, 1], [4, 3],
];

export function AboutSection({ organizerHref }: { organizerHref: string }) {
  return (
    <section
      id="institucional"
      aria-labelledby="institucional-titulo"
      className="flex flex-col gap-16 py-12 md:gap-24 md:py-20"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h2
          id="institucional-titulo"
          className={cn(
            displayFont.className,
            "text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] uppercase text-hubee-800 dark:text-hubee-50",
          )}
        >
          O que é o Hubee?
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-hubee-750 dark:text-hubee-100/85">
          Do rolê ao ingresso no celular, tudo em um só lugar.
        </p>
      </div>

      <AboutSteps />

      <div className="relative isolate overflow-hidden rounded-[32px] bg-hubee-400 px-6 py-12 text-hubee-900 sm:px-10 dark:bg-hubee-850 dark:text-hubee-50 md:px-14 md:py-16">
        <Honeycomb
          cells={bandCells}
          orientation="pointy"
          className="absolute top-1/2 -right-16 -z-10 hidden h-[140%] w-auto -translate-y-1/2 fill-none stroke-hubee-600/50 stroke-2 md:block dark:stroke-hubee-400/20"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[12%] -z-10 hidden w-[clamp(120px,13vw,190px)] -translate-y-1/2 md:block"
        >
          <Image
            src="/logo/logo-icon/LogoMono_dark.svg"
            alt=""
            width={180}
            height={245}
            className="h-auto w-full -rotate-6 dark:hidden"
          />
          <Image
            src="/logo/logo-icon/LogoMono_yellow.svg"
            alt=""
            width={180}
            height={245}
            className="hidden h-auto w-full -rotate-6 dark:block"
          />
        </span>
        <h2 className={cn(displayFont.className, "max-w-2xl text-[clamp(2.25rem,4.6vw,4rem)] leading-[0.92] uppercase")}>
          Tem um evento? Venda por aqui sem taxas
        </h2>
        <p className="mt-4 max-w-lg text-lg leading-relaxed dark:text-hubee-100/85">
          Crie o evento, venda os ingressos e valide a entrada.
        </p>
        <Link
          href={organizerHref}
          className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-hubee-900 px-7 text-base font-semibold text-hubee-50 transition-colors hover:bg-hubee-800 dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-900/30"
        >
          Criar meu evento
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </div>
    </section>
  );
}

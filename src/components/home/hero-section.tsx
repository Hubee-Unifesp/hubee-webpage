import Link from "next/link";
import { CalendarPlus, Search, Settings2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface HeroFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const heroFeatures: readonly HeroFeature[] = [
  {
    title: "Criar Evento",
    description:
      "Dê vida à sua ideia. Configure a página do seu evento, crie lotes de ingressos e comece a divulgar em minutos.",
    icon: CalendarPlus,
  },
  {
    title: "Explorar Eventos",
    description:
      "Descubra o que está rolando. Navegue pelas organizações, encontre experiências únicas e garanta o seu lugar.",
    icon: Search,
  },
  {
    title: "Gerenciar Eventos",
    description:
      "Assuma o controle total. Acompanhe métricas de vendas, delegue tarefas para a equipe e valide entradas sem complicação.",
    icon: Settings2,
  },
];

export function HeroSection({ createAccountHref }: { createAccountHref: string }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-titulo"
      className="relative overflow-hidden rounded-2xl bg-hubee-100 px-6 py-12 dark:bg-hubee-750 sm:px-10 md:py-20"
    >
      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-hubee-400 bg-hubee-50 px-4 py-1.5 text-sm font-medium text-hubee-750 dark:border-hubee-600 dark:bg-hubee-800 dark:text-hubee-50">
            🐝 A nova forma de organizar eventos
          </span>

          <h1
            id="hero-titulo"
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-hubee-800 md:text-5xl dark:text-hubee-50"
          >
            Gerencie seus eventos com a organização de uma colmeia.
          </h1>

          <p className="mt-4 max-w-lg text-base text-hubee-750 dark:text-hubee-50">
            A plataforma completa para criar eventos, gerenciar organizações,
            delegar tarefas e vender ingressos de forma natural e sem dor de
            cabeça.
          </p>

          <Button
            variant="hubee_750"
            size="lg"
            className="mt-8 h-12 px-6 text-base font-semibold dark:border-transparent dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300"
            asChild
          >
            <Link href={createAccountHref}>Criar Conta</Link>
          </Button>
        </div>

        {/* TODO(GOL-61): substituir pelo asset real da ilustração da abelha,
            pendente de exportação pelo design. */}
        <div
          aria-hidden="true"
          className="flex items-center justify-center text-[8rem] md:justify-end md:text-[10rem]"
        >
          🐝
        </div>
      </div>

      <ul className="relative mt-12 grid gap-6 md:mt-16 md:grid-cols-3 lg:gap-8">
        {heroFeatures.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <Card className="h-full gap-3 border border-hubee-400 bg-hubee-50 p-6 shadow-none ring-0 dark:border-hubee-600 dark:bg-hubee-800">
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-8 text-hubee-750 dark:text-hubee-50"
              />
              <CardTitle className="mt-2 font-sans text-lg font-semibold text-hubee-750 dark:text-hubee-50">
                {title}
              </CardTitle>
              <CardDescription className="text-sm font-medium leading-snug text-hubee-neutral-300 dark:text-hubee-neutral-200">
                {description}
              </CardDescription>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
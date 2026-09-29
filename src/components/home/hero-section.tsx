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

/* Componente que renderiza a geometria exata da pirâmide de hexágonos (Pointy-Topped) */
function HoneycombCluster({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 525 1400"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <polygon
          id="hex"
          points="0,-100 86.6,-50 86.6,50 0,100 -86.6,50 -86.6,-50"
        />
      </defs>
      <g strokeWidth="6" strokeLinejoin="round" fillOpacity="0.15">
        <use href="#hex" x="90" y="700" />
        <use href="#hex" x="176.6" y="550" />
        <use href="#hex" x="176.6" y="850" />
        <use href="#hex" x="263.2" y="400" />
        <use href="#hex" x="263.2" y="700" />
        <use href="#hex" x="263.2" y="1000" />
        <use href="#hex" x="349.8" y="250" />
        <use href="#hex" x="349.8" y="550" />
        <use href="#hex" x="349.8" y="850" />
        <use href="#hex" x="349.8" y="1150" />
        <use href="#hex" x="436.4" y="100" />
        <use href="#hex" x="436.4" y="400" />
        <use href="#hex" x="436.4" y="700" />
        <use href="#hex" x="436.4" y="1000" />
        <use href="#hex" x="436.4" y="1300" />
      </g>
    </svg>
  );
}

export function HeroSection({ createAccountHref }: { createAccountHref: string }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden rounded-2xl bg-hubee-100 px-6 py-12 dark:bg-hubee-750 sm:px-10 md:py-20"
    >
      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col items-start text-left">
          
          {/* Badge: Fundo transparente e texto/borda amarelos no modo escuro */}
          <span className="inline-flex items-center gap-2 rounded-full border border-hubee-400 bg-hubee-50 px-4 py-1.5 text-sm font-medium text-hubee-750 dark:border-hubee-400 dark:bg-transparent dark:text-hubee-400">
            🐝 A nova forma de organizar eventos
          </span>

          {/* Títulos e Parágrafos: Usando hubee-100/200 para tons de creme em vez de branco */}
          <h1
            id="hero-titulo"
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-hubee-800 md:text-5xl dark:text-hubee-100"
          >
            Gerencie seus eventos com a organização de uma colmeia.
          </h1>

          <p className="mt-4 max-w-lg text-base text-hubee-750 dark:text-hubee-200">
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

          <ul className="relative mt-8 grid w-full gap-4 md:grid-cols-3">
            {heroFeatures.map(({ title, description, icon: Icon }) => (
              <li key={title}>
                {/* O fundo do card continua claro (hubee-50) em ambos os modos */}
                <Card className="h-full gap-0 overflow-hidden border border-hubee-400 bg-hubee-50 p-0 shadow-none ring-0 dark:border-hubee-400 dark:bg-hubee-50">
                  
                  {/* Cabeçalho do Card: Marrom escuro na luz, Amarelo vivo no escuro */}
                  <div className="flex items-center gap-3 bg-hubee-750 px-6 py-4 dark:bg-hubee-400">
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-6 text-hubee-50 dark:text-hubee-900"
                    />
                    <CardTitle className="font-sans text-lg font-semibold text-hubee-50 dark:text-hubee-900">
                      {title}
                    </CardTitle>
                  </div>
                  
                  {/* Corpo do Card: Texto escuro em ambos os modos, já que o fundo é claro */}
                  <CardDescription className="px-6 py-4 text-sm font-medium leading-snug text-hubee-800 dark:text-hubee-900">
                    {description}
                  </CardDescription>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-h-[300px] w-full items-center justify-center md:min-h-full">
          <HoneycombCluster
            className="absolute -right-4 top-1/2 -z-10 hidden h-[700px] w-auto max-w-none -translate-y-1/2 fill-[#966800] stroke-[#966800] dark:fill-[#ffcb33] dark:stroke-[#ffcb33] md:block md:h-[1000px] lg:h-[1200px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-10 flex transform items-center justify-center text-[10rem] drop-shadow-2xl transition-transform hover:scale-105 md:-ml-16 md:text-[18rem] lg:-ml-24"
          >
            🐝
          </div>
        </div>
      </div>
    </section>
  );
}
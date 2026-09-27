import Link from "next/link";
import { QrCode, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: readonly Feature[] = [
  {
    title: "Descubra eventos",
    description:
      "Encontre shows, festas, palestras e muito mais perto de você.",
    icon: Search,
  },
  {
    title: "Compre com segurança",
    description:
      "Garanta seu ingresso em poucos cliques, com pagamento protegido.",
    icon: ShieldCheck,
  },
  {
    title: "Ingresso na mão",
    description:
      "Acesse seus ingressos pelo celular e entre no evento sem complicação.",
    icon: QrCode,
  },
];

export function AboutSection({ organizerHref }: { organizerHref: string }) {
  return (
    <section
      id="institucional"
      aria-labelledby="institucional-titulo"
      className="flex flex-col items-center py-12 text-center md:py-20"
    >
      <h2
        id="institucional-titulo"
        className="font-heading text-3xl font-bold tracking-tight text-hubee-800 md:text-4xl dark:text-hubee-50"
      >
        O que é o HUBEE?
      </h2>
      <p className="mt-4 max-w-5xl text-base text-hubee-750 dark:text-hubee-50">
        O Hubee é o jeito mais fácil de encontrar eventos e comprar seus
        ingressos, tudo em um só lugar, do seu celular até a porta do evento.
      </p>

      <ul className="mt-12 grid w-full gap-6 text-left md:mt-28 md:grid-cols-3 lg:gap-12 xl:gap-22">
        {features.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <Card className="h-full gap-0 border border-hubee-400 bg-hubee-100 p-7 shadow-none ring-0 dark:border-hubee-600 dark:bg-hubee-750">
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-10 text-hubee-750 dark:text-hubee-50"
              />
              <CardTitle className="mt-6 font-sans text-xl font-semibold text-hubee-750 dark:text-hubee-50">
                {title}
              </CardTitle>
              <CardDescription className="mt-6 text-base font-semibold leading-snug text-hubee-neutral-300 dark:text-hubee-neutral-200">
                {description}
              </CardDescription>
            </Card>
          </li>
        ))}
      </ul>

      <Button
        variant="hubee_750"
        className="mt-16 h-12 px-6 text-base font-semibold md:mt-32"
        asChild
      >
        <Link href="#eventos">Explorar eventos</Link>
      </Button>
      <p className="mt-6 text-sm text-hubee-750 dark:text-hubee-50">
        Vai organizar um evento?{" "}
        <Link
          href={organizerHref}
          className="font-semibold underline underline-offset-4 hover:text-hubee-800 dark:hover:text-hubee-100"
        >
          Crie e venda seus ingressos no Hubee
        </Link>
      </p>
    </section>
  );
}

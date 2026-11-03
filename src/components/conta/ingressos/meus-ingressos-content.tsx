"use client";

import { useId, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import { EventCardSkeleton, ListMessage } from "@/components/home/events/list-states";
import { useMeusIngressos } from "@/hooks/useMeusIngressos";
import type { MeuIngresso } from "@/types/ingresso";
import { MeuIngressoCard } from "./meu-ingresso-card";

const gridClassName = "grid w-full min-w-0 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4";

/** Página Meus Ingressos: um cartão por ingresso, separados entre próximos e anteriores. */
export function MeusIngressosContent() {
  const router = useRouter();
  const { status, data, retry } = useMeusIngressos();
  const verEventos = { label: "Ver eventos", onClick: () => router.push("/eventos") };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <ContaPageTitle>Meus Ingressos</ContaPageTitle>
        <p className="mt-1 text-sm text-hubee-750 dark:text-hubee-100">
          Apresente o código do ingresso na entrada do evento.
        </p>
      </div>

      {status === "loading" && (
        <div role="status" aria-live="polite" className="flex flex-col gap-4">
          <span className="sr-only">Carregando seus ingressos…</span>
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className={gridClassName}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="min-w-0">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar seus ingressos"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={retry}
        />
      )}

      {status === "ok" &&
        (data.proximos.length === 0 && data.anteriores.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Você ainda não tem ingressos"
            description="Quando você comprar ingressos, eles aparecem aqui."
            action={verEventos}
          />
        ) : (
          <>
            <IngressosSection title="Próximos eventos" ingressos={data.proximos}>
              <EmptyState
                icon={Ticket}
                title="Nenhum ingresso para os próximos eventos"
                description="Que tal procurar o próximo rolê?"
                action={verEventos}
              />
            </IngressosSection>
            {data.anteriores.length > 0 && (
              <IngressosSection title="Anteriores" ingressos={data.anteriores} encerrados />
            )}
          </>
        ))}
    </div>
  );
}

interface IngressosSectionProps {
  title: string;
  ingressos: MeuIngresso[];
  encerrados?: boolean;
  /** Conteúdo mostrado quando a seção não tem ingressos. */
  children?: ReactNode;
}

function IngressosSection({ title, ingressos, encerrados = false, children }: IngressosSectionProps) {
  const titleId = useId();
  const count = `${ingressos.length} ${ingressos.length === 1 ? "ingresso" : "ingressos"}`;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <div>
        <h2 id={titleId} className="font-sans text-lg font-bold text-hubee-800 md:text-xl dark:text-hubee-50">
          {title}
        </h2>
        <p className="text-xs text-hubee-750 md:text-sm dark:text-hubee-100">{count}</p>
      </div>
      {ingressos.length === 0 ? (
        children
      ) : (
        <ul className={gridClassName}>
          {ingressos.map((ingresso) => (
            <li key={ingresso.id} className="min-w-0">
              <MeuIngressoCard ingresso={ingresso} encerrado={encerrados} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

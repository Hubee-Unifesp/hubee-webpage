import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EventDetailsContent } from "@/components/eventos/detalhes";
import { getEventById } from "@/lib/api/events";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

// Mesmo cookie gravado por `saveSession` e lido pelo middleware.
const AUTH_COOKIE = "token";

// No servidor o apiClient não acessa o localStorage; o JWT vem do cookie (GOL-186).
const fetchEventDetails = cache(async (id: string) => {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return getEventById(id, { token });
});

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEventDetails(id);

  if (!event) return { title: "Evento não encontrado | Hubee" };
  return {
    title: `${event.title} | Hubee`,
    description: event.tagline ?? event.description?.split("\n")[0] ?? undefined,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await fetchEventDetails(id);

  if (!event) notFound();

  return <EventDetailsContent event={event} />;
}

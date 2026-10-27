import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailsContent } from "@/components/eventos/detalhes";
import { getEventById } from "@/lib/api/events";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

const fetchEventDetails = cache((id: string) => getEventById(id));

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

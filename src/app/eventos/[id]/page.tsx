import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailsContent } from "@/components/eventos/detalhes";
import { getEventDetails } from "@/lib/api/event-details";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventDetails(id);

  if (!event) return { title: "Evento não encontrado | Hubee" };
  return {
    title: `${event.title} | Hubee`,
    description: event.tagline ?? event.description?.split("\n")[0] ?? undefined,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventDetails(id);

  if (!event) notFound();

  return <EventDetailsContent event={event} />;
}

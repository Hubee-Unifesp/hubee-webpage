import { EventNotFound } from "@/components/eventos/detalhes";

// O título da aba ("Evento não encontrado | Hubee") vem do `generateMetadata` da página.
export default function NotFound() {
  return <EventNotFound />;
}

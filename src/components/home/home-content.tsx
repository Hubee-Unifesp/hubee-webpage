import { Footer } from "@/components/layout/footer";
import { Header, type HeaderRole } from "@/components/layout/header";
import { AboutSection } from "./about-section";
import { EventListingSection } from "./events";
import { HeroSection } from "./hero-section";

export function HomeContent({ role = "guest", homeHref = "/" }: { role?: HeaderRole; homeHref?: string }) {
  return (
    <div id="inicio" className="min-h-screen bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
      <Header role={role} homeHref={homeHref} logoutHref={role !== "guest" ? "/" : undefined} />
      <main className="space-y-8 px-4 py-8 sm:px-8" id="conteudo" aria-label="Página inicial Hubee">
        <HeroSection
          ctaLabel={role === "guest" ? "Criar Conta" : "Criar Evento"}
          ctaHref={role === "guest" ? "/login" : "/criar-evento"}
        />
        <EventListingSection />
        <AboutSection organizerHref={role === "guest" ? "/login" : "/meus-eventos"} />
      </main>
      <Footer role={role} homeHref={homeHref} />
    </div>
  );
}

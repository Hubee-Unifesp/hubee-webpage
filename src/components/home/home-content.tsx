"use client";

import { Footer } from "@/components/layout/footer";
import { Header, type HeaderRole } from "@/components/layout/header";
import { useAuth } from "@/contexts/AuthContext";
import { AboutSection } from "./about-section";
import { EventListingSection } from "./events";
import { HeroSection } from "./hero-section";

export function HomeContent({ role, homeHref = "/" }: { role?: HeaderRole; homeHref?: string }) {
  const { user, isOrganizer } = useAuth();
  const currentRole: HeaderRole =
    role ?? (user ? (isOrganizer ? "organizer" : "user") : "guest");
  const isAuthenticated = currentRole !== "guest";

  const aboutCtaLabel =
    currentRole === "guest"
      ? "Explorar eventos"
      : currentRole === "organizer"
        ? "Meus Eventos"
        : "Meus Ingressos";

  const aboutCtaHref =
    currentRole === "guest"
      ? "#eventos"
      : currentRole === "organizer"
        ? "/meus-eventos"
        : "/meus-ingressos";

  const organizerHref =
    currentRole === "guest"
      ? "/cadastro?intent=ORGANIZE"
      : currentRole === "organizer"
        ? "/meus-eventos"
        : "/conta/perfil";

  return (
    <div id="inicio" className="min-h-screen bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
      <Header homeHref={homeHref} />
      <main className="space-y-8 px-4 py-8 sm:px-8" id="conteudo" aria-label="Página inicial Hubee">
        <HeroSection
          ctaLabel={isAuthenticated ? "Explorar Eventos" : "Criar Conta"}
          ctaHref={isAuthenticated ? "/eventos" : "/cadastro"}
        />
        <EventListingSection />
        <AboutSection
          ctaLabel={aboutCtaLabel}
          ctaHref={aboutCtaHref}
          organizerHref={organizerHref}
        />
      </main>
      <Footer role={currentRole} homeHref={homeHref} />
    </div>
  );
}

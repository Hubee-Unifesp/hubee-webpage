import { Footer } from "@/components/layout/footer";
import { Header, type HeaderRole } from "@/components/layout/header";
import { AboutSection } from "./about-section";

const sectionClassName =
  "flex min-h-[60vh] items-center justify-center rounded-2xl border border-dashed border-hubee-800/25 dark:border-hubee-50/25";

export function HomeContent({ role = "guest", homeHref = "/" }: { role?: HeaderRole; homeHref?: string }) {
  return (
    <div id="inicio" className="min-h-screen bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
      <Header role={role} homeHref={homeHref} logoutHref={role !== "guest" ? "/" : undefined} />
      <main className="space-y-8 px-4 py-8 sm:px-8" id="conteudo" aria-label="Página inicial Hubee">
        <section id="hero" aria-labelledby="hero-titulo" className={sectionClassName}>
          <h1 id="hero-titulo" className="text-2xl font-bold">Hero</h1>
        </section>
        <section id="eventos" aria-labelledby="eventos-titulo" className={sectionClassName}>
          <h2 id="eventos-titulo" className="text-2xl font-bold">Eventos</h2>
          {/* A futura listagem com scroll infinito será renderizada aqui. */}
        </section>
        <AboutSection organizerHref={role === "guest" ? "/login" : "/meus-eventos"} />
      </main>
      <Footer role={role} homeHref={homeHref} />
    </div>
  );
}

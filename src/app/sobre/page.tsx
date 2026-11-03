import type { Metadata } from "next";
import { SobreContent } from "@/components/sobre/sobre-content";
import { getInitialTeamProfiles } from "@/lib/github-profile";

export const metadata: Metadata = {
  title: "Sobre o Hubee | Hubee",
  description:
    "Conheça o Hubee, a plataforma pública que conecta quem procura eventos de diferentes tipos a quem os organiza, e as pessoas por trás do projeto.",
};

export default function SobrePage() {
  const members = getInitialTeamProfiles();

  return <SobreContent members={members} />;
}

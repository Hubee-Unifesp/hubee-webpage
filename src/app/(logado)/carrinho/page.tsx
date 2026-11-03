import type { Metadata } from "next";
import { CarrinhoContent } from "@/components/carrinho";

export const metadata: Metadata = {
  title: "Carrinho | Hubee",
  description: "Revise os ingressos selecionados e avance para o checkout.",
};

export default function CarrinhoPage() {
  return <CarrinhoContent />;
}

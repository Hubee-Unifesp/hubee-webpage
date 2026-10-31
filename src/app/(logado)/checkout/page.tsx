import type { Metadata } from "next";
import { CheckoutContent } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Finalizar Compra | Hubee",
  description: "Revise os detalhes do seu pedido e escolha a forma de pagamento.",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}


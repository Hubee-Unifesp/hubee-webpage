import { HomeContent } from "@/components/home/home-content";

/**
 * MOCK TEMPORÁRIO: esta página existe apenas para simular a home logada.
 * Não autentica, não cria sessão e não concede acesso a dados protegidos.
 * TODO(auth-api): remover esta implementação ao integrar a autenticação real.
 * Atualizar também o destino de Entrar e o fluxo de Sair.
 * Plano de remoção: ./README.md.
 */
export default function LoginPage() {
  return <HomeContent role="user" homeHref="/login" />;
}

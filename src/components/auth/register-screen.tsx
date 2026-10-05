"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { RegisterForm, type RegisterFormData } from "./register-form";
import { Button } from "@/components/ui/button";

type SubmitErrors = { email?: string; form?: string };
type PerfilType = "comprador" | "organizador";

export function RegisterScreen() {
  const [perfil, setPerfil] = useState<PerfilType>("comprador");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit({ email }: RegisterFormData) {
    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalized = email.trim().toLowerCase();
    if (normalized === "existe@teste.com") {
      setErrors({ email: "Este e-mail já está cadastrado." });
    } else if (normalized === "erro@teste.com") {
      setErrors({ form: "Não foi possível criar sua conta. Tente novamente." });
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  }

  // TELA 2: EM BREVE (Modo Organizador)
  if (perfil === "organizador") {
    return (
      <div className="flex min-h-screen w-full bg-background text-foreground relative">
        {/* Logo Absoluto - Tema Dinâmico */}
        <Link href="/" className="absolute top-6 left-6 lg:top-12 lg:left-12 flex items-center gap-2 z-10 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-[9px] font-bold text-black uppercase">
            Logo
          </div>
          <span className="font-bold text-xl tracking-tight">Hubee</span>
        </Link>

        <div className="flex flex-col lg:flex-row w-full h-screen">
          {/* Coluna Esquerda - Texto */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 lg:p-24 pt-32">
            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center mb-6">
              <TriangleAlert size={24} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Em breve</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              A área de criação de eventos e o portal para organizadores ainda não estão disponíveis.
              <br /><br />
              Estamos preparando uma experiência incrível para você gerenciar seus eventos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button asChild className="w-fit border border-input bg-transparent hover:bg-accent text-foreground">
                <Link href="/">
                  Explorar os eventos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <button 
                onClick={() => setPerfil("comprador")} 
                className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar para cadastro
              </button>
            </div>
          </div>
          
          {/* Coluna Direita - Ilustração Mockada do Figma */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-accent/20 items-center justify-center p-12 relative overflow-hidden">
            {/* Círculo de fundo brilhante para dar o efeito do Figma */}
            <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
            
            {/* Card Mockado "Próxima atração" */}
            <div className="w-80 h-52 bg-[#262626] dark:bg-[#1A1A1A] rounded-2xl relative flex flex-col items-center justify-start pt-4 border border-yellow-500/20 shadow-2xl z-10">
              <div className="w-11/12 bg-yellow-400 text-yellow-950 text-[10px] font-bold py-2 px-3 rounded flex justify-between items-center mb-4">
                <span>PRÓXIMA ATRAÇÃO</span>
                <span className="w-2 h-2 bg-yellow-950 rounded-full"></span>
              </div>
              <div className="w-11/12 flex gap-3">
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 bg-white/10 rounded-full"></div>
                  <div className="w-2/3 h-3 bg-white/10 rounded-full"></div>
                </div>
                <div className="w-16 h-12 bg-yellow-100 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TELA 1: CADASTRO COMPRADOR
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground relative">
      {/* Logo Absoluto - Branco no Desktop (por causa do banner escuro), Dinâmico no Mobile */}
      <Link href="/" className="absolute top-6 left-6 lg:top-12 lg:left-12 flex items-center gap-2 z-10 lg:text-white hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-[9px] font-bold text-black uppercase">
          Logo
        </div>
        <span className="font-bold text-xl tracking-tight">Hubee</span>
      </Link>
      
      {/* Coluna Esquerda - Banner Escuro */}
      <div className="hidden lg:flex w-1/3 bg-[#1A1A1A] text-white p-12 flex-col justify-center relative">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Tudo começa <br />
          com uma conta <br />
          simples.
        </h1>
        <p className="text-zinc-400 text-lg max-w-sm">
          Compre ingressos, acompanhe novidades e, se desejar, publique seus próprios eventos.
        </p>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 pt-28 lg:pt-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Criar conta</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Escolha seu perfil e preencha os dados abaixo.
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
            >
              Cadastro simulado com sucesso.
            </div>
          )}

          {/* Passando o perfil e a função de atualizar para o formulário */}
          <RegisterForm 
            perfil={perfil} 
            onPerfilChange={setPerfil} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            errors={errors} 
          />
        </div>
      </div>
    </div>
  );
}
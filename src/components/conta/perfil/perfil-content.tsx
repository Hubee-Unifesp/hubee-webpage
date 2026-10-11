"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { Button } from "@/components/ui/button";
import type { Usuario } from "@/types/usuario";
import { DadosPessoaisForm } from "./dados-pessoais-form";
import { ExcluirContaCard } from "./excluir-conta-card";
import { TrocarSenhaForm } from "./trocar-senha-form";

const CAMPOS_OBRIGATORIOS = ["perfil-nome", "perfil-email", "perfil-telefone"];

/** Conteúdo da página Meu Perfil (só visual: nada é enviado à API ainda). */
export function PerfilContent({ usuario }: { usuario: Usuario }) {
  const [perfilCompleto, setPerfilCompleto] = useState(usuario.perfilCompleto);

  function focarPrimeiroCampoVazio() {
    const campos = CAMPOS_OBRIGATORIOS.map((id) => document.getElementById(id) as HTMLInputElement | null);
    (campos.find((campo) => campo && !campo.value.trim()) ?? campos[0])?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <ContaPageTitle>Meu Perfil</ContaPageTitle>

      {!perfilCompleto && (
        <section
          aria-labelledby="aviso-perfil-titulo"
          className="flex items-start gap-3 rounded-xl border border-hubee-400 bg-hubee-200 p-4 text-hubee-750"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-hubee-600" />
          <div className="flex flex-col items-start gap-1">
            <h2 id="aviso-perfil-titulo" className="text-sm font-semibold text-hubee-800">
              Complete seu perfil
            </h2>
            <p className="text-xs">Complete o seu perfil para comprar ingressos.</p>
            <Button
              type="button"
              size="sm"
              onClick={focarPrimeiroCampoVazio}
              className="mt-2 h-7 bg-hubee-800 text-xs text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800/40"
            >
              Completar perfil
            </Button>
          </div>
        </section>
      )}

      <DadosPessoaisForm usuario={usuario} onSalvo={setPerfilCompleto} />
      <TrocarSenhaForm />
      <ExcluirContaCard />
    </div>
  );
}

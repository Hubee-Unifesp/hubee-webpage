"use client";

import { useState, type FormEvent } from "react";
import { ContaCard } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Campo, submitButtonClassName } from "./campo";

// TODO(auth-forms): usar PASSWORD_MIN_LENGTH de lib/validations/auth.schema.ts e o PasswordInput
// de components/auth quando a tela de cadastro (#22) entrar.
const TAMANHO_MINIMO = 8;

interface Erros {
  atual?: string;
  nova?: string;
  confirmar?: string;
}

interface Valores {
  atual: string;
  nova: string;
  confirmar: string;
}

// Ordem dos campos na tela: o primeiro com erro recebe o foco ao enviar.
const CAMPOS: ReadonlyArray<{ chave: keyof Erros; id: string }> = [
  { chave: "atual", id: "senha-atual" },
  { chave: "nova", id: "senha-nova" },
  { chave: "confirmar", id: "senha-confirmar" },
];

function validar({ atual, nova, confirmar }: Valores): Erros {
  const erros: Erros = {};
  if (!atual) erros.atual = "Informe sua senha atual.";
  if (nova.length < TAMANHO_MINIMO) erros.nova = `A nova senha deve ter pelo menos ${TAMANHO_MINIMO} caracteres.`;
  else if (nova === atual) erros.nova = "A nova senha deve ser diferente da atual.";
  if (confirmar !== nova) erros.confirmar = "As senhas não coincidem.";
  return erros;
}

export function TrocarSenhaForm() {
  const toast = useToast();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  // Depois do primeiro envio, os erros são recalculados a cada alteração e somem assim que o campo é corrigido.
  const [submetido, setSubmetido] = useState(false);
  const erros: Erros = submetido ? validar({ atual, nova, confirmar }) : {};

  function aoSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmetido(true);

    const primeiroComErro = CAMPOS.find(({ chave }) => validar({ atual, nova, confirmar })[chave]);
    if (primeiroComErro) {
      document.getElementById(primeiroComErro.id)?.focus();
      return;
    }
    // TODO(profile-api): enviar a troca de senha para a API.
    setAtual("");
    setNova("");
    setConfirmar("");
    setSubmetido(false);
    toast.success("Senha alterada com sucesso.");
  }

  return (
    <ContaCard title="Trocar Senha" description="Para sua segurança, use uma senha forte">
      <form onSubmit={aoSalvar} noValidate className="flex flex-col gap-5">
        <Campo
          id="senha-atual"
          label="Senha Atual"
          type="password"
          autoComplete="current-password"
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
          erro={erros.atual}
        />
        <Campo
          id="senha-nova"
          label="Nova Senha"
          type="password"
          autoComplete="new-password"
          value={nova}
          onChange={(e) => setNova(e.target.value)}
          erro={erros.nova}
        />
        <Campo
          id="senha-confirmar"
          label="Confirmar Nova Senha"
          type="password"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          erro={erros.confirmar}
        />
        <Button type="submit" className={submitButtonClassName}>
          Salvar Senha
        </Button>
      </form>
    </ContaCard>
  );
}

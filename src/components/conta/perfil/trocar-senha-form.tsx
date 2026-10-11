"use client";

import { useState, type FormEvent } from "react";
import { ContaCard } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Campo, submitButtonClassName } from "./campo";

const TAMANHO_MINIMO = 8;

interface Erros {
  atual?: string;
  nova?: string;
  confirmar?: string;
}

export function TrocarSenhaForm() {
  const toast = useToast();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState<Erros>({});

  function aoSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const novosErros: Erros = {};
    if (!atual) novosErros.atual = "Informe sua senha atual.";
    if (nova.length < TAMANHO_MINIMO) novosErros.nova = `A nova senha deve ter pelo menos ${TAMANHO_MINIMO} caracteres.`;
    else if (nova === atual) novosErros.nova = "A nova senha deve ser diferente da atual.";
    if (confirmar !== nova) novosErros.confirmar = "As senhas não coincidem.";
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      toast.error("Revise os campos destacados.");
      return;
    }
    // TODO(profile-api): enviar a troca de senha para a API.
    setAtual("");
    setNova("");
    setConfirmar("");
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

"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { ContaCard } from "@/components/conta/conta-card";
import { UserAvatar } from "@/components/layout/logged/user-avatar";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { Usuario } from "@/types/usuario";
import { Campo, submitButtonClassName } from "./campo";

const FORMATOS_FOTO = ["image/jpeg", "image/png"];

function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface Erros {
  nome?: string;
  email?: string;
  telefone?: string;
}

interface DadosPessoaisFormProps {
  usuario: Usuario;
  /** Avisa se, depois de salvar, o perfil está completo. */
  onSalvo: (perfilCompleto: boolean) => void;
}

export function DadosPessoaisForm({ usuario, onSalvo }: DadosPessoaisFormProps) {
  const toast = useToast();
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [telefone, setTelefone] = useState(usuario.telefone ?? "");
  const [foto, setFoto] = useState<string | null>(usuario.avatarUrl ?? null);
  const [erros, setErros] = useState<Erros>({});

  // Libera a URL temporária da prévia quando a foto muda ou o componente sai da tela.
  useEffect(() => {
    return () => {
      if (foto?.startsWith("blob:")) URL.revokeObjectURL(foto);
    };
  }, [foto]);

  function aoEscolherFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (!FORMATOS_FOTO.includes(arquivo.type)) {
      toast.error("Formato inválido. Use uma imagem .jpg, .png ou .jpeg.");
      return;
    }
    setFoto(URL.createObjectURL(arquivo));
  }

  function aoSalvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe seu nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novosErros.email = "Informe um e-mail válido.";
    if (telefone && telefone.replace(/\D/g, "").length < 10) novosErros.telefone = "Informe o telefone com DDD.";
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      toast.error("Revise os campos destacados.");
      return;
    }
    // TODO(profile-api): enviar os dados e a foto para a API.
    onSalvo(Boolean(nome.trim() && email.trim() && telefone));
    toast.success("Dados pessoais atualizados.");
  }

  return (
    <ContaCard title="Dados Pessoais" description="Atualize suas informações de contato">
      <form onSubmit={aoSalvar} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs leading-none font-medium">Foto de Perfil</span>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={nome}
              src={foto}
              className="size-16 bg-hubee-neutral-50 text-lg text-hubee-neutral-300 dark:bg-hubee-neutral-50 dark:text-hubee-neutral-300"
            />
            <label
              htmlFor="perfil-foto"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md p-1 text-xs text-hubee-neutral-300 has-focus-visible:ring-3 has-focus-visible:ring-hubee-600/40 dark:text-hubee-200"
            >
              <Upload aria-hidden="true" className="size-4" />
              <span className="sr-only">Enviar foto de perfil. Formatos aceitos: </span>
              .jpg, .png, .jpeg.
              <input
                id="perfil-foto"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={aoEscolherFoto}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <Campo
          id="perfil-nome"
          label="Nome Completo"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          erro={erros.nome}
        />
        <Campo
          id="perfil-email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={erros.email}
        />
        <Campo
          id="perfil-telefone"
          label="Telefone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          erro={erros.telefone}
        />

        <Button type="submit" className={submitButtonClassName}>
          Salvar Alterações
        </Button>
      </form>
    </ContaCard>
  );
}

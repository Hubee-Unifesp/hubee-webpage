"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Upload } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { ContaCard } from "@/components/conta/conta-card";
import { UserAvatar } from "@/components/layout/logged/user-avatar";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { personalDataSchema, type PersonalDataInputs } from "@/lib/validations/profile.schema";
import type { Usuario } from "@/types/usuario";
import { fieldInputClassName, fieldLabelClassName, submitButtonClassName } from "./perfil-styles";

const FORMATOS_FOTO = ["image/jpeg", "image/png"];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface DadosPessoaisFormProps {
  usuario: Usuario;
  /** Avisa se, depois de salvar, o perfil está completo. */
  onSalvo: (profileComplete: boolean) => void;
}

export function DadosPessoaisForm({ usuario, onSalvo }: DadosPessoaisFormProps) {
  const toast = useToast();
  const [foto, setFoto] = useState<string | null>(usuario.avatarUrl ?? null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataInputs>({
    resolver: zodResolver(personalDataSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { fullName: usuario.fullName, email: usuario.email, phone: usuario.phone ?? "" },
  });
  const fullName = useWatch({ control, name: "fullName" });

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

  function aoSalvar(dados: PersonalDataInputs) {
    // TODO(profile-api): enviar os dados e a foto para a API.
    onSalvo(Boolean(dados.fullName.trim() && dados.email.trim() && dados.phone));
    toast.success("Dados pessoais atualizados.");
  }

  return (
    <ContaCard title="Dados Pessoais" description="Atualize suas informações de contato">
      <form onSubmit={handleSubmit(aoSalvar)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs leading-none font-medium">Foto de Perfil</span>
          <div className="flex items-center gap-3">
            <UserAvatar
              name={fullName}
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

        <AuthField
          id="perfil-nome"
          label="Nome Completo"
          labelClassName={fieldLabelClassName}
          error={errors.fullName?.message}
        >
          <AuthInput
            {...fieldA11y("perfil-nome", errors.fullName?.message)}
            autoComplete="name"
            className={fieldInputClassName}
            {...register("fullName")}
          />
        </AuthField>

        <AuthField id="perfil-email" label="E-mail" labelClassName={fieldLabelClassName} error={errors.email?.message}>
          <AuthInput
            {...fieldA11y("perfil-email", errors.email?.message)}
            type="email"
            autoComplete="email"
            className={fieldInputClassName}
            {...register("email")}
          />
        </AuthField>

        <AuthField
          id="perfil-telefone"
          label="Telefone"
          labelClassName={fieldLabelClassName}
          error={errors.phone?.message}
        >
          {/* Controller: a máscara reescreve o valor a cada tecla, o que o `register` simples não faz. */}
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <AuthInput
                {...fieldA11y("perfil-telefone", errors.phone?.message)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                className={fieldInputClassName}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
              />
            )}
          />
        </AuthField>

        <Button type="submit" className={submitButtonClassName}>
          Salvar Alterações
        </Button>
      </form>
    </ContaCard>
  );
}

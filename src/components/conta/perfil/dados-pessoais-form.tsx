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
import { useAuth } from "@/contexts/AuthContext";
import { mapMessagesToFields, parseApiError } from "@/lib/api/errors";
import { updateMe } from "@/lib/api/users";
import { personalDataSchema, type PersonalDataInputs } from "@/lib/validations/profile.schema";
import type { Usuario } from "@/types/usuario";
import { fieldInputClassName, fieldLabelClassName, submitButtonClassName } from "./perfil-styles";

const FORMATOS_FOTO = ["image/jpeg", "image/png"];

/** Campos do formulário que a API pode recusar, na ordem em que o texto da mensagem é testado. */
const CAMPOS_DA_API = {
  email: /e-?mail/i,
  phone: /telefone/i,
  fullName: /nome/i,
} satisfies Record<keyof PersonalDataInputs, RegExp>;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function toFormValues(usuario: Usuario): PersonalDataInputs {
  return { fullName: usuario.fullName, email: usuario.email, phone: formatPhone(usuario.phone ?? "") };
}

export function DadosPessoaisForm({ usuario }: { usuario: Usuario }) {
  const toast = useToast();
  const { updateUserState } = useAuth();
  // TODO(profile-api): a API ainda não tem endpoint de foto; a prévia vale só enquanto a página está aberta.
  const [foto, setFoto] = useState<string | null>(usuario.avatarUrl ?? null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonalDataInputs>({
    resolver: zodResolver(personalDataSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: toFormValues(usuario),
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

  async function aoSalvar(dados: PersonalDataInputs) {
    try {
      const atualizado = await updateMe({
        fullName: dados.fullName.trim(),
        email: dados.email.trim(),
        // A API só aceita dígitos e recusa texto vazio; `null` apaga o telefone.
        phone: onlyDigits(dados.phone) || null,
      });
      updateUserState(atualizado);
      reset(toFormValues(atualizado));
      toast.success("Dados pessoais atualizados.");
    } catch (error) {
      // Em qualquer erro o formulário não é resetado: o que a pessoa digitou continua nos campos.
      const { status, messages } = parseApiError(error);

      if (status === 409) {
        setError("email", { type: "server", message: "Este e-mail já está em uso." }, { shouldFocus: true });
        return;
      }

      if (status === 400) {
        const { fields, rest } = mapMessagesToFields(messages, CAMPOS_DA_API);
        const campos = Object.entries(fields) as [keyof PersonalDataInputs, string][];
        campos.forEach(([campo, message], index) =>
          setError(campo, { type: "server", message }, { shouldFocus: index === 0 }),
        );
        if (campos.length > 0 && rest.length === 0) return;
      }

      toast.error("Não foi possível salvar seus dados. Tente novamente.");
    }
  }

  return (
    <ContaCard title="Dados Pessoais" description="Atualize suas informações de contato">
      <form onSubmit={handleSubmit(aoSalvar)} noValidate aria-busy={isSubmitting} className="flex flex-col gap-5">
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

        <Button type="submit" disabled={isSubmitting} className={submitButtonClassName}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </ContaCard>
  );
}

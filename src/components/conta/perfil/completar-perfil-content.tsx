"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { ContaCard, ContaPageTitle } from "@/components/conta/conta-card";
import { ListMessage } from "@/components/home/events/list-states";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mapMessagesToFields, parseApiError } from "@/lib/api/errors";
import { updateMe } from "@/lib/api/users";
import { onlyDigits } from "@/lib/masks";
import {
  completeProfileSchema,
  formatCpf,
  type CompleteProfileInputs,
} from "@/lib/validations/profile.schema";
import type { Usuario } from "@/types/usuario";
import { fieldInputClassName, fieldLabelClassName, submitButtonClassName } from "./perfil-styles";

const CAMPOS_DA_API = {
  cpf: /cpf/i,
  birthDate: /nascimento|data/i,
} satisfies Record<keyof CompleteProfileInputs, RegExp>;

function toDefaultValues(usuario: Usuario): CompleteProfileInputs {
  return {
    cpf: formatCpf(usuario.cpf ?? ""),
    birthDate: usuario.birthDate ? usuario.birthDate.slice(0, 10) : "",
  };
}

function CompletarPerfilForm({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const toast = useToast();
  const { updateUserState } = useAuth();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInputs>({
    resolver: zodResolver(completeProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: toDefaultValues(usuario),
  });

  async function aoSalvar(dados: CompleteProfileInputs) {
    try {
      const atualizado = await updateMe({
        ...(!usuario.cpf ? { cpf: onlyDigits(dados.cpf) } : {}),
        birthDate: dados.birthDate.trim(),
      });

      updateUserState(atualizado);
      toast.success("Perfil concluído com sucesso!");
      router.push("/conta/perfil");
    } catch (error) {
      const { status, messages } = parseApiError(error);

      if (status === 409) {
        setError("cpf", { type: "server", message: "Este CPF já está em uso." }, { shouldFocus: true });
        return;
      }

      if (status === 400) {
        const { fields, rest } = mapMessagesToFields(messages, CAMPOS_DA_API);
        const campos = Object.entries(fields) as [keyof CompleteProfileInputs, string][];
        campos.forEach(([campo, message], index) =>
          setError(campo, { type: "server", message }, { shouldFocus: index === 0 }),
        );
        if (campos.length > 0 && rest.length === 0) return;
      }

      toast.error("Não foi possível salvar seus dados. Tente novamente.");
    }
  }

  return (
    <ContaCard
      title="Dados para compra de ingressos"
      description="Informe seu CPF e sua data de nascimento para concluir o cadastro e comprar ingressos na plataforma."
    >
      {usuario.profileComplete && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-200"
        >
          <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Seu perfil já está completo para compras. Você ainda pode atualizar sua data de nascimento abaixo.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(aoSalvar)} noValidate aria-busy={isSubmitting} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthField
            id="completar-cpf"
            label="CPF"
            labelClassName={fieldLabelClassName}
            error={errors.cpf?.message}
          >
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <AuthInput
                  {...fieldA11y("completar-cpf", errors.cpf?.message)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  disabled={Boolean(usuario.cpf)}
                  className={fieldInputClassName}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(formatCpf(event.target.value))}
                />
              )}
            />
            {usuario.cpf && (
              <span className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                O CPF não pode ser alterado após o cadastro.
              </span>
            )}
          </AuthField>

          <AuthField
            id="completar-nascimento"
            label="Data de Nascimento"
            labelClassName={fieldLabelClassName}
            error={errors.birthDate?.message}
          >
            <AuthInput
              {...fieldA11y("completar-nascimento", errors.birthDate?.message)}
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().split("T")[0]}
              className={fieldInputClassName}
              {...register("birthDate")}
            />
          </AuthField>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="outline" className="h-10 text-xs font-semibold sm:w-auto">
            <Link href="/conta/perfil">Voltar para Meu perfil</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className={`${submitButtonClassName} sm:w-auto sm:px-6`}>
            {isSubmitting ? "Salvando..." : "Concluir perfil"}
          </Button>
        </div>
      </form>
    </ContaCard>
  );
}

export function CompletarPerfilContent() {
  const { user, isLoading, hasError, refreshUser } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/conta/perfil"
          aria-label="Voltar para Meu perfil"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-hubee-200 bg-hubee-100 text-hubee-800 outline-none hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:border-hubee-750 dark:bg-hubee-750/60 dark:text-hubee-50 dark:hover:bg-hubee-700 dark:focus-visible:ring-hubee-400"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
        <ContaPageTitle>Completar Perfil</ContaPageTitle>
      </div>

      {user ? (
        <CompletarPerfilForm key={`${user.id}-${user.cpf ?? ""}-${user.birthDate ?? ""}`} usuario={user} />
      ) : hasError && !isLoading ? (
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={() => void refreshUser()}
        />
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col gap-4">
          <span className="sr-only">Carregando seu perfil…</span>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

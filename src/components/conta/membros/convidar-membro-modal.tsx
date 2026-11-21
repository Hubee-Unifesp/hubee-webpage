"use client";

import { useEffect, useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  emptyInviteMemberForm,
  INVITE_EMAIL_MAX_LENGTH,
  inviteMemberSchema,
  MEMBER_ROLE_PRESETS,
  toInviteMemberPayload,
  type InviteMemberFormInputs,
  type InviteMemberFormValues,
} from "@/lib/validations/organization-member.schema";
import type { ConvidarMembroPayload } from "@/types/membro-organizacao";
import { PapelMembroBadge } from "./membro-badges";

export type ResultadoConvite = "ok" | "nao-encontrado" | "ja-vinculado" | "erro";

interface ConvidarMembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  onSubmit: (payload: ConvidarMembroPayload) => Promise<ResultadoConvite>;
}

const ERRO_RESULTADO: Partial<Record<ResultadoConvite, string>> = {
  "nao-encontrado": "Nenhuma conta encontrada com esse e-mail. Peça para a pessoa criar conta na Hubee primeiro.",
  "ja-vinculado": "Este usuário já está vinculado ou possui um convite pendente nesta organização.",
};

/** Modal "Convidar membro" por e-mail com seleção de papel e permissão (GOL-274 / GOL-277). */
export function ConvidarMembroModal({
  open,
  onOpenChange,
  organizationName,
  onSubmit,
}: ConvidarMembroModalProps) {
  const formId = useId();
  const emailId = useId();
  const papelGroupId = useId();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormInputs, unknown, InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: emptyInviteMemberForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(emptyInviteMemberForm);
  }, [open, reset]);

  function fecharOuAbrir(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) setErroServidor(null);
    onOpenChange(nextOpen);
  }

  async function enviar(values: InviteMemberFormValues) {
    setErroServidor(null);
    const resultado = await onSubmit(toInviteMemberPayload(values));
    if (resultado === "ok") {
      setErroServidor(null);
      onOpenChange(false);
      return;
    }
    setErroServidor(ERRO_RESULTADO[resultado] ?? null);
  }

  return (
    <Modal
      open={open}
      onOpenChange={fecharOuAbrir}
      dismissible={!isSubmitting}
      title="Convidar membro"
      description={`Envie um convite por e-mail para integrar a equipe de ${organizationName}.`}
      className="max-w-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => fecharOuAbrir(false)}
            className="h-10 cursor-pointer rounded-lg border-hubee-300 bg-transparent px-4 font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="hubee_750"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-10 cursor-pointer rounded-lg px-5 font-semibold dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Enviando..." : "Enviar convite"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit(enviar)}
        onChange={() => erroServidor && setErroServidor(null)}
        className="flex flex-col gap-4"
      >
        {erroServidor && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950/70 dark:text-red-200"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{erroServidor}</span>
          </div>
        )}

        <AuthField
          id={emailId}
          label="E-mail *"
          labelClassName="text-xs font-semibold"
          error={errors.email?.message}
        >
          <AuthInput
            {...fieldA11y(emailId, errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder="nome@unifesp.br"
            maxLength={INVITE_EMAIL_MAX_LENGTH}
            className="h-10 rounded-lg"
            {...register("email")}
          />
        </AuthField>

        <div className="flex flex-col gap-2">
          <span id={papelGroupId} className="text-xs font-semibold text-hubee-800 dark:text-hubee-50">
            Papel / Permissão *
          </span>

          <Controller
            control={control}
            name="level"
            render={({ field }) => (
              <div role="radiogroup" aria-labelledby={papelGroupId} className="flex flex-col gap-2">
                {MEMBER_ROLE_PRESETS.map((preset) => {
                  const selecionado = field.value === preset.level;
                  return (
                    <button
                      key={preset.level}
                      type="button"
                      role="radio"
                      aria-checked={selecionado}
                      disabled={isSubmitting}
                      onClick={() => field.onChange(preset.level)}
                      className={cn(
                        "flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-hubee-400 disabled:cursor-not-allowed disabled:opacity-60",
                        selecionado
                          ? "border-2 border-hubee-400 bg-hubee-100/80 dark:border-hubee-400 dark:bg-hubee-800/80"
                          : "border-hubee-200 bg-hubee-neutral-25 hover:border-hubee-300 dark:border-hubee-50/15 dark:bg-hubee-900/60 dark:hover:border-hubee-50/30",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-hubee-800 dark:text-hubee-50">
                          {selecionado && <Check aria-hidden="true" className="size-3.5 text-hubee-700 dark:text-hubee-400" />}
                          <span>{preset.label}</span>
                          <span className="font-normal text-hubee-neutral-300 dark:text-hubee-200">
                            ({preset.technicalLabel})
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-hubee-neutral-300 dark:text-hubee-200">
                          {preset.description}
                        </p>
                      </div>
                      <PapelMembroBadge level={preset.level} className="shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          />

          {errors.level?.message && (
            <p role="alert" className="text-xs text-red-700 dark:text-red-300">
              {errors.level.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ExternalLink, Loader2 } from "lucide-react";
import { AuthField, AuthInput, authInputClassName, fieldA11y } from "@/components/auth/auth-field";
import { FormAlert } from "@/components/auth/form-alert";
import { CapaUpload } from "@/components/conta/eventos/editor/capa-upload";
import { fieldInputClassName, fieldLabelClassName } from "@/components/conta/perfil/perfil-styles";
import { Modal } from "@/components/modal";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getEventoEditavel,
  updateEvento,
  uploadCapaEvento,
} from "@/lib/api/organizer-events";
import { cn } from "@/lib/utils";
import {
  EVENT_EDITION_MAX_LENGTH,
  EVENT_NAME_MAX_LENGTH,
} from "@/lib/validations/event.schema";
import type { EventoEditavel } from "@/types/evento-editor";
import type { EventoOrganizador } from "@/types/organizacao";

const quickEventSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "O nome do evento é obrigatório." })
    .max(EVENT_NAME_MAX_LENGTH, {
      error: `O nome deve ter no máximo ${EVENT_NAME_MAX_LENGTH} caracteres.`,
    }),
  edition: z
    .string()
    .trim()
    .max(EVENT_EDITION_MAX_LENGTH, {
      error: `A edição deve ter no máximo ${EVENT_EDITION_MAX_LENGTH} caracteres.`,
    }),
  description: z.string().trim(),
});

type QuickEventFormInputs = z.input<typeof quickEventSchema>;
type QuickEventFormValues = z.output<typeof quickEventSchema>;

interface CustomizarEventoModalProps {
  evento: EventoOrganizador | null;
  onClose: () => void;
  onSalvo: () => void;
}

type ModalLoadState =
  | { eventId: string; status: "ok"; data: EventoEditavel }
  | { eventId: string; status: "error"; message: string };

/**
 * Modal de customização rápida do evento direto em `/minha-organizacao`:
 * envia nova capa 16:9 (`PATCH /events/:id/photo`) e atualiza nome, edição e descrição (`PATCH /events/:id`).
 */
export function CustomizarEventoModal({ evento, onClose, onSalvo }: CustomizarEventoModalProps) {
  const toast = useToast();
  const formId = useId();
  const nomeId = useId();
  const edicaoId = useId();
  const descricaoId = useId();

  const [loadState, setLoadState] = useState<ModalLoadState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [arquivoCapa, setArquivoCapa] = useState<File | null>(null);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickEventFormInputs, unknown, QuickEventFormValues>({
    resolver: zodResolver(quickEventSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { name: "", edition: "", description: "" },
  });

  const eventId = evento?.id ?? null;

  useEffect(() => {
    if (!eventId) return;

    let active = true;
    getEventoEditavel(eventId)
      .then((data) => {
        if (!active) return;
        setLoadState({ eventId, status: "ok", data });
        reset({
          name: data.name,
          edition: data.edition ?? "",
          description: data.description ?? "",
        });
        setArquivoCapa(null);
        setErroFormulario(null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          eventId,
          status: "error",
          message: getApiErrorMessage(error, "Não foi possível carregar os dados do evento."),
        });
      });

    return () => {
      active = false;
    };
  }, [eventId, attempt, reset]);

  const estadoAtual = eventId && loadState?.eventId === eventId ? loadState : null;
  const carregando = Boolean(eventId) && estadoAtual === null;
  const editavel = estadoAtual?.status === "ok" ? estadoAtual.data : null;

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) {
      if (editavel) {
        reset({
          name: editavel.name,
          edition: editavel.edition ?? "",
          description: editavel.description ?? "",
        });
      } else {
        reset({ name: "", edition: "", description: "" });
      }
      setArquivoCapa(null);
      setErroFormulario(null);
      onClose();
    }
  }

  async function onSubmit(values: QuickEventFormValues) {
    if (!editavel) return;

    const mudouTexto =
      values.name !== editavel.name ||
      (values.edition || null) !== (editavel.edition ?? null) ||
      (values.description || null) !== (editavel.description ?? null);

    if (!mudouTexto && !arquivoCapa) {
      onClose();
      return;
    }

    setErroFormulario(null);
    let atualizado = editavel;
    let salvouTexto = false;

    try {
      if (mudouTexto) {
        atualizado = await updateEvento(
          editavel.id,
          {
            name: values.name,
            edition: values.edition || null,
            description: values.description || null,
          },
          editavel.lotes,
        );
        salvouTexto = true;
      }
      if (arquivoCapa) {
        atualizado = await uploadCapaEvento(editavel.id, arquivoCapa, atualizado.lotes);
      }

      setLoadState({ eventId: atualizado.id, status: "ok", data: atualizado });
      setArquivoCapa(null);
      toast.success(
        arquivoCapa && mudouTexto
          ? "Capa e informações do evento atualizadas!"
          : arquivoCapa
            ? "Capa do evento atualizada com sucesso!"
            : "Informações do evento atualizadas!",
      );
      onSalvo();
      onClose();
    } catch (error) {
      if (salvouTexto) {
        setLoadState({ eventId: atualizado.id, status: "ok", data: atualizado });
        onSalvo();
      }
      const mensagem = getApiErrorMessage(error, "Não foi possível salvar as alterações do evento.");
      setErroFormulario(mensagem);
      toast.error(mensagem);
    }
  }

  return (
    <Modal
      open={Boolean(evento)}
      onOpenChange={handleOpenChange}
      dismissible={!isSubmitting}
      title={evento ? `Customizar evento` : "Customizar evento"}
      description={
        evento
          ? `Atualize a capa e as informações principais de "${evento.nome}".`
          : undefined
      }
      className="max-w-2xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {evento ? (
            <Link
              href={`/meus-eventos/${evento.id}/editar`}
              onClick={() => handleOpenChange(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-hubee-750 underline-offset-4 hover:text-hubee-800 hover:underline dark:text-hubee-300 dark:hover:text-hubee-200"
            >
              Abrir editor completo (datas, local e lotes)
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-10 cursor-pointer rounded-lg border-hubee-300 bg-transparent px-4 font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting || carregando || !editavel}
              className="h-10 cursor-pointer rounded-lg bg-hubee-400 px-5 font-semibold text-hubee-900 hover:bg-hubee-300"
            >
              {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      }
    >
      {carregando ? (
        <div className="flex flex-col gap-4 py-2">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : estadoAtual?.status === "error" ? (
        <div className="flex flex-col items-start gap-3 py-2">
          <FormAlert variant="error">{estadoAtual.message}</FormAlert>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setLoadState(null);
              setAttempt((value) => value + 1);
            }}
            className="rounded-lg bg-hubee-800 text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-900"
          >
            Tentar novamente
          </Button>
        </div>
      ) : editavel ? (
        <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {erroFormulario && <FormAlert variant="error">{erroFormulario}</FormAlert>}

          <div className="flex flex-col gap-2">
            <span className={fieldLabelClassName}>Capa do evento</span>
            <CapaUpload
              photoUrl={editavel.photoUrl}
              arquivo={arquivoCapa}
              onChange={setArquivoCapa}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <AuthField
              id={nomeId}
              label="Nome do evento"
              labelClassName={fieldLabelClassName}
              error={errors.name?.message}
            >
              <AuthInput
                {...fieldA11y(nomeId, errors.name?.message)}
                disabled={isSubmitting}
                maxLength={EVENT_NAME_MAX_LENGTH}
                className={cn(authInputClassName, fieldInputClassName)}
                {...register("name")}
              />
            </AuthField>

            <AuthField
              id={edicaoId}
              label="Edição (opcional)"
              labelClassName={fieldLabelClassName}
              error={errors.edition?.message}
            >
              <AuthInput
                {...fieldA11y(edicaoId, errors.edition?.message)}
                disabled={isSubmitting}
                maxLength={EVENT_EDITION_MAX_LENGTH}
                placeholder="Ex.: 3ª edição · 2026"
                className={cn(authInputClassName, fieldInputClassName)}
                {...register("edition")}
              />
            </AuthField>
          </div>

          <AuthField
            id={descricaoId}
            label="Descrição (opcional)"
            labelClassName={fieldLabelClassName}
            error={errors.description?.message}
          >
            <Textarea
              {...fieldA11y(descricaoId, errors.description?.message)}
              rows={3}
              disabled={isSubmitting}
              placeholder="Conte os detalhes principais do evento para o público..."
              className="rounded-lg border-hubee-300 bg-white text-sm text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-300"
              {...register("description")}
            />
          </AuthField>
        </form>
      ) : null}
    </Modal>
  );
}

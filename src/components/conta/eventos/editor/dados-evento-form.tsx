"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { DateTimePicker, formatDateTimeLabel } from "@/components/date-time-picker";
import { categoryConfig } from "@/components/home/events/categories.config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AGE_RATINGS,
  EVENT_CATEGORIES,
  EVENT_EDITION_MAX_LENGTH,
  EVENT_NAME_MAX_LENGTH,
  eventSchema,
  toEventFormValues,
  toEventPayload,
  type EventFormInputs,
  type EventFormValues,
} from "@/lib/validations/event.schema";
import type { EventoEditavel, EventoPayload, LocalEvento, LocalPayload } from "@/types/evento-editor";
import { CadastrarLocalModal } from "./cadastrar-local-modal";
import { CapaUpload } from "./capa-upload";
import {
  acoesEtapaClassName,
  botaoPrimarioClassName,
  botaoTextoClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "./estilos";
import { SecaoFormulario } from "./secao-formulario";

interface DadosEventoFormProps {
  evento: EventoEditavel | null;
  locais: readonly LocalEvento[];
  organizerId: string;
  somenteLeitura: boolean;
  onCriarLocal: (payload: LocalPayload) => Promise<LocalEvento | null>;
  onSubmit: (payload: EventoPayload, capa: File | null) => Promise<void>;
  onContinuar: () => void;
}

export function DadosEventoForm({
  evento,
  locais,
  organizerId,
  somenteLeitura,
  onCriarLocal,
  onSubmit,
  onContinuar,
}: DadosEventoFormProps) {
  const [capa, setCapa] = useState<File | null>(null);
  const [cadastrandoLocal, setCadastrandoLocal] = useState(false);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInputs, unknown, EventFormValues>({
    resolver: zodResolver(eventSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: toEventFormValues(evento),
  });

  const [name, startDate, venueId] = useWatch({ control, name: ["name", "startDate", "venueId"] });
  const local = locais.find((item) => item.id === venueId) ?? null;

  async function cadastrarLocal(payload: LocalPayload): Promise<boolean> {
    const novo = await onCriarLocal(payload);
    if (!novo) return false;
    setValue("venueId", novo.id, { shouldDirty: true, shouldValidate: true });
    setCadastrandoLocal(false);
    return true;
  }

  async function enviar(values: EventFormValues) {
    await onSubmit(toEventPayload(values, organizerId), capa);
  }

  const bloqueado = somenteLeitura || isSubmitting;
  const nameError = errors.name?.message;
  const editionError = errors.edition?.message;
  const startError = errors.startDate?.message;
  const endError = errors.endDate?.message;
  const salesError = errors.salesStartDate?.message;
  const venueError = errors.venueId?.message;

  return (
    <form
      noValidate
      aria-busy={isSubmitting}
      onSubmit={somenteLeitura ? (event) => event.preventDefault() : handleSubmit(enviar)}
      className="flex flex-col gap-4"
    >
      <SecaoFormulario
        titulo="Informações básicas"
        descricao="É o que o público vê na página do evento."
        resumo={name.trim() || "Nome, categoria e descrição"}
        inicialmenteAberta
        forcarAberta={Boolean(nameError || editionError)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-2">
          <legend className="sr-only">Informações básicas</legend>

          <div className="md:col-span-2">
            <AuthField
              id="evento-nome"
              label="Nome do evento *"
              labelClassName={labelClassName}
              error={nameError}
              description={
                <span aria-live="polite">
                  {name.length} / {EVENT_NAME_MAX_LENGTH}
                </span>
              }
            >
              <AuthInput
                {...fieldA11y("evento-nome", nameError)}
                aria-required="true"
                placeholder="Ex.: Hubee Tech Summit"
                maxLength={EVENT_NAME_MAX_LENGTH}
                className={inputClassName}
                {...register("name")}
              />
            </AuthField>
          </div>

          <AuthField id="evento-categoria" label="Categoria" labelClassName={labelClassName}>
            <select id="evento-categoria" className={selectClassName} {...register("category")}>
              <option value="">Selecione</option>
              {EVENT_CATEGORIES.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoryConfig[categoria].label}
                </option>
              ))}
            </select>
          </AuthField>

          <AuthField id="evento-edicao" label="Edição" labelClassName={labelClassName} error={editionError}>
            <AuthInput
              {...fieldA11y("evento-edicao", editionError)}
              placeholder="Ex.: 3ª edição"
              maxLength={EVENT_EDITION_MAX_LENGTH}
              className={inputClassName}
              {...register("edition")}
            />
          </AuthField>

          <div className="flex flex-col gap-1 md:col-span-2">
            <span id="evento-classificacao" className={cn(labelClassName, "text-hubee-800 dark:text-hubee-50")}>
              Classificação indicativa
            </span>
            <Controller
              control={control}
              name="ageRating"
              render={({ field }) => (
                <div role="group" aria-labelledby="evento-classificacao" className="grid grid-cols-6 gap-1.5">
                  {AGE_RATINGS.map((rating) => {
                    const ativo = field.value === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => field.onChange(ativo ? "" : rating)}
                        className={cn(
                          "h-11 min-w-0 cursor-pointer rounded-lg border text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-hubee-500/40 disabled:cursor-not-allowed disabled:opacity-60",
                          ativo
                            ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                            : "border-hubee-300 bg-white text-hubee-800 hover:bg-hubee-100 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-800",
                        )}
                      >
                        {rating}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <AuthField id="evento-descricao" label="Descrição" labelClassName={labelClassName}>
              <Textarea
                id="evento-descricao"
                rows={4}
                placeholder="Conte o que vai acontecer, quem participa e o que o público precisa saber."
                className="min-h-24 rounded-lg border-hubee-neutral-50 bg-white text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50"
                {...register("description")}
              />
            </AuthField>
          </div>
        </fieldset>
      </SecaoFormulario>

      <SecaoFormulario
        titulo="Capa"
        descricao="Opcional. Sem capa, a página do evento usa o fundo padrão do Hubee."
        resumo={capa ? "Nova imagem escolhida" : evento?.photoUrl ? "Imagem enviada" : "Opcional"}
      >
        <CapaUpload photoUrl={evento?.photoUrl ?? null} arquivo={capa} onChange={setCapa} disabled={bloqueado} />
      </SecaoFormulario>

      <SecaoFormulario
        titulo="Data e horário"
        resumo={formatDateTimeLabel(startDate) ?? "Início, término e vendas"}
        forcarAberta={Boolean(startError || endError || salesError)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-3">
          <legend className="sr-only">Data e horário</legend>
          <AuthField id="evento-inicio" label="Início do evento *" labelClassName={labelClassName} error={startError}>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DateTimePicker
                  {...fieldA11y("evento-inicio", startError)}
                  aria-required="true"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={bloqueado}
                />
              )}
            />
          </AuthField>
          <AuthField id="evento-termino" label="Término do evento *" labelClassName={labelClassName} error={endError}>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DateTimePicker
                  {...fieldA11y("evento-termino", endError)}
                  aria-required="true"
                  mesInicial={startDate}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={bloqueado}
                />
              )}
            />
          </AuthField>
          <AuthField
            id="evento-vendas"
            label="Início das vendas"
            labelClassName={labelClassName}
            error={salesError}
            description={<span className={hintClassName}>Sem data, as vendas abrem quando o evento for publicado.</span>}
          >
            <Controller
              control={control}
              name="salesStartDate"
              render={({ field }) => (
                <DateTimePicker
                  {...fieldA11y("evento-vendas", salesError)}
                  clearable
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={bloqueado}
                />
              )}
            />
          </AuthField>
        </fieldset>
      </SecaoFormulario>

      <SecaoFormulario
        titulo="Local"
        resumo={local?.nome ?? "Selecione um local"}
        forcarAberta={Boolean(venueError)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-2">
          <legend className="sr-only">Local</legend>
          <AuthField id="evento-local" label="Local do evento *" labelClassName={labelClassName} error={venueError}>
            <Controller
              control={control}
              name="venueId"
              render={({ field }) => (
                <select
                  {...fieldA11y("evento-local", venueError)}
                  aria-required="true"
                  className={selectClassName}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                >
                  <option value="">Selecione um local</option>
                  {locais.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              )}
            />
          </AuthField>
          {local ? (
            <div className="flex flex-col justify-center gap-0.5 rounded-lg bg-hubee-100 px-3 py-2.5 text-sm dark:bg-hubee-800">
              <span className="font-semibold">{local.nome}</span>
              <span className="text-xs">Capacidade máxima: {local.capacidade.toLocaleString("pt-BR")} pessoas</span>
            </div>
          ) : (
            <span aria-hidden="true" className="hidden md:block" />
          )}
          {!somenteLeitura && (
            <div className="flex flex-wrap items-center gap-x-2 md:col-span-2">
              <span className={hintClassName}>Não encontrou o local?</span>
              <Button
                type="button"
                onClick={() => setCadastrandoLocal(true)}
                className={cn(botaoTextoClassName, "h-9 bg-transparent px-2")}
              >
                <Plus aria-hidden="true" className="size-4" />
                Cadastrar novo local
              </Button>
            </div>
          )}
        </fieldset>
        {!somenteLeitura && (
          <CadastrarLocalModal open={cadastrandoLocal} onOpenChange={setCadastrandoLocal} onSubmit={cadastrarLocal} />
        )}
      </SecaoFormulario>

      <div className={acoesEtapaClassName}>
        <Button asChild className={cn(botaoTextoClassName, "bg-transparent sm:mr-auto")}>
          <Link href="/meus-eventos">Cancelar</Link>
        </Button>
        {somenteLeitura ? (
          <Button type="button" onClick={onContinuar} className={botaoPrimarioClassName}>
            Ver ingressos
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className={botaoPrimarioClassName}>
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Salvando..." : evento ? "Salvar e continuar" : "Criar rascunho e continuar"}
          </Button>
        )}
      </div>
    </form>
  );
}

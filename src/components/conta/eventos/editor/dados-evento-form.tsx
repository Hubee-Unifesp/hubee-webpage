"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AlertTriangle, Loader2, MapPin, Plus } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { DateTimePicker, formatDateTimeLabel } from "@/components/date-time-picker";
import { categoryConfig } from "@/components/home/events/categories.config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  formatarSugestaoLocal,
  toEventFormValuesFromAiDraft,
  type EventAiDraft,
  type EventAiDraftField,
} from "@/lib/validations/event-ai-draft.schema";
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
import { CampoIaBadge } from "./gerador-ia-evento";
import { SecaoFormulario } from "./secao-formulario";

const campoPendenteClassName =
  "border-amber-500 bg-amber-50/70 focus-visible:border-amber-600 focus-visible:ring-amber-500/30 dark:border-amber-500 dark:bg-amber-950/35";
const campoInferidoClassName = "border-emerald-500/70 dark:border-emerald-500/60";
const campoCarregandoIaClassName =
  "animate-pulse bg-hubee-100/70 motion-reduce:animate-none dark:bg-hubee-850/80";

function AvisoCampoPendenteIa({ texto }: { texto: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
      <AlertTriangle aria-hidden="true" className="size-3 shrink-0" />
      {texto}
    </span>
  );
}

interface DadosEventoFormProps {
  evento: EventoEditavel | null;
  locais: readonly LocalEvento[];
  organizerId: string;
  somenteLeitura: boolean;
  rascunhoIa?: EventAiDraft | null;
  gerandoComIa?: boolean;
  camposPendentesIa?: ReadonlySet<EventAiDraftField>;
  camposInferidosIa?: ReadonlySet<EventAiDraftField>;
  onResolverPendenciaIa?: (campo: EventAiDraftField) => void;
  onCriarLocal: (payload: LocalPayload) => Promise<LocalEvento | null>;
  onSubmit: (payload: EventoPayload, capa: File | null) => Promise<void>;
  onContinuar: () => void;
}

export function DadosEventoForm({
  evento,
  locais,
  organizerId,
  somenteLeitura,
  rascunhoIa = null,
  gerandoComIa = false,
  camposPendentesIa,
  camposInferidosIa,
  onResolverPendenciaIa,
  onCriarLocal,
  onSubmit,
  onContinuar,
}: DadosEventoFormProps) {
  const [capa, setCapa] = useState<File | null>(null);
  const [cadastrandoLocal, setCadastrandoLocal] = useState(false);
  const ultimoRascunhoAplicado = useRef<EventAiDraft | null>(null);

  const {
    control,
    register,
    getValues,
    reset,
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

  useEffect(() => {
    if (!rascunhoIa || rascunhoIa === ultimoRascunhoAplicado.current) return;
    ultimoRascunhoAplicado.current = rascunhoIa;
    reset(toEventFormValuesFromAiDraft(rascunhoIa, getValues()));
  }, [rascunhoIa, getValues, reset]);

  const [name, category, edition, ageRating, description, startDate, endDate, venueId] = useWatch({
    control,
    name: ["name", "category", "edition", "ageRating", "description", "startDate", "endDate", "venueId"],
  });
  const local = locais.find((item) => item.id === venueId) ?? null;

  async function cadastrarLocal(payload: LocalPayload): Promise<boolean> {
    const novo = await onCriarLocal(payload);
    if (!novo) return false;
    setValue("venueId", novo.id, { shouldDirty: true, shouldValidate: true });
    onResolverPendenciaIa?.("venueSuggestion");
    setCadastrandoLocal(false);
    return true;
  }

  async function enviar(values: EventFormValues) {
    await onSubmit(toEventPayload(values, organizerId), capa);
  }

  const bloqueado = somenteLeitura || isSubmitting || gerandoComIa;
  const nameError = errors.name?.message;
  const editionError = errors.edition?.message;
  const startError = errors.startDate?.message;
  const endError = errors.endDate?.message;
  const salesError = errors.salesStartDate?.message;
  const venueError = errors.venueId?.message;

  const isPending = (campo: EventAiDraftField, valorAtual: string) =>
    Boolean(camposPendentesIa?.has(campo)) && valorAtual.trim() === "";
  const isInferred = (campo: EventAiDraftField, valorAtual: string) =>
    Boolean(camposInferidosIa?.has(campo)) && !isPending(campo, valorAtual) && valorAtual.trim() !== "";

  const namePending = isPending("name", name);
  const categoryPending = isPending("category", category);
  const editionPending = isPending("edition", edition);
  const ageRatingPending = isPending("ageRating", ageRating);
  const descriptionPending = isPending("description", description);
  const startPending = isPending("startDate", startDate);
  const endPending = isPending("endDate", endDate);
  const venuePending = isPending("venueSuggestion", venueId);

  const nameInferred = isInferred("name", name);
  const categoryInferred = isInferred("category", category);
  const editionInferred = isInferred("edition", edition);
  const ageRatingInferred = isInferred("ageRating", ageRating);
  const descriptionInferred = isInferred("description", description);
  const startInferred = isInferred("startDate", startDate);
  const endInferred = isInferred("endDate", endDate);

  const sugestaoLocalTexto = formatarSugestaoLocal(rascunhoIa?.venueSuggestion ?? null);
  const temPendenciaBasica =
    namePending || categoryPending || editionPending || ageRatingPending || descriptionPending;
  const temPendenciaData = startPending || endPending;

  const fieldStateClass = (pending: boolean, inferred: boolean) =>
    cn(
      gerandoComIa && campoCarregandoIaClassName,
      pending && campoPendenteClassName,
      !pending && inferred && campoInferidoClassName,
    );

  return (
    <form
      noValidate
      aria-busy={isSubmitting || gerandoComIa}
      onSubmit={somenteLeitura ? (event) => event.preventDefault() : handleSubmit(enviar)}
      className="flex flex-col gap-4"
    >
      <SecaoFormulario
        titulo="Informações básicas"
        descricao="É o que o público vê na página do evento."
        resumo={name.trim() || "Nome, categoria e descrição"}
        inicialmenteAberta
        forcarAberta={Boolean(nameError || editionError || temPendenciaBasica)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-2">
          <legend className="sr-only">Informações básicas</legend>

          <div className="md:col-span-2">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5">
              {namePending && <CampoIaBadge tipo="missing" />}
              {nameInferred && <CampoIaBadge tipo="inferred" />}
            </div>
            <AuthField
              id="evento-nome"
              label="Nome do evento *"
              labelClassName={labelClassName}
              error={nameError}
              description={
                <span className="flex flex-wrap items-center justify-between gap-2" aria-live="polite">
                  {namePending ? (
                    <AvisoCampoPendenteIa texto="A IA não identificou o nome do evento. Informe antes de salvar." />
                  ) : (
                    <span />
                  )}
                  <span>
                    {name.length} / {EVENT_NAME_MAX_LENGTH}
                  </span>
                </span>
              }
            >
              <AuthInput
                {...fieldA11y("evento-nome", nameError)}
                aria-required="true"
                placeholder="Ex.: Hubee Tech Summit"
                maxLength={EVENT_NAME_MAX_LENGTH}
                className={cn(inputClassName, fieldStateClass(namePending, nameInferred))}
                {...register("name", {
                  onChange: (event) => {
                    if (event.target.value.trim()) onResolverPendenciaIa?.("name");
                  },
                })}
              />
            </AuthField>
          </div>

          <div>
            {(categoryPending || categoryInferred) && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo={categoryPending ? "missing" : "inferred"} />
              </div>
            )}
            <AuthField
              id="evento-categoria"
              label="Categoria"
              labelClassName={labelClassName}
              description={
                categoryPending ? (
                  <AvisoCampoPendenteIa texto="A IA não identificou a categoria. Selecione se desejar." />
                ) : undefined
              }
            >
              <select
                id="evento-categoria"
                className={cn(selectClassName, fieldStateClass(categoryPending, categoryInferred))}
                {...register("category", {
                  onChange: (event) => {
                    if (event.target.value) onResolverPendenciaIa?.("category");
                  },
                })}
              >
                <option value="">Selecione</option>
                {EVENT_CATEGORIES.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoryConfig[categoria].label}
                  </option>
                ))}
              </select>
            </AuthField>
          </div>

          <div>
            {(editionPending || editionInferred) && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo={editionPending ? "missing" : "inferred"} />
              </div>
            )}
            <AuthField
              id="evento-edicao"
              label="Edição"
              labelClassName={labelClassName}
              error={editionError}
              description={
                editionPending ? (
                  <AvisoCampoPendenteIa texto="A IA não identificou a edição no texto. Preencha ou deixe em branco." />
                ) : undefined
              }
            >
              <AuthInput
                {...fieldA11y("evento-edicao", editionError)}
                placeholder="Ex.: 3ª edição"
                maxLength={EVENT_EDITION_MAX_LENGTH}
                className={cn(inputClassName, fieldStateClass(editionPending, editionInferred))}
                {...register("edition", {
                  onChange: (event) => {
                    if (event.target.value.trim()) onResolverPendenciaIa?.("edition");
                  },
                })}
              />
            </AuthField>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span id="evento-classificacao" className={cn(labelClassName, "text-hubee-800 dark:text-hubee-50")}>
                Classificação indicativa
              </span>
              {ageRatingPending && <CampoIaBadge tipo="missing" />}
              {ageRatingInferred && <CampoIaBadge tipo="inferred" />}
            </div>
            <Controller
              control={control}
              name="ageRating"
              render={({ field }) => (
                <div
                  role="group"
                  aria-labelledby="evento-classificacao"
                  className={cn(
                    "grid grid-cols-6 gap-1.5 rounded-lg",
                    ageRatingPending && "ring-2 ring-amber-500/80 ring-offset-2 ring-offset-hubee-50 dark:ring-offset-hubee-900",
                  )}
                >
                  {AGE_RATINGS.map((rating) => {
                    const ativo = field.value === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => {
                          const proximo = ativo ? "" : rating;
                          field.onChange(proximo);
                          if (proximo) onResolverPendenciaIa?.("ageRating");
                        }}
                        className={cn(
                          "h-11 min-w-0 cursor-pointer rounded-lg border text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-hubee-500/40 disabled:cursor-not-allowed disabled:opacity-60",
                          ativo
                            ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                            : "border-hubee-300 bg-white text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-50/10",
                        )}
                      >
                        {rating}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {ageRatingPending && (
              <AvisoCampoPendenteIa texto="A IA não identificou a classificação indicativa. Selecione uma opção se aplicável." />
            )}
          </div>

          <div className="md:col-span-2">
            {(descriptionPending || descriptionInferred) && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo={descriptionPending ? "missing" : "inferred"} />
              </div>
            )}
            <AuthField
              id="evento-descricao"
              label="Descrição"
              labelClassName={labelClassName}
              description={
                descriptionPending ? (
                  <AvisoCampoPendenteIa texto="A IA não gerou uma descrição. Escreva os detalhes do evento." />
                ) : undefined
              }
            >
              <Textarea
                id="evento-descricao"
                rows={4}
                placeholder="Conte o que vai acontecer, quem participa e o que o público precisa saber."
                className={cn(
                  "min-h-24 rounded-lg border-hubee-neutral-50 bg-white text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50",
                  fieldStateClass(descriptionPending, descriptionInferred),
                )}
                {...register("description", {
                  onChange: (event) => {
                    if (event.target.value.trim()) onResolverPendenciaIa?.("description");
                  },
                })}
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
        forcarAberta={Boolean(startError || endError || salesError || temPendenciaData)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-3">
          <legend className="sr-only">Data e horário</legend>
          <div>
            {(startPending || startInferred) && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo={startPending ? "missing" : "inferred"} />
              </div>
            )}
            <AuthField
              id="evento-inicio"
              label="Início do evento *"
              labelClassName={labelClassName}
              error={startError}
              description={
                startPending ? (
                  <AvisoCampoPendenteIa texto="Obrigatório · Informe a data e hora de início." />
                ) : undefined
              }
            >
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <div className={cn(startPending && "rounded-lg ring-2 ring-amber-500/80")}>
                    <DateTimePicker
                      {...fieldA11y("evento-inicio", startError)}
                      aria-required="true"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value) onResolverPendenciaIa?.("startDate");
                      }}
                      onBlur={field.onBlur}
                      disabled={bloqueado}
                    />
                  </div>
                )}
              />
            </AuthField>
          </div>
          <div>
            {(endPending || endInferred) && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo={endPending ? "missing" : "inferred"} />
              </div>
            )}
            <AuthField
              id="evento-termino"
              label="Término do evento *"
              labelClassName={labelClassName}
              error={endError}
              description={
                endPending ? (
                  <AvisoCampoPendenteIa texto="Obrigatório · Informe a data e hora de término." />
                ) : undefined
              }
            >
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <div className={cn(endPending && "rounded-lg ring-2 ring-amber-500/80")}>
                    <DateTimePicker
                      {...fieldA11y("evento-termino", endError)}
                      aria-required="true"
                      mesInicial={startDate}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value) onResolverPendenciaIa?.("endDate");
                      }}
                      onBlur={field.onBlur}
                      disabled={bloqueado}
                    />
                  </div>
                )}
              />
            </AuthField>
          </div>
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
        resumo={local?.nome ?? (venuePending ? "Pendente de revisão (IA)" : "Selecione um local")}
        forcarAberta={Boolean(venueError || venuePending)}
      >
        <fieldset disabled={bloqueado} className="grid min-w-0 gap-4 md:grid-cols-2">
          <legend className="sr-only">Local</legend>
          <div>
            {venuePending && (
              <div className="mb-1 flex justify-end">
                <CampoIaBadge tipo="missing" />
              </div>
            )}
            <AuthField
              id="evento-local"
              label="Local do evento *"
              labelClassName={labelClassName}
              error={venueError}
              description={
                venuePending ? (
                  <AvisoCampoPendenteIa texto='Obrigatório · Selecione o local cadastrado ou clique em "+ Cadastrar novo local".' />
                ) : undefined
              }
            >
              <Controller
                control={control}
                name="venueId"
                render={({ field }) => (
                  <select
                    {...fieldA11y("evento-local", venueError)}
                    aria-required="true"
                    className={cn(selectClassName, venuePending && campoPendenteClassName)}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(event);
                      if (event.target.value) onResolverPendenciaIa?.("venueSuggestion");
                    }}
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
          </div>
          {local ? (
            <div className="flex flex-col justify-center gap-0.5 rounded-lg bg-hubee-100 px-3 py-2.5 text-sm dark:bg-hubee-850">
              <span className="font-semibold">{local.nome}</span>
              <span className="text-xs">Capacidade máxima: {local.capacidade.toLocaleString("pt-BR")} pessoas</span>
            </div>
          ) : sugestaoLocalTexto ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/60 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/50 dark:text-amber-200">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">Local mencionado na descrição (IA):</span>
                <span>{sugestaoLocalTexto}</span>
              </div>
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

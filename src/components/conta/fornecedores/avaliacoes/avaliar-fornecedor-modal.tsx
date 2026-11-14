"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatOrderDate } from "@/components/conta/pedidos/format";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventoAvaliavel } from "@/lib/api/supplier-reviews";
import { cn } from "@/lib/utils";
import {
  emptySupplierReviewForm,
  SUPPLIER_REVIEW_COMMENT_MAX_LENGTH,
  supplierReviewSchema,
  toSupplierReviewPayload,
  type SupplierReviewFormInputs,
  type SupplierReviewFormValues,
} from "@/lib/validations/supplier-review.schema";
import type { AvaliacaoFornecedorPayload } from "@/types/avaliacao-fornecedor";
import { CRITERIOS, formatarNota } from "./avaliacoes.data";
import { EstrelasInput, EstrelasNota } from "./estrelas";

interface AvaliarFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorNome: string;
  eventos: readonly EventoAvaliavel[];
  /** Deve resolver `true` quando a avaliação foi salva (o modal fecha) e `false` em caso de erro. */
  onSubmit: (payload: AvaliacaoFornecedorPayload) => Promise<boolean>;
}

const labelClassName = "text-xs font-semibold";
const hintClassName = "text-[11px] text-hubee-neutral-300 dark:text-hubee-200";
const errorClassName = "text-xs text-red-700 dark:text-red-300";
const controlClassName =
  "border-hubee-neutral-50 bg-white text-hubee-800 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50";

/** Modal com o formulário de avaliação de um fornecedor após um evento. */
export function AvaliarFornecedorModal({ open, onOpenChange, fornecedorNome, eventos, onSubmit }: AvaliarFornecedorModalProps) {
  const formId = useId();
  const eventoLabelId = useId();
  const recomendaLabelId = useId();
  const comentarioId = useId();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierReviewFormInputs, unknown, SupplierReviewFormValues>({
    resolver: zodResolver(supplierReviewSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptySupplierReviewForm,
  });

  useEffect(() => {
    if (open) reset(emptySupplierReviewForm);
  }, [open, reset]);

  const [notas, comentario] = useWatch({ control, name: ["notas", "comentario"] });
  const valores = CRITERIOS.map(({ id }) => notas[id]);
  const preenchidas = valores.filter((valor) => valor > 0);
  const notaGeral = preenchidas.length ? preenchidas.reduce((a, b) => a + b, 0) / preenchidas.length : 0;

  async function enviar(values: SupplierReviewFormValues) {
    await onSubmit(toSupplierReviewPayload(values));
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isSubmitting}
      title="Avaliar fornecedor"
      description={`Conte como foi a experiência com "${fornecedorNome}". Sua avaliação ajuda a organização a escolher melhor os próximos fornecedores.`}
      className="max-w-xl"
      footer={
        <>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="h-10 cursor-pointer rounded-lg bg-hubee-100 px-5 font-semibold text-hubee-800 hover:bg-hubee-200 focus-visible:ring-hubee-800 dark:bg-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-900 dark:focus-visible:ring-hubee-400"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:focus-visible:ring-hubee-50"
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate aria-busy={isSubmitting} onSubmit={handleSubmit(enviar)} className="flex flex-col gap-5">
        <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-5">
          <legend className="sr-only">Avaliação do fornecedor</legend>

          <div className="flex flex-col gap-1.5">
            <span id={eventoLabelId} className={labelClassName}>
              Evento *
            </span>
            <Controller
              control={control}
              name="eventId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger
                    ref={field.ref}
                    aria-labelledby={eventoLabelId}
                    aria-invalid={errors.eventId ? true : undefined}
                    aria-describedby={errors.eventId ? `${eventoLabelId}-error` : undefined}
                    className={cn(controlClassName, "h-10 w-full rounded-lg")}
                  >
                    <SelectValue placeholder="Selecione o evento em que o fornecedor atuou" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {eventos.map((evento) => (
                      <SelectItem key={evento.id} value={evento.id}>
                        {evento.nome} · {formatOrderDate(evento.data)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventId && (
              <p id={`${eventoLabelId}-error`} className={errorClassName}>
                {errors.eventId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 dark:border-hubee-500/40 dark:bg-hubee-800/60">
            <div className="flex items-center justify-between gap-3">
              <span className={labelClassName}>Notas por critério *</span>
              <span className="flex items-center gap-2 text-xs" aria-live="polite">
                <span className="text-hubee-neutral-300 dark:text-hubee-200">Nota geral</span>
                <EstrelasNota nota={notaGeral} tamanho="sm" />
                <span className="font-bold tabular-nums">{notaGeral ? formatarNota(notaGeral) : "—"}</span>
              </span>
            </div>

            <ul className="flex flex-col divide-y divide-hubee-200 dark:divide-hubee-500/30">
              {CRITERIOS.map((criterio) => {
                const erro = errors.notas?.[criterio.id]?.message;
                const erroId = `${formId}-${criterio.id}-error`;
                return (
                  <li
                    key={criterio.id}
                    className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{criterio.label}</span>
                      <span className={hintClassName}>{criterio.descricao}</span>
                      {erro && (
                        <span id={erroId} className={errorClassName}>
                          {erro}
                        </span>
                      )}
                    </div>
                    <Controller
                      control={control}
                      name={`notas.${criterio.id}`}
                      render={({ field }) => (
                        <EstrelasInput
                          label={criterio.label}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          invalid={Boolean(erro)}
                          describedBy={erro ? erroId : undefined}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id={recomendaLabelId} className={labelClassName}>
              Você recomendaria este fornecedor? *
            </span>
            <Controller
              control={control}
              name="recomenda"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-labelledby={recomendaLabelId}
                  aria-invalid={errors.recomenda ? true : undefined}
                  className="grid grid-cols-2 gap-2"
                >
                  {(
                    [
                      { value: "sim", label: "Sim, recomendo", Icon: ThumbsUp, ativo: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200" },
                      { value: "nao", label: "Não recomendo", Icon: ThumbsDown, ativo: "border-red-600 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-950/60 dark:text-red-200" },
                    ] as const
                  ).map(({ value, label, Icon, ativo }) => (
                    <label
                      key={value}
                      className={cn(
                        "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-hubee-600 has-disabled:cursor-not-allowed has-disabled:opacity-60 dark:has-focus-visible:ring-hubee-400",
                        field.value === value
                          ? ativo
                          : "border-hubee-neutral-50 bg-white text-hubee-800 hover:border-hubee-400 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50",
                        errors.recomenda && field.value === "" && "border-red-600 dark:border-red-400",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        onBlur={field.onBlur}
                        className="sr-only"
                      />
                      <Icon aria-hidden="true" className="size-4" />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.recomenda && <p className={errorClassName}>{errors.recomenda.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={comentarioId} className={labelClassName}>
              Comentário
            </label>
            <Textarea
              id={comentarioId}
              rows={4}
              maxLength={SUPPLIER_REVIEW_COMMENT_MAX_LENGTH}
              placeholder="Ex.: Equipe pontual, montagem rápida e ótimo atendimento no dia do evento."
              aria-invalid={errors.comentario ? true : undefined}
              aria-describedby={`${comentarioId}-contador`}
              className={cn(controlClassName, "min-h-24 rounded-lg")}
              {...register("comentario")}
            />
            <div className="flex justify-between gap-2">
              {errors.comentario ? (
                <p className={errorClassName}>{errors.comentario.message}</p>
              ) : (
                <span className={hintClassName}>Opcional. Visível para os membros da organização.</span>
              )}
              <span id={`${comentarioId}-contador`} className={cn(hintClassName, "shrink-0 tabular-nums")}>
                {comentario.length} / {SUPPLIER_REVIEW_COMMENT_MAX_LENGTH}
              </span>
            </div>
          </div>
        </fieldset>

        <p className={hintClassName}>* Campos obrigatórios</p>
      </form>
    </Modal>
  );
}

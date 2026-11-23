"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { EstrelasInput } from "./estrelas";

interface AvaliarFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorNome: string;
  /** Deve resolver `true` quando a avaliação foi salva (o modal fecha) e `false` em caso de erro. */
  onSubmit: (payload: AvaliacaoFornecedorPayload) => Promise<boolean>;
}

const labelClassName = "text-xs font-semibold";
const hintClassName = "text-[11px] text-hubee-neutral-300 dark:text-hubee-200";
const errorClassName = "text-xs text-red-700 dark:text-red-300";
const controlClassName =
  "border-hubee-neutral-50 bg-white text-hubee-800 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-50";

/** Modal com o formulário de avaliação de um fornecedor: nota única e comentário opcional. */
export function AvaliarFornecedorModal({ open, onOpenChange, fornecedorNome, onSubmit }: AvaliarFornecedorModalProps) {
  const formId = useId();
  const notaLabelId = useId();
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

  const comentario = useWatch({ control, name: "comentario" });

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
            className="h-10 cursor-pointer rounded-lg bg-hubee-100 px-5 font-semibold text-hubee-800 hover:bg-hubee-200 focus-visible:ring-hubee-800 dark:bg-hubee-850 dark:text-hubee-50 dark:hover:bg-hubee-900 dark:focus-visible:ring-hubee-400"
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

          <div className="flex flex-col gap-2 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 dark:border-hubee-50/15 dark:bg-hubee-850">
            <span id={notaLabelId} className={labelClassName}>
              Nota *
            </span>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <EstrelasInput
                  label="Nota"
                  labelledBy={notaLabelId}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={Boolean(errors.rating)}
                  describedBy={errors.rating ? `${formId}-rating-error` : undefined}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.rating && (
              <span id={`${formId}-rating-error`} className={errorClassName}>
                {errors.rating.message}
              </span>
            )}
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

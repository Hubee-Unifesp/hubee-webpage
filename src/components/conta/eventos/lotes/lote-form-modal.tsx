"use client";

import { useEffect, useId, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { DateTimePicker } from "@/components/date-time-picker";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { toDateTimeLocal } from "@/lib/validations/event.schema";
import {
  buildTicketTypeSchema,
  emptyTicketTypeForm,
  TICKET_TYPE_BATCH_MAX_LENGTH,
  toLotePayload,
  toPrecoInput,
  type TicketTypeFormInputs,
  type TicketTypeFormValues,
} from "@/lib/validations/ticket-type.schema";
import type { LoteIngresso, LotePayload } from "@/types/lote-ingresso";
import {
  botaoPrimarioClassName,
  botaoSecundarioClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "../editor/estilos";
import { getVendidos, MODALIDADES_OPCOES } from "./lotes.data";
import { getApiErrorMessage } from "@/lib/api/errors";

interface LoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Com lote, o modal é de edição; sem, de criação. */
  lote: LoteIngresso | null;
  /** Deve resolver depois de salvar. Se rejeitar, o modal continua aberto e mostra o erro. */
  onSubmit: (payload: LotePayload) => Promise<void>;
}

function toFormValues(lote: LoteIngresso | null): TicketTypeFormInputs {
  if (!lote) return emptyTicketTypeForm;
  return {
    batch: lote.batch,
    modality: lote.modality,
    price: toPrecoInput(lote.price),
    quantity: String(lote.quantity),
    salesStartDate: toDateTimeLocal(lote.salesStartDate),
    salesEndDate: toDateTimeLocal(lote.salesEndDate),
  };
}

/** Modal com o formulário de criação e edição de lote, validado pelo schema Zod. */
export function LoteFormModal({ open, onOpenChange, lote, onSubmit }: LoteFormModalProps) {
  const formId = useId();
  const edicao = lote !== null;
  const vendidos = lote ? getVendidos(lote) : 0;
  const schema = useMemo(() => buildTicketTypeSchema(vendidos), [vendidos]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TicketTypeFormInputs, unknown, TicketTypeFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: toFormValues(lote),
  });

  // Cada abertura começa com os dados do lote escolhido (ou em branco).
  useEffect(() => {
    if (!open) return;
    reset(toFormValues(lote));
  }, [open, lote, reset]);

  const [batch, salesStartDate] = useWatch({ control, name: ["batch", "salesStartDate"] });

  async function enviar(values: TicketTypeFormValues) {
    try {
      await onSubmit(toLotePayload(values));
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error, "Não foi possível salvar o lote. Tente novamente.") });
    }
  }

  const batchError = errors.batch?.message;
  const modalityError = errors.modality?.message;
  const priceError = errors.price?.message;
  const quantityError = errors.quantity?.message;
  const startError = errors.salesStartDate?.message;
  const endError = errors.salesEndDate?.message;
  const rootError = errors.root?.message;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isSubmitting}
      title={edicao ? "Editar lote" : "Novo lote"}
      description={
        edicao && vendidos > 0
          ? `${vendidos} ${vendidos === 1 ? "ingresso já foi vendido" : "ingressos já foram vendidos"} neste lote.`
          : undefined
      }
      className="max-w-xl"
      footer={
        <>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className={botaoSecundarioClassName}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || batch.trim() === ""}
            aria-busy={isSubmitting}
            className={botaoPrimarioClassName}
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Salvando..." : edicao ? "Salvar alterações" : "Criar lote"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        aria-busy={isSubmitting}
        onSubmit={handleSubmit(enviar)}
        className="flex flex-col gap-4"
      >
        {rootError && (
          <p
            role="alert"
            className="rounded-lg border border-red-600/60 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/60 dark:bg-red-950/50 dark:text-red-300"
          >
            {rootError}
          </p>
        )}

        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <legend className="sr-only">Dados do lote</legend>

          <div className="sm:col-span-2">
            <AuthField
              id="lote-nome"
              label="Nome do lote *"
              labelClassName={labelClassName}
              error={batchError}
              description={
                <span aria-live="polite" className={hintClassName}>
                  {batch.length} / {TICKET_TYPE_BATCH_MAX_LENGTH}
                </span>
              }
            >
              <AuthInput
                {...fieldA11y("lote-nome", batchError)}
                aria-required="true"
                placeholder="Ex.: 1º Lote Inteira"
                maxLength={TICKET_TYPE_BATCH_MAX_LENGTH}
                className={inputClassName}
                {...register("batch")}
              />
            </AuthField>
          </div>

          <AuthField id="lote-modalidade" label="Modalidade *" labelClassName={labelClassName} error={modalityError}>
            <select
              {...fieldA11y("lote-modalidade", modalityError)}
              aria-required="true"
              className={selectClassName}
              {...register("modality")}
            >
              {MODALIDADES_OPCOES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </AuthField>

          <AuthField
            id="lote-preco"
            label="Preço *"
            labelClassName={labelClassName}
            error={priceError}
            description={<span className={hintClassName}>Use 0 para ingressos gratuitos.</span>}
          >
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-hubee-neutral-300 dark:text-hubee-200"
              >
                R$
              </span>
              <AuthInput
                {...fieldA11y("lote-preco", priceError)}
                aria-required="true"
                inputMode="decimal"
                placeholder="0,00"
                className={`${inputClassName} pl-9`}
                {...register("price")}
              />
            </div>
          </AuthField>

          <AuthField
            id="lote-quantidade"
            label="Quantidade total *"
            labelClassName={labelClassName}
            error={quantityError}
            description={
              edicao && vendidos > 0 ? (
                <span className={hintClassName}>Mínimo de {vendidos}, o total já vendido.</span>
              ) : undefined
            }
          >
            <AuthInput
              {...fieldA11y("lote-quantidade", quantityError)}
              aria-required="true"
              inputMode="numeric"
              placeholder="Ex.: 200"
              className={inputClassName}
              {...register("quantity")}
            />
          </AuthField>

          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <AuthField
              id="lote-inicio-vendas"
              label="Início das vendas"
              labelClassName={labelClassName}
              error={startError}
            >
              <Controller
                control={control}
                name="salesStartDate"
                render={({ field }) => (
                  <DateTimePicker
                    {...fieldA11y("lote-inicio-vendas", startError)}
                    clearable
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isSubmitting}
                  />
                )}
              />
            </AuthField>

            <AuthField
              id="lote-fim-vendas"
              label="Fim das vendas"
              labelClassName={labelClassName}
              error={endError}
            >
              <Controller
                control={control}
                name="salesEndDate"
                render={({ field }) => (
                  <DateTimePicker
                    {...fieldA11y("lote-fim-vendas", endError)}
                    clearable
                    mesInicial={salesStartDate}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isSubmitting}
                  />
                )}
              />
            </AuthField>
          </div>
        </fieldset>

        <p className={hintClassName}>* Campos obrigatórios. Sem datas, o lote vende enquanto o evento estiver aberto.</p>
      </form>
    </Modal>
  );
}

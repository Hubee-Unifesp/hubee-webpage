"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  emptyInstallmentForm,
  installmentSchema,
  toInstallmentFormInputs,
  toInstallmentPayload,
  type InstallmentFormInputs,
  type InstallmentFormValues,
} from "@/lib/validations/installment.schema";
import type { DespesaPlanejamento, ParcelaDespesa, ParcelaPayload } from "@/types/planejamento";
import {
  botaoPrimarioClassName,
  botaoSecundarioClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "../editor/estilos";
import { valorDisponivel } from "./cronograma.data";
import { formatarMoeda } from "./planejamento.data";

const FORMAS_DE_PAGAMENTO = ["Pix", "Transferência", "Boleto", "Cartão de crédito", "Dinheiro"];

interface ParcelaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaDespesa | null;
  despesas: readonly DespesaPlanejamento[];
  parcelas: readonly ParcelaDespesa[];
  onSubmit: (despesaId: string, payload: ParcelaPayload) => Promise<void>;
}

export function ParcelaFormModal({ open, onOpenChange, parcela, despesas, parcelas, onSubmit }: ParcelaFormModalProps) {
  const formId = useId();
  const formasId = useId();
  const edicao = parcela !== null;
  const orcadas = despesas.filter((despesa) => despesa.amount > 0 && despesa.paymentStatus !== "cancelado");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InstallmentFormInputs, unknown, InstallmentFormValues>({
    resolver: zodResolver(installmentSchema),
    defaultValues: emptyInstallmentForm(),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) reset(parcela ? toInstallmentFormInputs(parcela) : emptyInstallmentForm());
  }, [open, parcela, reset]);

  const despesaId = useWatch({ control, name: "expenseId" });
  const despesa = despesas.find((item) => item.id === despesaId) ?? null;
  const disponivel = despesa ? valorDisponivel(despesa, parcelas, parcela?.id) : null;

  async function enviar(values: InstallmentFormValues) {
    if (disponivel !== null && values.status !== "cancelado" && Math.round(values.amount * 100) > Math.round(disponivel * 100)) {
      setError("amount", { message: `A soma das parcelas não pode passar do valor da despesa. Disponível: ${formatarMoeda(disponivel)}.` });
      return;
    }
    const { expenseId, payload } = toInstallmentPayload(values);
    try {
      await onSubmit(expenseId, payload);
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error, "Não foi possível salvar a parcela. Tente novamente.") });
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isSubmitting}
      title={edicao ? "Editar parcela" : "Nova parcela"}
      description="Divida a despesa em parcelas, como um sinal e o restante. A soma não pode passar do valor da despesa."
      className="max-w-xl"
      footer={
        <>
          <Button type="button" disabled={isSubmitting} onClick={() => onOpenChange(false)} className={botaoSecundarioClassName}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting} className={botaoPrimarioClassName}>
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {edicao ? "Salvar alterações" : "Adicionar parcela"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(enviar)} className="flex flex-col gap-4">
        {errors.root?.message && (
          <p role="alert" className="rounded-lg border border-red-600/60 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/60 dark:bg-red-950/50 dark:text-[#f07186]">
            {errors.root.message}
          </p>
        )}

        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <legend className="sr-only">Dados da parcela</legend>

          <div className="sm:col-span-2">
            <AuthField
              id="parcela-despesa"
              label="Despesa *"
              labelClassName={labelClassName}
              error={errors.expenseId?.message}
              description={
                despesa && disponivel !== null ? (
                  <span aria-live="polite" className={hintClassName}>
                    Valor da despesa: {formatarMoeda(despesa.amount)} · disponível para parcelas: <strong>{formatarMoeda(disponivel)}</strong>
                  </span>
                ) : undefined
              }
            >
              {edicao ? (
                <>
                  <input type="hidden" {...register("expenseId")} />
                  <p id="parcela-despesa" className="py-2 text-sm font-semibold">
                    {parcela.expenseDescription}
                  </p>
                </>
              ) : (
                <select
                  {...fieldA11y("parcela-despesa", errors.expenseId?.message)}
                  aria-required="true"
                  className={selectClassName}
                  {...register("expenseId")}
                >
                  <option value="">Selecione a despesa</option>
                  {orcadas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.description} · {formatarMoeda(item.amount)}
                    </option>
                  ))}
                </select>
              )}
            </AuthField>
          </div>

          <AuthField id="parcela-data" label="Data *" labelClassName={labelClassName} error={errors.dueDate?.message}>
            <AuthInput
              {...fieldA11y("parcela-data", errors.dueDate?.message)}
              type="date"
              aria-required="true"
              className={inputClassName}
              {...register("dueDate")}
            />
          </AuthField>

          <AuthField id="parcela-valor" label="Valor (R$) *" labelClassName={labelClassName} error={errors.amount?.message}>
            <AuthInput
              {...fieldA11y("parcela-valor", errors.amount?.message)}
              inputMode="decimal"
              aria-required="true"
              placeholder="0,00"
              className={inputClassName}
              {...register("amount")}
            />
          </AuthField>

          <AuthField id="parcela-status" label="Situação *" labelClassName={labelClassName} error={errors.status?.message}>
            <select {...fieldA11y("parcela-status", errors.status?.message)} className={selectClassName} {...register("status")}>
              <option value="pendente">A pagar</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelada</option>
            </select>
          </AuthField>

          <AuthField id="parcela-forma" label="Forma de pagamento" labelClassName={labelClassName} error={errors.paymentMethod?.message}>
            <AuthInput
              {...fieldA11y("parcela-forma", errors.paymentMethod?.message)}
              list={formasId}
              placeholder="Ex.: Pix"
              className={inputClassName}
              {...register("paymentMethod")}
            />
          </AuthField>
          <datalist id={formasId}>
            {FORMAS_DE_PAGAMENTO.map((forma) => (
              <option key={forma} value={forma} />
            ))}
          </datalist>

          <div className="sm:col-span-2">
            <AuthField id="parcela-pagou" label="Quem pagou" labelClassName={labelClassName} error={errors.paidBy?.message}>
              <AuthInput
                {...fieldA11y("parcela-pagou", errors.paidBy?.message)}
                placeholder="Ex.: Ana"
                className={inputClassName}
                {...register("paidBy")}
              />
            </AuthField>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

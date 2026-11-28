"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api/errors";
import { parsePrecoBRL } from "@/lib/validations/ticket-type.schema";
import {
  emptyExpenseForm,
  expenseSchema,
  toExpenseFormInputs,
  toExpensePayload,
  type ExpenseFormInputs,
  type ExpenseFormValues,
} from "@/lib/validations/expense.schema";
import type {
  DespesaPlanejamento,
  DespesaPlanejamentoPayload,
  FornecedorPlanejamento,
  GrupoDespesa,
} from "@/types/planejamento";
import {
  botaoPrimarioClassName,
  botaoSecundarioClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "../editor/estilos";
import { CATEGORIAS_SUGERIDAS, calcularValorFinal, formatarMoeda, GRUPOS_DESPESA } from "./planejamento.data";

export interface NovaDespesaContexto {
  grupo: GrupoDespesa;
  categoria?: string;
}

interface DespesaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa: DespesaPlanejamento | null;
  contexto: NovaDespesaContexto;
  fornecedores: readonly FornecedorPlanejamento[];
  categoriasExistentes: readonly string[];
  onSubmit: (payload: DespesaPlanejamentoPayload) => Promise<void>;
}

function valoresIniciais(despesa: DespesaPlanejamento | null, contexto: NovaDespesaContexto): ExpenseFormInputs {
  return despesa ? toExpenseFormInputs(despesa) : emptyExpenseForm(contexto.grupo, contexto.categoria ?? "");
}

export function DespesaFormModal({
  open,
  onOpenChange,
  despesa,
  contexto,
  fornecedores,
  categoriasExistentes,
  onSubmit,
}: DespesaFormModalProps) {
  const formId = useId();
  const categoriasId = useId();
  const edicao = despesa !== null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInputs, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: valoresIniciais(despesa, contexto),
  });

  useEffect(() => {
    if (open) reset(valoresIniciais(despesa, contexto));
  }, [open, despesa, contexto, reset]);

  const [grupo, quantidade, valorUnitario] = useWatch({ control, name: ["group", "quantity", "unitPrice"] });
  const quantidadeNumero = Number(quantidade.replace(",", "."));
  const valorNumero = parsePrecoBRL(valorUnitario);
  const valorFinal =
    Number.isFinite(quantidadeNumero) && valorNumero !== null ? calcularValorFinal(quantidadeNumero, valorNumero) : null;
  const sugestoes = [...new Set([...CATEGORIAS_SUGERIDAS[grupo], ...categoriasExistentes])];

  async function enviar(values: ExpenseFormValues) {
    try {
      await onSubmit(toExpensePayload(values));
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error, "Não foi possível salvar o item. Tente novamente.") });
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isSubmitting}
      title={edicao ? "Editar item" : "Novo item de despesa"}
      description="O valor final é calculado por quantidade × valor unitário. Use quantidade 0 para guardar uma cotação fora do orçamento."
      className="max-w-2xl"
      footer={
        <>
          <Button type="button" disabled={isSubmitting} onClick={() => onOpenChange(false)} className={botaoSecundarioClassName}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting} className={botaoPrimarioClassName}>
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {edicao ? "Salvar alterações" : "Adicionar item"}
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
          <legend className="sr-only">Dados do item</legend>

          <div className="sm:col-span-2">
            <AuthField id="despesa-item" label="Item *" labelClassName={labelClassName} error={errors.description?.message}>
              <AuthInput
                {...fieldA11y("despesa-item", errors.description?.message)}
                aria-required="true"
                placeholder="Ex.: Seguranças"
                className={inputClassName}
                {...register("description")}
              />
            </AuthField>
          </div>

          <AuthField id="despesa-grupo" label="Grupo *" labelClassName={labelClassName} error={errors.group?.message}>
            <select {...fieldA11y("despesa-grupo", errors.group?.message)} className={selectClassName} {...register("group")}>
              {GRUPOS_DESPESA.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </AuthField>

          <AuthField id="despesa-categoria" label="Categoria *" labelClassName={labelClassName} error={errors.category?.message}>
            <AuthInput
              {...fieldA11y("despesa-categoria", errors.category?.message)}
              aria-required="true"
              list={categoriasId}
              placeholder="Ex.: Estrutura"
              className={inputClassName}
              {...register("category")}
            />
          </AuthField>
          <datalist id={categoriasId}>
            {sugestoes.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>

          <div className="sm:col-span-2">
            <AuthField
              id="despesa-fornecedor"
              label="Fornecedor"
              labelClassName={labelClassName}
              error={errors.supplierId?.message}
              description={
                <span className={hintClassName}>
                  Não achou?{" "}
                  <Link href="/conta/fornecedores" target="_blank" className="font-semibold underline">
                    Cadastre no catálogo de fornecedores
                  </Link>
                </span>
              }
            >
              <select {...fieldA11y("despesa-fornecedor", errors.supplierId?.message)} className={selectClassName} {...register("supplierId")}>
                <option value="">Sem fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.companyName}
                    {fornecedor.category ? ` · ${fornecedor.category}` : ""}
                  </option>
                ))}
              </select>
            </AuthField>
          </div>

          <AuthField id="despesa-quantidade" label="Quantidade *" labelClassName={labelClassName} error={errors.quantity?.message}>
            <AuthInput
              {...fieldA11y("despesa-quantidade", errors.quantity?.message)}
              inputMode="decimal"
              className={inputClassName}
              {...register("quantity")}
            />
          </AuthField>

          <AuthField
            id="despesa-valor"
            label="Valor unitário (R$) *"
            labelClassName={labelClassName}
            error={errors.unitPrice?.message}
            description={
              <span aria-live="polite" className={hintClassName}>
                Valor final: <strong>{valorFinal === null ? "—" : formatarMoeda(valorFinal)}</strong>
              </span>
            }
          >
            <AuthInput
              {...fieldA11y("despesa-valor", errors.unitPrice?.message)}
              inputMode="decimal"
              placeholder="0,00"
              className={inputClassName}
              {...register("unitPrice")}
            />
          </AuthField>

          <AuthField id="despesa-responsavel" label="Responsável" labelClassName={labelClassName} error={errors.responsible?.message}>
            <AuthInput
              {...fieldA11y("despesa-responsavel", errors.responsible?.message)}
              placeholder="Quem cuida deste item"
              className={inputClassName}
              {...register("responsible")}
            />
          </AuthField>

          <div className="flex items-end gap-6 pb-2.5">
            <Controller
              control={control}
              name="quoted"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                  Cotado
                </label>
              )}
            />
            <Controller
              control={control}
              name="paymentStatus"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={field.value === "pago"}
                    onCheckedChange={(checked) => field.onChange(checked === true ? "pago" : "pendente")}
                  />
                  Pago
                </label>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <AuthField id="despesa-obs" label="Observação" labelClassName={labelClassName} error={errors.notes?.message}>
              <Textarea
                {...fieldA11y("despesa-obs", errors.notes?.message)}
                rows={2}
                placeholder="Ex.: 66 fardos / 374 L"
                className="rounded-lg"
                {...register("notes")}
              />
            </AuthField>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

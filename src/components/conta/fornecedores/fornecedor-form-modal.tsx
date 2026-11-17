"use client";

import { useEffect, useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CircleAlert, Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import {
  emptySupplierForm,
  SUPPLIER_CATEGORY_MAX_LENGTH,
  SUPPLIER_COMPANY_NAME_MAX_LENGTH,
  supplierSchema,
  toSupplierPayload,
  type SupplierFormInputs,
  type SupplierFormValues,
} from "@/lib/validations/supplier.schema";
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";
import { CATEGORIAS_SUGERIDAS } from "./fornecedores.data";

/** Resultado do envio: `duplicado` mostra o alerta do erro 409 no topo do modal. */
export type ResultadoEnvio = "ok" | "duplicado" | "erro";

interface FornecedorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Com fornecedor, o modal é de edição; sem, de cadastro. */
  fornecedor: Fornecedor | null;
  /** Categorias já cadastradas, somadas às sugestões do campo. */
  categorias: readonly string[];
  onSubmit: (payload: FornecedorPayload) => Promise<ResultadoEnvio>;
}

function toFormValues(fornecedor: Fornecedor | null): SupplierFormInputs {
  if (!fornecedor) return emptySupplierForm;
  return {
    companyName: fornecedor.companyName,
    cnpjCpf: formatCpfCnpj(fornecedor.cnpjCpf),
    phone: fornecedor.phone ? formatPhone(fornecedor.phone) : "",
    email: fornecedor.email ?? "",
    category: fornecedor.category ?? "",
  };
}

const labelClassName = "text-xs font-semibold";
const inputClassName = "h-10 rounded-lg";
const hintClassName = "text-[11px] text-hubee-neutral-300 dark:text-hubee-200";

/** Modal com o formulário de cadastro e edição de fornecedor. */
export function FornecedorFormModal({ open, onOpenChange, fornecedor, categorias, onSubmit }: FornecedorFormModalProps) {
  const formId = useId();
  const datalistId = useId();
  const [duplicado, setDuplicado] = useState(false);
  const edicao = fornecedor !== null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormInputs, unknown, SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: toFormValues(fornecedor),
  });

  // Cada abertura começa com os dados do fornecedor escolhido (ou em branco) e sem o alerta de duplicado.
  useEffect(() => {
    if (!open) return;
    reset(toFormValues(fornecedor));
  }, [open, fornecedor, reset]);

  const [companyName, cnpjCpf] = useWatch({ control, name: ["companyName", "cnpjCpf"] });
  const obrigatoriosPreenchidos = companyName.trim() !== "" && cnpjCpf.trim() !== "";
  const sugestoes = [...new Set([...CATEGORIAS_SUGERIDAS, ...categorias])];

  const handleOpenChange = (next: boolean) => {
    if (!next) setDuplicado(false);
    onOpenChange(next);
  };

  async function enviar(values: SupplierFormValues) {
    setDuplicado(false);
    const resultado = await onSubmit(toSupplierPayload(values));
    if (resultado === "duplicado") setDuplicado(true);
  }

  const companyNameError = errors.companyName?.message;
  const cnpjCpfError = errors.cnpjCpf?.message;
  const phoneError = errors.phone?.message;
  const emailError = errors.email?.message;
  const categoryError = errors.category?.message;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      dismissible={!isSubmitting}
      title={edicao ? "Editar fornecedor" : "Novo fornecedor"}
      className="max-w-xl"
      footer={
        <>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            className="h-10 cursor-pointer rounded-lg bg-hubee-100 px-5 font-semibold text-hubee-800 hover:bg-hubee-200 focus-visible:ring-hubee-800 dark:bg-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-900 dark:focus-visible:ring-hubee-400"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || !obrigatoriosPreenchidos}
            aria-busy={isSubmitting}
            className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-5 font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:focus-visible:ring-hubee-50"
          >
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Salvando..." : edicao ? "Salvar alterações" : "Cadastrar fornecedor"}
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
        {duplicado && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-600/60 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-400/60 dark:bg-red-950/50 dark:text-red-300"
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            Já existe um fornecedor com este CNPJ/CPF ou E-mail.
          </p>
        )}

        <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-4">
          <legend className="sr-only">Dados do fornecedor</legend>

          <AuthField
            id="fornecedor-nome"
            label="Razão Social / Nome *"
            labelClassName={labelClassName}
            error={companyNameError}
            description={
              <span aria-live="polite">
                {companyName.length} / {SUPPLIER_COMPANY_NAME_MAX_LENGTH}
              </span>
            }
          >
            <AuthInput
              {...fieldA11y("fornecedor-nome", companyNameError)}
              aria-required="true"
              autoComplete="organization"
              placeholder="Ex.: Buffet Sabor & Arte Ltda."
              maxLength={SUPPLIER_COMPANY_NAME_MAX_LENGTH}
              className={inputClassName}
              {...register("companyName")}
            />
          </AuthField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              id="fornecedor-documento"
              label="CNPJ/CPF *"
              labelClassName={labelClassName}
              error={cnpjCpfError}
              description={
                <span className={hintClassName}>Somente números. CPF (11 dígitos) ou CNPJ (14 dígitos).</span>
              }
            >
              {/* Controller: a máscara reescreve o valor a cada tecla. Letras ficam no campo para a validação avisar. */}
              <Controller
                control={control}
                name="cnpjCpf"
                render={({ field }) => (
                  <AuthInput
                    {...fieldA11y("fornecedor-documento", cnpjCpfError)}
                    aria-required="true"
                    inputMode="numeric"
                    placeholder="00.000.000/0000-00"
                    className={inputClassName}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(/[^\d\s./-]/.test(value) ? value : formatCpfCnpj(value));
                    }}
                  />
                )}
              />
            </AuthField>

            <AuthField
              id="fornecedor-categoria"
              label="Categoria"
              labelClassName={labelClassName}
              error={categoryError}
              description={
                <span className={hintClassName}>Máximo de {SUPPLIER_CATEGORY_MAX_LENGTH} caracteres</span>
              }
            >
              <AuthInput
                {...fieldA11y("fornecedor-categoria", categoryError)}
                list={datalistId}
                placeholder="Selecione ou digite"
                maxLength={SUPPLIER_CATEGORY_MAX_LENGTH}
                className={inputClassName}
                {...register("category")}
              />
              <datalist id={datalistId}>
                {sugestoes.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </AuthField>

            <AuthField id="fornecedor-telefone" label="Telefone" labelClassName={labelClassName} error={phoneError}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <AuthInput
                    {...fieldA11y("fornecedor-telefone", phoneError)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    className={inputClassName}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(formatPhone(event.target.value))}
                  />
                )}
              />
            </AuthField>

            <AuthField id="fornecedor-email" label="E-mail" labelClassName={labelClassName} error={emailError}>
              <AuthInput
                {...fieldA11y("fornecedor-email", emailError)}
                type="email"
                autoComplete="email"
                placeholder="contato@empresa.com.br"
                className={inputClassName}
                {...register("email")}
              />
            </AuthField>
          </div>
        </fieldset>

        <p className={hintClassName}>* Campos obrigatórios</p>
      </form>
    </Modal>
  );
}

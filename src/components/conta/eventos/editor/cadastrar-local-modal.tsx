"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { formatCep } from "@/lib/masks";
import {
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_COMPLEMENT_MAX_LENGTH,
  ADDRESS_NEIGHBORHOOD_MAX_LENGTH,
  ADDRESS_NUMBER_MAX_LENGTH,
  ADDRESS_STREET_MAX_LENGTH,
  emptyVenueForm,
  toVenuePayload,
  UFS,
  VENUE_NAME_MAX_LENGTH,
  venueSchema,
  type VenueFormInputs,
  type VenueFormValues,
} from "@/lib/validations/venue.schema";
import type { LocalPayload } from "@/types/evento-editor";
import {
  botaoPrimarioClassName,
  botaoSecundarioClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "./estilos";

interface CadastrarLocalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: LocalPayload) => Promise<boolean>;
}

export function CadastrarLocalModal({ open, onOpenChange, onSubmit }: CadastrarLocalModalProps) {
  const formId = useId();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VenueFormInputs, unknown, VenueFormValues>({
    resolver: zodResolver(venueSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: emptyVenueForm,
  });

  useEffect(() => {
    if (open) reset(emptyVenueForm);
  }, [open, reset]);

  async function enviar(values: VenueFormValues) {
    await onSubmit(toVenuePayload(values));
  }

  const erro = (campo: keyof VenueFormInputs) => errors[campo]?.message;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!isSubmitting}
      title="Cadastrar local"
      description="O local fica disponível para os próximos eventos."
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
          <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting} className={botaoPrimarioClassName}>
            {isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
            {isSubmitting ? "Cadastrando..." : "Cadastrar local"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        aria-busy={isSubmitting}
        onSubmit={(event) => {
          event.stopPropagation();
          void handleSubmit(enviar)(event);
        }}
      >
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-4 sm:grid-cols-6">
          <legend className="sr-only">Dados do local</legend>

          <div className="sm:col-span-4">
            <AuthField id="local-nome" label="Nome do local *" labelClassName={labelClassName} error={erro("name")}>
              <AuthInput
                {...fieldA11y("local-nome", erro("name"))}
                aria-required="true"
                placeholder="Ex.: Auditório Central"
                maxLength={VENUE_NAME_MAX_LENGTH}
                className={inputClassName}
                {...register("name")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-2">
            <AuthField
              id="local-capacidade"
              label="Capacidade *"
              labelClassName={labelClassName}
              error={erro("maxCapacity")}
              description={<span className={hintClassName}>Número máximo de pessoas.</span>}
            >
              <AuthInput
                {...fieldA11y("local-capacidade", erro("maxCapacity"))}
                aria-required="true"
                inputMode="numeric"
                placeholder="0"
                className={inputClassName}
                {...register("maxCapacity")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-2">
            <AuthField id="local-cep" label="CEP *" labelClassName={labelClassName} error={erro("zipCode")}>
              <Controller
                control={control}
                name="zipCode"
                render={({ field }) => (
                  <AuthInput
                    {...fieldA11y("local-cep", erro("zipCode"))}
                    aria-required="true"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    className={inputClassName}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(formatCep(event.target.value))}
                  />
                )}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-4">
            <AuthField id="local-logradouro" label="Logradouro *" labelClassName={labelClassName} error={erro("street")}>
              <AuthInput
                {...fieldA11y("local-logradouro", erro("street"))}
                aria-required="true"
                autoComplete="address-line1"
                placeholder="Rua, avenida…"
                maxLength={ADDRESS_STREET_MAX_LENGTH}
                className={inputClassName}
                {...register("street")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-2">
            <AuthField id="local-numero" label="Número *" labelClassName={labelClassName} error={erro("number")}>
              <AuthInput
                {...fieldA11y("local-numero", erro("number"))}
                aria-required="true"
                placeholder="Ex.: 1201 ou s/n"
                maxLength={ADDRESS_NUMBER_MAX_LENGTH}
                className={inputClassName}
                {...register("number")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-4">
            <AuthField id="local-complemento" label="Complemento" labelClassName={labelClassName} error={erro("complement")}>
              <AuthInput
                {...fieldA11y("local-complemento", erro("complement"))}
                autoComplete="address-line2"
                placeholder="Ex.: Bloco B"
                maxLength={ADDRESS_COMPLEMENT_MAX_LENGTH}
                className={inputClassName}
                {...register("complement")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-3">
            <AuthField id="local-bairro" label="Bairro *" labelClassName={labelClassName} error={erro("neighborhood")}>
              <AuthInput
                {...fieldA11y("local-bairro", erro("neighborhood"))}
                aria-required="true"
                maxLength={ADDRESS_NEIGHBORHOOD_MAX_LENGTH}
                className={inputClassName}
                {...register("neighborhood")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-2">
            <AuthField id="local-cidade" label="Cidade *" labelClassName={labelClassName} error={erro("city")}>
              <AuthInput
                {...fieldA11y("local-cidade", erro("city"))}
                aria-required="true"
                autoComplete="address-level2"
                maxLength={ADDRESS_CITY_MAX_LENGTH}
                className={inputClassName}
                {...register("city")}
              />
            </AuthField>
          </div>

          <div className="sm:col-span-1">
            <AuthField id="local-uf" label="UF *" labelClassName={labelClassName} error={erro("state")}>
              <select
                {...fieldA11y("local-uf", erro("state"))}
                aria-required="true"
                autoComplete="address-level1"
                className={selectClassName}
                {...register("state")}
              >
                <option value="">--</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </AuthField>
          </div>
        </fieldset>
        <p className={`mt-4 ${hintClassName}`}>* Campos obrigatórios</p>
      </form>
    </Modal>
  );
}

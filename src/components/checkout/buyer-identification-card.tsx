"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { ContaCard } from "@/components/conta/conta-card";
import { fieldInputClassName, fieldLabelClassName } from "@/components/conta/perfil/perfil-styles";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  formatCpf,
  formatPhone,
  type CheckoutFormInputs,
} from "@/lib/validations/checkout.schema";

interface BuyerIdentificationCardProps {
  control: Control<CheckoutFormInputs>;
  register: UseFormRegister<CheckoutFormInputs>;
  errors: FieldErrors<CheckoutFormInputs>;
  useAccountData: boolean;
  onToggleAccountData: (checked: boolean) => void;
  disabled?: boolean;
}

/** Card "1. Identificação do Comprador" do fluxo de Checkout (GOL-180). */
export function BuyerIdentificationCard({
  control,
  register,
  errors,
  useAccountData,
  onToggleAccountData,
  disabled = false,
}: BuyerIdentificationCardProps) {
  return (
    <ContaCard
      title="1. Identificação do Comprador"
      description="Os ingressos digitais e o comprovante serão enviados para o e-mail informado."
    >
      <fieldset disabled={disabled} className="flex flex-col gap-4">
        <legend className="sr-only">Dados de identificação do comprador</legend>

        <div className="flex items-center gap-2.5">
          <Checkbox
            id="checkout-usar-conta"
            checked={useAccountData}
            onCheckedChange={(checked) => onToggleAccountData(checked === true)}
            className="border-hubee-300 data-checked:border-hubee-800 data-checked:bg-hubee-800 data-checked:text-hubee-50 dark:border-hubee-700 dark:data-checked:border-hubee-400 dark:data-checked:bg-hubee-400 dark:data-checked:text-hubee-800"
          />
          <Label
            htmlFor="checkout-usar-conta"
            className="cursor-pointer text-xs font-medium text-hubee-750 dark:text-hubee-200"
          >
            Usar os dados cadastrados na minha conta
          </Label>
        </div>

        <AuthField
          id="checkout-nome"
          label="Nome Completo"
          labelClassName={fieldLabelClassName}
          error={errors.fullName?.message}
        >
          <AuthInput
            {...fieldA11y("checkout-nome", errors.fullName?.message)}
            autoComplete="name"
            placeholder="Digite seu nome completo"
            className={fieldInputClassName}
            {...register("fullName")}
          />
        </AuthField>

        <AuthField
          id="checkout-email"
          label="E-mail"
          labelClassName={fieldLabelClassName}
          error={errors.email?.message}
        >
          <AuthInput
            {...fieldA11y("checkout-email", errors.email?.message)}
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={fieldInputClassName}
            {...register("email")}
          />
        </AuthField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthField
            id="checkout-cpf"
            label="CPF"
            labelClassName={fieldLabelClassName}
            error={errors.cpf?.message}
          >
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <AuthInput
                  {...fieldA11y("checkout-cpf", errors.cpf?.message)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  className={fieldInputClassName}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(formatCpf(event.target.value))}
                />
              )}
            />
          </AuthField>

          <AuthField
            id="checkout-telefone"
            label="Telefone / WhatsApp"
            labelClassName={fieldLabelClassName}
            error={errors.phone?.message}
          >
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <AuthInput
                  {...fieldA11y("checkout-telefone", errors.phone?.message)}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  className={fieldInputClassName}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(formatPhone(event.target.value))}
                />
              )}
            />
          </AuthField>
        </div>
      </fieldset>
    </ContaCard>
  );
}


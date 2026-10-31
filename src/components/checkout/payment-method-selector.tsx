"use client";

import { useState } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  CreditCard,
  Lock,
  QrCode,
} from "lucide-react";
import { AuthField, AuthInput, fieldA11y } from "@/components/auth/auth-field";
import { ContaCard } from "@/components/conta/conta-card";
import { fieldInputClassName, fieldLabelClassName } from "@/components/conta/perfil/perfil-styles";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  formatCardCvv,
  formatCardExpiry,
  formatCardNumber,
  type CheckoutFormInputs,
  type PaymentMethod,
} from "@/lib/validations/checkout.schema";
import type { CheckoutOrderData } from "./checkout.data";

interface PaymentMethodSelectorProps {
  control: Control<CheckoutFormInputs>;
  errors: FieldErrors<CheckoutFormInputs>;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  pix: CheckoutOrderData["pix"];
  installments: CheckoutOrderData["installments"];
  transactionError?: string | null;
  disabled?: boolean;
}

/** Card "2. Forma de Pagamento" com abas PIX e Cartão de Crédito (GOL-180). */
export function PaymentMethodSelector({
  control,
  errors,
  paymentMethod,
  onPaymentMethodChange,
  pix,
  installments,
  transactionError,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyPixKey() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(pix.copyPasteKey);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <ContaCard title="2. Forma de Pagamento">
      <div className="flex flex-col gap-4">
        {transactionError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 rounded-lg border border-red-700/30 bg-red-700/10 p-3 text-xs leading-relaxed text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{transactionError}</span>
          </div>
        )}

        <Tabs
          value={paymentMethod}
          onValueChange={(value) => {
            if (value === "pix" || value === "card") {
              onPaymentMethodChange(value);
            }
          }}
        >
          <TabsList aria-label="Selecione o método de pagamento">
            <TabsTrigger value="pix" disabled={disabled}>
              <QrCode aria-hidden="true" className="size-3.5" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="card" disabled={disabled}>
              <CreditCard aria-hidden="true" className="size-3.5" />
              Cartão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix">
            <div className="flex flex-col gap-3">
              <p className="text-center text-xs font-semibold text-hubee-800 dark:text-hubee-50">
                PIX Aprovado na Hora. Escaneie o QR Code para pagar.
              </p>

              <div className="flex flex-col gap-4 rounded-xl border border-hubee-300 bg-hubee-100 p-4 text-hubee-750 sm:flex-row sm:items-center sm:p-5">
                <div
                  role="img"
                  aria-label="QR Code dinâmico para pagamento via PIX"
                  className="mx-auto flex aspect-square w-40 shrink-0 items-center justify-center rounded-xl border border-dashed border-hubee-600/60 bg-hubee-300 text-hubee-600 sm:mx-0 sm:w-36"
                >
                  <QrCode aria-hidden="true" className="size-16" strokeWidth={1.5} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800">
                    <Clock aria-hidden="true" className="size-3" />
                    {pix.expirationLabel}
                  </span>

                  <h3 className="text-sm font-bold text-hubee-800">
                    Escaneie o QR Code ou copie a chave PIX
                  </h3>

                  <p className="text-xs leading-relaxed text-hubee-750">
                    Abra o app do seu banco, escolha PIX Copia e Cola ou leitor de QR Code. A
                    confirmação é instantânea.
                  </p>

                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div
                      aria-label="Chave PIX Copia e Cola"
                      className="min-w-0 flex-1 rounded-lg border border-hubee-200 bg-white px-3 py-2 font-mono text-[11px] leading-snug break-all text-hubee-800 select-all"
                    >
                      {pix.displayKey}
                    </div>

                    <Button
                      type="button"
                      variant="hubee_800"
                      disabled={disabled}
                      onClick={handleCopyPixKey}
                      className="h-9 shrink-0 cursor-pointer px-3.5 text-xs font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check aria-hidden="true" className="size-3.5" />
                          Código copiado!
                        </>
                      ) : (
                        <>
                          <Copy aria-hidden="true" className="size-3.5" />
                          Copiar código
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="card">
            <fieldset disabled={disabled} className="flex flex-col gap-4">
              <legend className="sr-only">Dados do cartão de crédito</legend>

              <AuthField
                id="checkout-card-number"
                label="Número do Cartão"
                labelClassName={fieldLabelClassName}
                error={errors.cardNumber?.message}
              >
                <Controller
                  control={control}
                  name="cardNumber"
                  render={({ field }) => (
                    <div className="relative">
                      <AuthInput
                        {...fieldA11y("checkout-card-number", errors.cardNumber?.message)}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        className={cn(fieldInputClassName, "pr-10")}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(formatCardNumber(event.target.value))}
                      />
                      <CreditCard
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-hubee-neutral-300 dark:text-hubee-400"
                      />
                    </div>
                  )}
                />
              </AuthField>

              <AuthField
                id="checkout-card-holder"
                label="Nome impresso no cartão"
                labelClassName={fieldLabelClassName}
                error={errors.cardHolder?.message}
              >
                <Controller
                  control={control}
                  name="cardHolder"
                  render={({ field }) => (
                    <AuthInput
                      {...fieldA11y("checkout-card-holder", errors.cardHolder?.message)}
                      autoComplete="cc-name"
                      placeholder="COMO ESTÁ NO CARTÃO"
                      className={cn(fieldInputClassName, "uppercase placeholder:normal-case")}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  )}
                />
              </AuthField>

              <div className="grid grid-cols-2 gap-4">
                <AuthField
                  id="checkout-card-expiry"
                  label="Validade"
                  labelClassName={fieldLabelClassName}
                  error={errors.cardExpiry?.message}
                >
                  <Controller
                    control={control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <AuthInput
                        {...fieldA11y("checkout-card-expiry", errors.cardExpiry?.message)}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        className={fieldInputClassName}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(event) => field.onChange(formatCardExpiry(event.target.value))}
                      />
                    )}
                  />
                </AuthField>

                <AuthField
                  id="checkout-card-cvv"
                  label="CVV"
                  labelClassName={fieldLabelClassName}
                  error={errors.cardCvv?.message}
                >
                  <Controller
                    control={control}
                    name="cardCvv"
                    render={({ field }) => (
                      <div className="relative">
                        <AuthInput
                          {...fieldA11y("checkout-card-cvv", errors.cardCvv?.message)}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          className={cn(fieldInputClassName, "pr-9")}
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(formatCardCvv(event.target.value))}
                        />
                        <Lock
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-hubee-neutral-300 dark:text-hubee-400"
                        />
                      </div>
                    )}
                  />
                </AuthField>
              </div>

              <AuthField
                id="checkout-installments"
                label="Parcelamento"
                labelClassName={fieldLabelClassName}
                error={errors.installments?.message}
              >
                <Controller
                  control={control}
                  name="installments"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={disabled}
                    >
                      <SelectTrigger
                        id="checkout-installments"
                        aria-invalid={errors.installments ? true : undefined}
                        aria-describedby={
                          errors.installments ? "checkout-installments-error" : undefined
                        }
                        className="h-10 w-full border-hubee-neutral-50 bg-white text-xs text-hubee-800 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50"
                      >
                        <SelectValue placeholder="Selecione o parcelamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {installments.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </AuthField>
            </fieldset>
          </TabsContent>
        </Tabs>
      </div>
    </ContaCard>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  checkoutSchema,
  formatPhone,
  onlyDigits,
  type CheckoutFormInputs,
  type PaymentMethod,
} from "@/lib/validations/checkout.schema";
import { BuyerIdentificationCard } from "./buyer-identification-card";
import { CheckoutFeedbackModals } from "./checkout-feedback-modals";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutSkeleton } from "./checkout-skeleton";
import { CheckoutSuccessView } from "./checkout-success-view";
import {
  CHECKOUT_MOCK_ORDER,
  DEFAULT_CHECKOUT_BUYER,
  type CheckoutBuyerSummary,
  type CheckoutSimulationMode,
} from "./checkout.data";
import { PaymentMethodSelector } from "./payment-method-selector";

const TRANSACTION_ERROR_MESSAGE =
  "Não foi possível autorizar o pagamento no cartão final 4242. Verifique os dados informados ou escolha outra forma de pagamento.";

const SIMULATION_OPTIONS: ReadonlyArray<{
  mode: CheckoutSimulationMode;
  label: string;
}> = [
  { mode: "form", label: "Checkout" },
  { mode: "loading", label: "Skeleton" },
  { mode: "processing", label: "Processando" },
  { mode: "pix-timeout", label: "Timeout PIX" },
  { mode: "payment-error", label: "Falha no Cartão" },
  { mode: "success", label: "Tela de Sucesso" },
];

/** Conteúdo interativo da página de Checkout e Confirmação de Compra (GOL-180). */
export function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [simulationMode, setSimulationMode] = useState<CheckoutSimulationMode>("form");
  const [autoAdvanceOnProcessing, setAutoAdvanceOnProcessing] = useState(false);
  const [showInlineCardError, setShowInlineCardError] = useState(false);
  const [confirmedBuyer, setConfirmedBuyer] = useState<CheckoutBuyerSummary>({
    fullName: DEFAULT_CHECKOUT_BUYER.fullName,
    email: DEFAULT_CHECKOUT_BUYER.email,
    cpf: "123.456.789-00",
    paymentMethod: "card",
  });

  const accountFullName = user?.fullName?.trim() || DEFAULT_CHECKOUT_BUYER.fullName;
  const accountEmail = user?.email?.trim() || DEFAULT_CHECKOUT_BUYER.email;
  const accountPhone = user?.phone ? formatPhone(user.phone) : "";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<CheckoutFormInputs>({
    resolver: zodResolver(checkoutSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      useAccountData: true,
      fullName: accountFullName,
      email: accountEmail,
      cpf: "",
      phone: accountPhone,
      paymentMethod: "card",
      cardNumber: "",
      cardHolder: "",
      cardExpiry: "",
      cardCvv: "",
      installments: "1x",
      acceptTerms: false,
    },
  });

  const useAccountData = useWatch({ control, name: "useAccountData" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const acceptTerms = useWatch({ control, name: "acceptTerms" });
  const watchedFullName = useWatch({ control, name: "fullName" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedCpf = useWatch({ control, name: "cpf" });

  useEffect(() => {
    if (!user) return;
    if (useAccountData) {
      setValue("fullName", user.fullName || DEFAULT_CHECKOUT_BUYER.fullName);
      setValue("email", user.email || DEFAULT_CHECKOUT_BUYER.email);
      if (user.phone) {
        setValue("phone", formatPhone(user.phone));
      }
    }
  }, [user, useAccountData, setValue]);

  useEffect(() => {
    if (simulationMode !== "processing" || !autoAdvanceOnProcessing) return;

    const timer = window.setTimeout(() => {
      setAutoAdvanceOnProcessing(false);
      setSimulationMode("success");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [simulationMode, autoAdvanceOnProcessing]);

  function handleToggleAccountData(checked: boolean) {
    setValue("useAccountData", checked, { shouldValidate: false });
    if (checked) {
      setValue("fullName", accountFullName, { shouldValidate: true });
      setValue("email", accountEmail, { shouldValidate: true });
      if (accountPhone) {
        setValue("phone", accountPhone, { shouldValidate: true });
      }
    }
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setValue("paymentMethod", method, { shouldValidate: false });
    if (method === "pix") {
      clearErrors(["cardNumber", "cardHolder", "cardExpiry", "cardCvv", "installments"]);
      setShowInlineCardError(false);
    }
  }

  function handleToggleTerms(checked: boolean) {
    setValue("acceptTerms", checked, { shouldValidate: true });
  }

  function handleSelectSimulationMode(nextMode: CheckoutSimulationMode) {
    setAutoAdvanceOnProcessing(false);
    setSimulationMode(nextMode);

    if (nextMode === "payment-error") {
      setValue("paymentMethod", "card", { shouldValidate: false });
      setShowInlineCardError(true);
    } else if (nextMode === "pix-timeout") {
      setValue("paymentMethod", "pix", { shouldValidate: false });
      setShowInlineCardError(false);
    } else if (nextMode === "success") {
      setShowInlineCardError(false);
      setConfirmedBuyer({
        fullName: watchedFullName?.trim() || accountFullName,
        email: watchedEmail?.trim() || accountEmail,
        cpf: watchedCpf || "123.456.789-00",
        paymentMethod,
      });
    } else {
      setShowInlineCardError(false);
    }
  }

  function onSubmit(data: CheckoutFormInputs) {
    setShowInlineCardError(false);

    // Cartão terminado em 0000 permite simular erro de autorização diretamente pelo formulário.
    if (data.paymentMethod === "card" && onlyDigits(data.cardNumber).endsWith("0000")) {
      setAutoAdvanceOnProcessing(false);
      setShowInlineCardError(true);
      setSimulationMode("payment-error");
      return;
    }

    setConfirmedBuyer({
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      cpf: data.cpf,
      paymentMethod: data.paymentMethod,
    });
    setAutoAdvanceOnProcessing(true);
    setSimulationMode("processing");
  }

  const isProcessing = simulationMode === "processing";

  return (
    <div className="flex flex-col gap-8">
      {simulationMode === "loading" && <CheckoutSkeleton />}

      {simulationMode === "success" && (
        <CheckoutSuccessView order={CHECKOUT_MOCK_ORDER} buyer={confirmedBuyer} />
      )}

      {simulationMode !== "loading" && simulationMode !== "success" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/eventos"
                aria-label="Voltar para eventos"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-hubee-200 bg-hubee-100 text-hubee-800 outline-none hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:border-hubee-750 dark:bg-hubee-750/60 dark:text-hubee-50 dark:hover:bg-hubee-700 dark:focus-visible:ring-hubee-400"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </Link>
              <ContaPageTitle>Finalizar Compra</ContaPageTitle>
            </div>
            <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Revise os detalhes do seu pedido e escolha a forma de pagamento.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-busy={isProcessing}
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
          >
            <div className="flex flex-col gap-6">
              <BuyerIdentificationCard
                control={control}
                register={register}
                errors={errors}
                useAccountData={useAccountData}
                onToggleAccountData={handleToggleAccountData}
                disabled={isProcessing}
              />

              <PaymentMethodSelector
                control={control}
                errors={errors}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                pix={CHECKOUT_MOCK_ORDER.pix}
                installments={CHECKOUT_MOCK_ORDER.installments}
                transactionError={showInlineCardError ? TRANSACTION_ERROR_MESSAGE : null}
                disabled={isProcessing}
              />
            </div>

            <CheckoutOrderSummary
              order={CHECKOUT_MOCK_ORDER}
              acceptTerms={acceptTerms}
              onToggleTerms={handleToggleTerms}
              termsError={errors.acceptTerms?.message}
              isProcessing={isProcessing}
            />
          </form>
        </div>
      )}

      <CheckoutFeedbackModals
        mode={simulationMode}
        onCloseModal={() => {
          setAutoAdvanceOnProcessing(false);
          setSimulationMode("form");
        }}
        onRegeneratePix={() => {
          setAutoAdvanceOnProcessing(false);
          setValue("paymentMethod", "pix", { shouldValidate: false });
          setSimulationMode("form");
        }}
        onSwitchToPix={() => {
          setAutoAdvanceOnProcessing(false);
          handlePaymentMethodChange("pix");
          setSimulationMode("form");
        }}
        onRetryCard={() => {
          setAutoAdvanceOnProcessing(false);
          setValue("paymentMethod", "card", { shouldValidate: false });
          setSimulationMode("form");
        }}
        onBackToEvents={() => router.push("/eventos")}
      />

      <section
        aria-label="Simulador de estados do checkout"
        className="rounded-xl border border-dashed border-hubee-300 bg-hubee-100/70 p-3 text-xs text-hubee-750 dark:border-hubee-750 dark:bg-hubee-900/50 dark:text-hubee-200"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-hubee-800 dark:text-hubee-50">
            <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            Estados do Protótipo (GOL-180):
          </span>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Alternar estado visual">
            {SIMULATION_OPTIONS.map((option) => {
              const active = simulationMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectSimulationMode(option.mode)}
                  className={cn(
                    "cursor-pointer rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hubee-500",
                    active
                      ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                      : "border-hubee-200 bg-white text-hubee-750 hover:bg-hubee-100 dark:border-hubee-750 dark:bg-hubee-800 dark:text-hubee-200 dark:hover:bg-hubee-750",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

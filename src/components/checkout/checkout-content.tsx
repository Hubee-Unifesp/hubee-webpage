"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  CompraError,
  cancelOrder,
  createOrder,
  getTicketsDoPedido,
  processPayment,
  type PedidoCriado,
} from "@/lib/api/orders";
import { paraItensDoPedido } from "@/lib/carrinho";
import {
  checkoutSchema,
  formatPhone,
  type CheckoutFormInputs,
  type PaymentMethod,
} from "@/lib/validations/checkout.schema";
import { BuyerIdentificationCard } from "./buyer-identification-card";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutPixPaymentView } from "./checkout-pix-payment-view";
import { CheckoutSkeleton } from "./checkout-skeleton";
import { CheckoutSuccessView } from "./checkout-success-view";
import {
  PIX_EXPIRATION_SECONDS,
  gerarPixSimulado,
  numeroDoPedido,
  toApiPaymentMethod,
  toCheckoutOrder,
  toIngressosDaCompra,
  type CheckoutBuyerSummary,
  type CompraConcluida,
  type PedidoAguardandoPix,
} from "./checkout.data";
import { PaymentMethodSelector } from "./payment-method-selector";

/**
 * Checkout ligado à API. `POST /orders` cria o pedido com os lotes do carrinho (e confere o
 * estoque), e `POST /payments` paga, marca como pago e emite os ingressos numa transaction.
 *
 * No cartão as duas chamadas acontecem em sequência. No PIX o pedido é criado e a pessoa vê
 * a cobrança (simulada) antes de pagar; o pagamento só sai em "Já realizei o pagamento".
 * Pedido pendente reserva o estoque na API, então voltar ou deixar o prazo vencer cancela o
 * pedido para devolver os ingressos.
 */
export function CheckoutContent() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { itens, carregado, limpar } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [compra, setCompra] = useState<CompraConcluida | null>(null);
  const [buyer, setBuyer] = useState<CheckoutBuyerSummary | null>(null);
  const [pixPendente, setPixPendente] = useState<PedidoAguardandoPix | null>(null);
  const [pixSecondsRemaining, setPixSecondsRemaining] = useState(PIX_EXPIRATION_SECONDS);

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
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      cpf: "",
      phone: accountPhone,
      paymentMethod: "pix",
      cardNumber: "",
      cardHolder: "",
      cardExpiry: "",
      cardCvv: "",
      acceptTerms: false,
    },
  });

  const useAccountData = useWatch({ control, name: "useAccountData" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const acceptTerms = useWatch({ control, name: "acceptTerms" });

  useEffect(() => {
    if (!user || !useAccountData) return;
    setValue("fullName", user.fullName ?? "");
    setValue("email", user.email ?? "");
    if (user.phone) setValue("phone", formatPhone(user.phone));
  }, [user, useAccountData, setValue]);

  // Carrinho vazio e compra não concluída: não há o que pagar.
  useEffect(() => {
    if (carregado && itens.length === 0 && !compra) router.replace("/carrinho");
  }, [carregado, itens.length, compra, router]);

  // Contagem regressiva da cobrança PIX. Para em zero; o cancelamento fica no efeito abaixo.
  const pixPedidoId = pixPendente?.pedidoId ?? null;
  useEffect(() => {
    if (!pixPedidoId) return;
    const interval = window.setInterval(() => {
      setPixSecondsRemaining((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [pixPedidoId]);

  // Prazo vencido: cancela o pedido para liberar o estoque. Falha aqui não bloqueia a tela,
  // a pessoa ainda pode gerar um novo PIX.
  const pixExpirado = pixPedidoId !== null && pixSecondsRemaining === 0;
  useEffect(() => {
    if (!pixExpirado || !pixPedidoId) return;
    cancelOrder(pixPedidoId).catch(() => undefined);
  }, [pixExpirado, pixPedidoId]);

  function handleToggleAccountData(checked: boolean) {
    setValue("useAccountData", checked, { shouldValidate: false });
    if (!checked || !user) return;
    setValue("fullName", user.fullName ?? "", { shouldValidate: true });
    setValue("email", user.email ?? "", { shouldValidate: true });
    if (accountPhone) setValue("phone", accountPhone, { shouldValidate: true });
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setValue("paymentMethod", method, { shouldValidate: false });
    if (method === "pix") {
      clearErrors(["cardNumber", "cardHolder", "cardExpiry", "cardCvv"]);
    }
  }

  function handleToggleTerms(checked: boolean) {
    setValue("acceptTerms", checked, { shouldValidate: true });
  }

  function abrirCobrancaPix(pedido: PedidoCriado) {
    setPixPendente({
      pedidoId: pedido.id,
      numero: numeroDoPedido(pedido.id),
      total: pedido.total,
      pixCopiaECola: gerarPixSimulado(pedido.id, pedido.total),
    });
    setPixSecondsRemaining(PIX_EXPIRATION_SECONDS);
  }

  async function onSubmit(data: CheckoutFormInputs) {
    setBuyer({
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      cpf: data.cpf,
      paymentMethod: data.paymentMethod,
    });
    setIsProcessing(true);

    try {
      const pedido = await createOrder(paraItensDoPedido(itens));

      if (data.paymentMethod === "pix") {
        abrirCobrancaPix(pedido);
        return;
      }

      await pagarEConcluir(pedido.id, pedido.total, data.paymentMethod);
    } catch (error) {
      tratarFalha(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmPixPayment() {
    if (!pixPendente) return;
    setIsProcessing(true);
    try {
      await pagarEConcluir(pixPendente.pedidoId, pixPendente.total, "pix");
      setPixPendente(null);
    } catch (error) {
      tratarFalha(error);
    } finally {
      setIsProcessing(false);
    }
  }

  /** Volta ao formulário cancelando o pedido pendente, para não segurar o estoque. */
  async function handleBackFromPix() {
    if (!pixPendente) return;
    const { pedidoId } = pixPendente;
    setIsProcessing(true);
    try {
      // Depois de expirado o pedido já foi cancelado pelo efeito do prazo.
      if (!pixExpirado) await cancelOrder(pedidoId);
    } catch {
      // Se o cancelamento falhar, o pedido fica pendente; a volta não deve ficar presa nisso.
    } finally {
      setPixPendente(null);
      setIsProcessing(false);
    }
  }

  /** Prazo vencido: o pedido anterior já foi cancelado, então cria outro com o mesmo carrinho. */
  async function handleRegeneratePix() {
    setIsProcessing(true);
    try {
      const pedido = await createOrder(paraItensDoPedido(itens));
      abrirCobrancaPix(pedido);
    } catch (error) {
      setPixPendente(null);
      tratarFalha(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function pagarEConcluir(pedidoId: string, total: number, metodo: PaymentMethod) {
    const order = toCheckoutOrder(itens);
    const pagamento = await processPayment(pedidoId, toApiPaymentMethod(metodo));

    // O pagamento já emitiu os ingressos; se a leitura falhar, a compra valeu do mesmo jeito
    // e a tela de sucesso remete a "Meus Ingressos" em vez de mostrar a lista.
    const ingressos = await getTicketsDoPedido(pedidoId).catch(() => []);

    setCompra({
      pedidoId,
      numero: numeroDoPedido(pedidoId),
      total,
      pagoEm: pagamento.pagoEm,
      items: order.items,
      ingressos: toIngressosDaCompra(ingressos, order.items),
    });
    limpar();
    toast.success("Compra confirmada! Seus ingressos já estão disponíveis.");
  }

  function tratarFalha(error: unknown) {
    if (!(error instanceof CompraError)) {
      toast.error("Não foi possível concluir a compra. Tente novamente.");
      return;
    }

    toast.error(error.message);

    if (error.tipo === "perfil-incompleto") {
      router.push("/conta/completar-perfil");
      return;
    }

    // O lote mudou de saldo ou o pedido não vale mais: revisar o carrinho é o próximo passo.
    if (error.tipo === "esgotado" || error.tipo === "vendas-fechadas") {
      router.push("/carrinho");
    }
  }

  if (compra && buyer) {
    return <CheckoutSuccessView compra={compra} buyer={buyer} />;
  }

  if (pixPendente && buyer) {
    return (
      <CheckoutPixPaymentView
        pedido={pixPendente}
        buyer={buyer}
        secondsRemaining={pixSecondsRemaining}
        isProcessing={isProcessing}
        onConfirmPixPayment={handleConfirmPixPayment}
        onBackToForm={handleBackFromPix}
        onRegeneratePix={handleRegeneratePix}
      />
    );
  }

  if (!carregado || itens.length === 0) {
    return <CheckoutSkeleton />;
  }

  const order = toCheckoutOrder(itens);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/carrinho"
            aria-label="Voltar para o carrinho"
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
            disabled={isProcessing}
          />
        </div>

        <CheckoutOrderSummary
          order={order}
          acceptTerms={acceptTerms}
          onToggleTerms={handleToggleTerms}
          termsError={errors.acceptTerms?.message}
          isProcessing={isProcessing}
        />
      </form>
    </div>
  );
}

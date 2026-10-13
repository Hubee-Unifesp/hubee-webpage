"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import type { RegisterFormInputs } from "@/lib/validations/auth.schema";
import { RegisterForm } from "./register-form";
import { register } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

export function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginState } = useAuth();

  function clearMessages() {
    setError(null);
    setEmailError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(data: RegisterFormInputs) {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await register(data);

      loginState(response.user);
      setSuccessMessage("Cadastro efetuado com sucesso. Redirecionando...");

      if (data.signupIntent === "ORGANIZE") {
        router.push("/organizacoes/em-breve");
      } else {
        const redirectUrl = searchParams.get("redirect");
        if (redirectUrl && redirectUrl.startsWith("/")) {
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          setEmailError("Este e-mail já está cadastrado.");
        } else {
          setError(err.response?.data?.message || "Não foi possível criar sua conta. Tente novamente.");
        }
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      onEdit={clearMessages}
      isLoading={isLoading}
      error={error}
      emailError={emailError}
      successMessage={successMessage}
    />
  );
}
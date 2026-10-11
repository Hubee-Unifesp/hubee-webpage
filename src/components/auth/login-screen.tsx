"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import type { LoginFormInputs } from "@/lib/validations/auth.schema";
import { LoginForm } from "./login-form";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { loginState } = useAuth();

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(data: LoginFormInputs) {
    setIsLoading(true);
    clearMessages();

    try {
      const response = await login(data);
      
      loginState(response.user);
      setSuccessMessage("Login efetuado com sucesso. Redirecionando...");

      setTimeout(() => {
        const redirectUrl = searchParams.get("redirect");
        
        if (redirectUrl && redirectUrl.startsWith("/")) {
          window.location.href = redirectUrl;
        } else {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/";
        }
      }, 1500);

    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LoginForm
      onSubmit={handleSubmit}
      onEdit={clearMessages}
      isLoading={isLoading}
      error={error}
      successMessage={successMessage}
    />
  );
}
"use client";

import { useState } from "react";
import type { LoginFormInputs } from "@/lib/validations/auth.schema";
import { LoginForm } from "./login-form";

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  // TODO(auth-api): substituir a simulação pela chamada de login.
  async function handleSubmit({ email }: LoginFormInputs) {
    setIsLoading(true);
    clearMessages();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email.toLowerCase() === "erro@teste.com") {
      setError("E-mail ou senha inválidos.");
    } else {
      setSuccessMessage("Login simulado com sucesso.");
    }

    setIsLoading(false);
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

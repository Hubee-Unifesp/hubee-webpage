"use client";

import { useState } from "react";
import type { RegisterFormInputs } from "@/lib/validations/auth.schema";
import { RegisterForm } from "./register-form";

export function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  // TODO(auth-api): substituir a simulação pela chamada de cadastro.
  async function handleSubmit({ email }: RegisterFormInputs) {
    setIsLoading(true);
    clearMessages();
    setEmailError(null);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalized = email.toLowerCase();
    if (normalized === "existe@teste.com") {
      setEmailError("Este e-mail já está cadastrado.");
    } else if (normalized === "erro@teste.com") {
      setError("Não foi possível criar sua conta. Tente novamente.");
    } else {
      setSuccessMessage("Cadastro simulado com sucesso.");
    }

    setIsLoading(false);
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

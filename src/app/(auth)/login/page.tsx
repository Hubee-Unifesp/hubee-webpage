"use client";

import { useState } from "react";
import { AuthForms } from "@/components/auth/auth-forms";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(data: { email: string; password: string }) {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (data.email === "erro@teste.com") {
            setError("E-mail ou senha inválidos");
        } else {
            setSuccessMessage("Login simulado");
        }

        setIsLoading(false);
    }

    return (
        <AuthForms
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            successMessage={successMessage}
        />
    );
}
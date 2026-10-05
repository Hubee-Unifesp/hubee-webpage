"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Ticket, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";
import {
  PASSWORD_MIN_LENGTH,
  REGISTER_FIELD_ORDER,
  validateRegister,
  type RegisterErrors,
  type RegisterField,
  type RegisterValues,
} from "@/lib/validation/register";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterFormProps {
  perfil: "comprador" | "organizador";
  onPerfilChange: (perfil: "comprador" | "organizador") => void;
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  isLoading?: boolean;
  errors?: { email?: string; form?: string };
}

const emptyValues: RegisterValues = { name: "", email: "", password: "", confirmPassword: "" };

export function RegisterForm({ 
  perfil, 
  onPerfilChange, 
  onSubmit, 
  isLoading = false, 
  errors: externalErrors 
}: RegisterFormProps) {
  const baseId = useId();
  const [values, setValues] = useState<RegisterValues>(emptyValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const refs = useRef<Partial<Record<RegisterField, HTMLInputElement | null>>>({});

  const idOf = (field: RegisterField) => `${baseId}-${field}`;
  const errorIdOf = (field: RegisterField) => `${baseId}-${field}-error`;
  
  const setFieldRef = useCallback(
    (field: RegisterField) => (element: HTMLInputElement | null) => {
      refs.current[field] = element;
    },
    [],
  );

  const messageFor = (field: RegisterField) => {
    if (field === "email") {
      return errors.email ?? (values.email.trim() ? undefined : externalErrors?.email);
    }
    return errors[field];
  };

  const handleChange = (field: RegisterField) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValues = { ...values, [field]: event.target.value };
    setValues(nextValues);

    const fresh = validateRegister(nextValues);
    setErrors((current) => {
      const next: RegisterErrors = {};
      for (const key of Object.keys(current) as RegisterField[]) {
        if (fresh[key]) next[key] = fresh[key];
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const found = validateRegister(values);
    setErrors(found);

    const firstInvalid = REGISTER_FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus();
      return;
    }

    void onSubmit({ 
      name: values.name.trim(), 
      email: values.email.trim(), 
      password: values.password 
    });
  };

  const fieldProps = (field: RegisterField) => ({
    id: idOf(field),
    name: field,
    value: values[field],
    onChange: handleChange(field),
    disabled: isLoading,
    "aria-invalid": messageFor(field) ? true : undefined,
    "aria-describedby": messageFor(field) ? errorIdOf(field) : undefined,
    ref: setFieldRef(field),
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {externalErrors?.form && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {externalErrors.form}
        </div>
      )}

      {/* Seleção de Perfil */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          Qual é o seu objetivo?
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onPerfilChange("comprador")}
            className={cn(
              "flex flex-col items-start p-4 border rounded-xl transition-all",
              perfil === "comprador"
                ? "border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500"
                : "border-input hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Ticket 
              className={cn("h-5 w-5 mb-2", perfil === "comprador" ? "text-yellow-500" : "text-muted-foreground")} 
            />
            <span className="font-semibold text-sm">Quero comprar ingressos</span>
          </button>

          <button
            type="button"
            onClick={() => onPerfilChange("organizador")}
            className={cn(
              "flex flex-col items-start p-4 border rounded-xl transition-all",
              perfil === "organizador"
                ? "border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500"
                : "border-input hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Calendar 
              className={cn("h-5 w-5 mb-2", perfil === "organizador" ? "text-yellow-500" : "text-muted-foreground")} 
            />
            <span className="font-semibold text-sm">Quero organizar eventos</span>
          </button>
        </div>
      </div>

      {/* Campos do Formulário */}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={idOf("name")}>Nome completo</FieldLabel>
          <Input {...fieldProps("name")} type="text" autoComplete="name" placeholder="Digite seu nome completo" />
          <FieldError id={errorIdOf("name")}>{messageFor("name")}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor={idOf("email")}>E-mail</FieldLabel>
          <Input {...fieldProps("email")} type="email" autoComplete="email" placeholder="exemplo@email.com" />
          <FieldError id={errorIdOf("email")}>{messageFor("email")}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor={idOf("password")}>Senha</FieldLabel>
          <PasswordInput {...fieldProps("password")} autoComplete="new-password" placeholder="••••••••" />
          <FieldDescription>Mínimo de {PASSWORD_MIN_LENGTH} caracteres.</FieldDescription>
          <FieldError id={errorIdOf("password")}>{messageFor("password")}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor={idOf("confirmPassword")}>Confirmação de senha</FieldLabel>
          <PasswordInput {...fieldProps("confirmPassword")} autoComplete="new-password" placeholder="••••••••" />
          <FieldError id={errorIdOf("confirmPassword")}>{messageFor("confirmPassword")}</FieldError>
        </Field>
      </FieldGroup>

      <Button 
        type="submit" 
        size="lg" 
        disabled={isLoading} 
        aria-busy={isLoading} 
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-2"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium underline underline-offset-4 text-foreground hover:text-yellow-500 transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </form>
  );
}
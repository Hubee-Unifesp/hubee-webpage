"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authFormSchema = z.object({
    email: z
        .string()
        .min(1, { error: "Informe seu e-mail." })
        .pipe(z.email({ error: "Digite um e-mail válido." })),
    password: z.string().min(1, { error: "Informe sua senha." }),
});

type AuthFormData = z.infer<typeof authFormSchema>;

type AuthFormsProps = {
    onSubmit: (data: AuthFormData) => void | Promise<void>;
    isLoading: boolean;
    error: string | null;
    successMessage?: string | null;
};



export function AuthForms({ onSubmit, isLoading, error, successMessage }: AuthFormsProps) {
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormData>({
        resolver: zodResolver(authFormSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
        defaultValues: { email: "", password: "" },
    });
    return(
        <section className="w-full max-w-2xl">
			<header className="mb-6 space-y-2">
				<h1 className="text-3xl lg:text-[48px] font-bold text-hubee-800">Login</h1>
                <p className="text-[16px] text-hubee-750">Acesse sua conta agora mesmo!</p>
			</header>

             {error && (
                <p role="alert" className="mb-4 text-sm text-red-700 dark:text-red-300">
                    {error}
                </p>
            )}
            {successMessage && (
                <p role="status" className="mb-4 text-sm text-green-800 dark:text-green-300">
                    {successMessage}
                </p>
            )}

             <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-1">
					<Label htmlFor="email" className="text-[16px] text-hubee-800">
						E-mail
					</Label>
					<Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email")}
                        className="h-9 border-hubee-neutral-50 bg-white text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:bg-hubee-900 dark:text-hubee-50"
                    />
                     {errors.email && (
                        <p id="email-error" className="text-xs text-red-700 dark:text-red-300">
                            {errors.email.message}
                        </p>
                    )}
				</div>

                <div className="space-y-1">
					<Label htmlFor="password" className="text-[16px] text-hubee-800">
						Senha
					</Label>
					<div className="relative">
                        <Input
							id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "password-error" : undefined}
                            {...register("password")}
                            className="h-9 border-hubee-neutral-50 bg-white pr-10 text-hubee-800 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:bg-hubee-900 dark:text-hubee-50"
						/>
                        <button
                            type="button"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword((visible) => !visible)}
                            className="absolute inset-y-0 right-2 inline-flex items-center justify-center text-hubee-800 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-hubee-500 dark:text-hubee-50"
                        >
                            {showPassword ? (
                                <EyeOff aria-hidden="true" size={16} />
                            ) : (
                                <Eye aria-hidden="true" size={16} />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-hubee-750">Mínimo de 8 caracteres</p>
                    {errors.password && (
                        <p id="password-error" className="text-xs text-red-700 dark:text-red-300">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                    <Label
						htmlFor="remember-me"
						className="flex items-center gap-2 text-sm font-normal text-hubee-800"
					>
						<Checkbox id="remember-me" name="remember-me" />
						Lembre-me
					</Label>
                    <span
                        aria-disabled="true"
                        className="cursor-not-allowed text-sm text-hubee-750 underline underline-offset-2 dark:text-hubee-neutral-50"
                    >
                        Esqueci minha senha
                    </span>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 w-full bg-hubee-400 text-hubee-900 hover:bg-hubee-500"
                >
                    {isLoading ? (
                        <>
                            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </Button>
			</form>
            <p className="mt-6 text-sm text-hubee-750 dark:text-hubee-neutral-50">
                Ainda não tem uma conta Hubee?
                <Link
                    href="/cadastro"
                    className="mt-2 block w-fit text-hubee-750 underline underline-offset-2 hover:text-hubee-900 focus-visible:outline-2 focus-visible:outline-hubee-500 dark:text-hubee-neutral-50"
                >
                    Criar conta
                </Link>
            </p>
        </section>
    )
}









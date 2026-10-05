export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterField = keyof RegisterValues;

export type RegisterErrors = Partial<Record<RegisterField, string>>;

/** Ordem em que os campos aparecem na tela (usada para focar o primeiro com erro). */
export const REGISTER_FIELD_ORDER: readonly RegisterField[] = [
  "name",
  "email",
  "password",
  "confirmPassword",
];

/**
 * Validação só no client. Quando o back-end estiver integrado, esta regra
 * continua valendo como primeira barreira, e os erros da API entram por cima.
 */
export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.name.trim()) {
    errors.name = "Informe seu nome.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.password) {
    errors.password = "Informe uma senha.";
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirme sua senha.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não conferem.";
  }

  return errors;
}

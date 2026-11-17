export const CPF_LENGTH = 11;
export const CNPJ_LENGTH = 14;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Aplica a máscara de CPF (`000.000.000-00`) até 11 dígitos e a de CNPJ (`00.000.000/0000-00`) acima disso. */
export function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, CNPJ_LENGTH);

  if (digits.length <= CPF_LENGTH) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/\/(\d{4})(\d{1,2})$/, "/$1-$2");
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Máscara de telefone: `(00) 0000-0000` com 10 dígitos e `(00) 00000-0000` com 11. */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

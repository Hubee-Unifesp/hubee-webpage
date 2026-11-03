export type Theme = "light" | "dark";

/** Cookie com a preferência de tema do usuário. */
export const THEME_COOKIE = "hubee_theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const themeCookiePattern = `(?:^|;\\s*)${THEME_COOKIE}=(light|dark)(?:;|$)`;

/** Lê o tema salvo em uma string de cookies (`document.cookie`). Sem cookie válido, o tema é claro. */
export function parseThemeCookie(cookies: string): Theme {
  return new RegExp(themeCookiePattern).exec(cookies)?.[1] === "dark" ? "dark" : "light";
}

/**
 * Script executado no `<head>` antes da primeira pintura: aplica a classe `.dark` a partir do cookie,
 * evitando o flash de tema claro ao recarregar sem abrir mão da geração estática das rotas.
 */
export const themeInitScript = `try{var m=new RegExp(${JSON.stringify(themeCookiePattern)}).exec(document.cookie);if(m&&m[1]==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

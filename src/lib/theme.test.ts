import { describe, expect, it } from "vitest";
import { parseThemeCookie, themeInitScript } from "./theme";

describe("parseThemeCookie", () => {
  it("usa o tema claro quando não há cookie", () => {
    expect(parseThemeCookie("")).toBe("light");
    expect(parseThemeCookie("outro=1")).toBe("light");
  });

  it("lê o tema salvo em qualquer posição", () => {
    expect(parseThemeCookie("hubee_theme=dark")).toBe("dark");
    expect(parseThemeCookie("a=1; hubee_theme=dark; b=2")).toBe("dark");
    expect(parseThemeCookie("a=1; hubee_theme=light")).toBe("light");
  });

  it("ignora valores inválidos e cookies com nome parecido", () => {
    expect(parseThemeCookie("hubee_theme=azul")).toBe("light");
    expect(parseThemeCookie("old_hubee_theme=dark")).toBe("light");
    expect(parseThemeCookie("hubee_theme=darker")).toBe("light");
  });
});

describe("themeInitScript", () => {
  function run(cookie: string) {
    const classes = new Set<string>();
    const document = { cookie, documentElement: { classList: { add: (c: string) => classes.add(c) } } };
    new Function("document", themeInitScript)(document);
    return classes;
  }

  it("aplica .dark só quando o cookie pede o tema escuro", () => {
    expect(run("a=1; hubee_theme=dark").has("dark")).toBe(true);
    expect(run("hubee_theme=light").has("dark")).toBe(false);
    expect(run("").has("dark")).toBe(false);
  });
});

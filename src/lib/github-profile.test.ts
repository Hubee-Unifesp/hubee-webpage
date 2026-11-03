import { describe, expect, it, vi } from "vitest";
import {
  compileGithubReadme,
  fetchMemberGithubReadme,
  getInitialTeamProfiles,
  resolveTeamMemberProfile,
  sanitizeGithubReadme,
} from "./github-profile";
import type { TeamMemberConfig } from "@/components/sobre/team.config";

describe("compileGithubReadme & sanitizeGithubReadme", () => {
  it("compila títulos, listas, negrito e extrai badges de tecnologias removendo seções vazias", () => {
    const raw = `
      <h1 align="center">Hi, I'm Dev</h1>
      ---
      ## 👋 Sobre mim
      - Estudando **Ciência e Tecnologia** na [UNIFESP](https://unifesp.br)
        - Foco em \`TypeScript\` e sistemas
      ## 🛠️ Minhas Skills
      ![TypeScript](https://img.shields.io/badge/-TypeScript-333333?style=flat)
      <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge" />
      <img src="https://skillicons.dev/icons?i=py,react&theme=dark" alt="skills" />
      ## 📊 Estatísticas
      <img src="https://github-readme-stats.vercel.app/api?username=test" alt="stats" />
    `;

    const blocks = compileGithubReadme(raw);

    const headingTexts = blocks
      .filter((b) => b.type === "heading")
      .map((b) => b.tokens.map((t) => ("value" in t ? t.value : t.label)).join(""));

    // A seção "Estatísticas" (que só tinha widget externo) deve ser omitida automaticamente
    expect(headingTexts).toContain("Hi, I'm Dev");
    expect(headingTexts).toContain("👋 Sobre mim");
    expect(headingTexts).toContain("🛠️ Minhas Skills");
    expect(headingTexts).not.toContain("📊 Estatísticas");

    const badgeBlock = blocks.find((b) => b.type === "badges");
    expect(badgeBlock?.items).toEqual(
      expect.arrayContaining(["TypeScript", "Docker", "Python", "React"]),
    );

    const listBlock = blocks.find((b) => b.type === "list");
    expect(listBlock?.items).toHaveLength(2);
    expect(listBlock?.items[1]?.indent).toBe(true);
  });

  it("remove comentários HTML, scripts e preserva o texto limpo no sanitizeGithubReadme", () => {
    const raw = `
      <!-- comentário oculto -->
      <script>alert('xss')</script>
      # Olá, eu sou o Matheus!
      ![Badge](https://img.shields.io/badge/test-passing-green)
      <div align="center"><p>Estudante na [UNIFESP](https://unifesp.br)</p></div>
    `;

    const result = sanitizeGithubReadme(raw);

    expect(result).not.toContain("alert");
    expect(result).not.toContain("shields.io");
    expect(result).toContain("# Olá, eu sou o Matheus!");
    expect(result).toContain("Estudante na UNIFESP");
  });
});

describe("getInitialTeamProfiles, fetchMemberGithubReadme & resolveTeamMemberProfile", () => {
  const sampleMember: TeamMemberConfig = {
    id: "teste",
    username: "usuario-teste",
    name: "Usuário Teste",
    role: "Engenharia de Software",
    fallbackBio: "Biografia institucional de fallback.",
  };

  it("gera perfis iniciais síncronos sem bloquear o carregamento da página", () => {
    const profiles = getInitialTeamProfiles([sampleMember]);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]?.readmeContent).toBe("Biografia institucional de fallback.");
    expect(profiles[0]?.hasCustomReadme).toBe(false);
    expect(profiles[0]?.avatarUrl).toContain("github.com/usuario-teste.png");
  });

  it("retorna o README da branch main quando disponível", async () => {
    const fakeFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => "# Perfil no GitHub\nDesenvolvedor Full-stack.",
    });

    const readme = await fetchMemberGithubReadme(
      "usuario-main",
      fakeFetch as unknown as typeof fetch,
    );

    expect(readme).toBe("# Perfil no GitHub\nDesenvolvedor Full-stack.");
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it("tenta a branch master quando a main retorna 404", async () => {
    const fakeFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "Conteúdo na branch master",
      });

    const profile = await resolveTeamMemberProfile(
      sampleMember,
      fakeFetch as unknown as typeof fetch,
    );

    expect(profile.hasCustomReadme).toBe(true);
    expect(profile.readmeContent).toBe("Conteúdo na branch master");
    expect(profile.avatarUrl).toContain("github.com/usuario-teste.png");
    expect(fakeFetch).toHaveBeenCalledTimes(2);
  });

  it("usa fallbackBio quando o usuário não possui README de perfil ou ocorre erro de rede", async () => {
    const fakeFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const profile = await resolveTeamMemberProfile(
      sampleMember,
      fakeFetch as unknown as typeof fetch,
    );

    expect(profile.hasCustomReadme).toBe(false);
    expect(profile.readmeContent).toBe("Biografia institucional de fallback.");
  });
});

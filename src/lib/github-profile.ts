import {
  TEAM_MEMBERS,
  type TeamMemberConfig,
  type TeamMemberProfile,
} from "@/components/sobre/team.config";

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";
const DEFAULT_BRANCHES = ["main", "master"] as const;

const readmeMemoryCache = new Map<string, string | null>();

export type ReadmeInlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

export type CompiledReadmeBlock =
  | { type: "heading"; level: 1 | 2 | 3; tokens: ReadmeInlineToken[] }
  | { type: "paragraph"; tokens: ReadmeInlineToken[] }
  | {
      type: "list";
      items: { indent: boolean; tokens: ReadmeInlineToken[] }[];
    }
  | { type: "badges"; items: string[] }
  | { type: "divider" };

const SKILL_ICONS_LABELS: Record<string, string> = {
  ps: "Photoshop",
  ai: "Illustrator",
  ae: "After Effects",
  pr: "Premiere",
  figma: "Figma",
  c: "C",
  cpp: "C++",
  cs: "C#",
  py: "Python",
  ts: "TypeScript",
  js: "JavaScript",
  html: "HTML",
  css: "CSS",
  lua: "Lua",
  git: "Git",
  github: "GitHub",
  vscode: "VS Code",
  visualstudio: "Visual Studio",
  arduino: "Arduino",
  nodejs: "Node.js",
  react: "React",
  go: "Go",
  docker: "Docker",
  postgres: "PostgreSQL",
  aws: "AWS",
};

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function extractBadgeLabelsFromLine(line: string): string[] {
  const labels: string[] = [];

  // 1. skillicons.dev/icons?i=c,cpp,py...
  const skillIconsMatches = line.matchAll(
    /skillicons\.dev\/icons\?i=([a-z0-9,_-]+)/gi,
  );
  for (const match of skillIconsMatches) {
    const codes = (match[1] ?? "").split(",");
    for (const code of codes) {
      const clean = code.trim().toLowerCase();
      if (clean) {
        labels.push(SKILL_ICONS_LABELS[clean] ?? clean.toUpperCase());
      }
    }
  }

  // 2. Markdown badges: ![Alt](https://img.shields.io/badge/...)
  const mdBadgeMatches = line.matchAll(
    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/gi,
  );
  for (const match of mdBadgeMatches) {
    const alt = (match[1] ?? "").trim();
    const url = match[2] ?? "";
    if (/komarev|ghpvc|followers|stats|streak|activity-graph|capsule-render|typing-svg/i.test(url)) {
      continue;
    }
    if (alt && !/^(typing|header|footer|stats|top langs|streak)$/i.test(alt)) {
      labels.push(decodeURIComponent(alt.replace(/_/g, " ")));
    }
  }

  // 3. HTML <img ... src="https://img.shields.io/badge/Label-..." alt="..." />
  const htmlImgMatches = line.matchAll(/<img\b[^>]*>/gi);
  for (const match of htmlImgMatches) {
    const tag = match[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    const altMatch = tag.match(/alt=["']([^"']+)["']/i);
    const src = srcMatch?.[1] ?? "";
    const alt = (altMatch?.[1] ?? "").trim();

    if (
      /komarev|ghpvc|github-readme-stats|profile-summary-cards|streak-stats|activity-graph|capsule-render|typing-svg|skillicons\.dev|Social\/|iconify\.design/i.test(
        src,
      )
    ) {
      continue;
    }

    if (alt && !/^(typing|header|footer|stats|top langs|streak|design|languages|tools|LinkedIn|Discord|Instagram|X|GitHub|Gmail)$/i.test(alt)) {
      labels.push(alt.replace(/_/g, " "));
      continue;
    }

    const shieldMatch = src.match(/shields\.io\/badge\/-?([^?/-]+)/i);
    if (shieldMatch?.[1]) {
      const decoded = decodeURIComponent(shieldMatch[1]).replace(/_/g, " ").trim();
      if (decoded && !/^(LinkedIn|Gmail|Follow|GitHub|Discord)$/i.test(decoded)) {
        labels.push(decoded);
      }
    }
  }

  return labels;
}

/**
 * Analisa tokens inline de Markdown (`**negrito**`, `*itálico*`, `` `código` ``, `[link](url)`).
 */
export function parseInlineMarkdown(text: string): ReadmeInlineToken[] {
  const cleaned = decodeHtmlEntities(
    text
      .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
      .replace(/<\/?[a-zA-Z][^>]*>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const tokens: ReadmeInlineToken[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: cleaned.slice(lastIndex, match.index),
      });
    }

    if (match[2] !== undefined) {
      tokens.push({ type: "bold", value: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "code", value: match[3] });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      tokens.push({ type: "link", label: match[4], href: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "italic", value: match[6] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < cleaned.length) {
    tokens.push({ type: "text", value: cleaned.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Compila o Markdown/HTML de um README de perfil do GitHub em uma árvore de blocos
 * estruturados (títulos, listas, parágrafos e pílulas de tecnologias), removendo
 * widgets quebrados de estatísticas e cabeçalhos vazios.
 */
export function compileGithubReadme(raw: string): CompiledReadmeBlock[] {
  if (!raw || typeof raw !== "string") return [];

  const preprocessed = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|table)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => `\n${"#".repeat(Number(level))} ${inner}\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n");

  const lines = preprocessed.split("\n");
  const rawBlocks: CompiledReadmeBlock[] = [];

  let pendingList: { indent: boolean; tokens: ReadmeInlineToken[] }[] = [];
  let pendingBadges: string[] = [];

  const flushPending = () => {
    if (pendingList.length > 0) {
      rawBlocks.push({ type: "list", items: pendingList });
      pendingList = [];
    }
    if (pendingBadges.length > 0) {
      const unique = Array.from(new Set(pendingBadges));
      rawBlocks.push({ type: "badges", items: unique });
      pendingBadges = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Extrai badges de tecnologias antes de remover imagens
    const lineBadges = extractBadgeLabelsFromLine(trimmed);
    if (lineBadges.length > 0) {
      if (pendingList.length > 0) {
        rawBlocks.push({ type: "list", items: pendingList });
        pendingList = [];
      }
      pendingBadges.push(...lineBadges);
    }

    // Remove imagens markdown e tags HTML de imagem/container
    const withoutImages = trimmed
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/<a\b[^>]*>\s*<img\b[^>]*>\s*<\/a>/gi, "")
      .replace(/<img\b[^>]*>/gi, "")
      .replace(/<\/?(div|p|span|a|tr|td|th)[^>]*>/gi, "")
      .trim();

    if (!withoutImages) {
      continue;
    }

    // Divisor horizontal ---
    if (/^[-*_]{3,}$/.test(withoutImages)) {
      flushPending();
      if (
        rawBlocks.length > 0 &&
        rawBlocks[rawBlocks.length - 1]?.type !== "divider"
      ) {
        rawBlocks.push({ type: "divider" });
      }
      continue;
    }

    // Títulos #, ##, ###
    const headingMatch = withoutImages.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushPending();
      const level = Math.min(headingMatch[1]?.length ?? 2, 3) as 1 | 2 | 3;
      const headingText = (headingMatch[2] ?? "").replace(/^`>\s*([^`]+)`$/, "$1");
      const tokens = parseInlineMarkdown(headingText);
      if (tokens.length > 0) {
        rawBlocks.push({ type: "heading", level, tokens });
      }
      continue;
    }

    // Itens de lista (- ou *)
    const listMatch = rawLine.match(/^(\s*)[-*]\s+(.+)$/);
    if (listMatch) {
      if (pendingBadges.length > 0) {
        rawBlocks.push({
          type: "badges",
          items: Array.from(new Set(pendingBadges)),
        });
        pendingBadges = [];
      }
      const indent = (listMatch[1]?.length ?? 0) >= 2;
      const itemText = (listMatch[2] ?? "")
        .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .trim();
      const tokens = parseInlineMarkdown(itemText);
      if (tokens.length > 0) {
        pendingList.push({ indent, tokens });
      }
      continue;
    }

    flushPending();
    const tokens = parseInlineMarkdown(withoutImages);
    if (tokens.length > 0) {
      rawBlocks.push({ type: "paragraph", tokens });
    }
  }

  flushPending();

  // Remove cabeçalhos órfãos (ex.: "## Estatísticas" ou "## Connect" cujo único conteúdo eram imagens externas)
  const cleanedBlocks: CompiledReadmeBlock[] = [];
  for (let i = 0; i < rawBlocks.length; i++) {
    const current = rawBlocks[i];
    if (!current) continue;

    if (current.type === "heading") {
      // Procura o próximo bloco não-divisor
      let nextContent: CompiledReadmeBlock | undefined;
      for (let j = i + 1; j < rawBlocks.length; j++) {
        if (rawBlocks[j]?.type !== "divider") {
          nextContent = rawBlocks[j];
          break;
        }
      }
      // Se não há conteúdo após este título ou o próximo bloco já é outro título do mesmo nível/superior
      if (
        !nextContent ||
        (nextContent.type === "heading" && nextContent.level <= current.level)
      ) {
        continue;
      }
    }

    if (
      current.type === "divider" &&
      (cleanedBlocks.length === 0 ||
        cleanedBlocks[cleanedBlocks.length - 1]?.type === "divider")
    ) {
      continue;
    }

    cleanedBlocks.push(current);
  }

  if (
    cleanedBlocks.length > 0 &&
    cleanedBlocks[cleanedBlocks.length - 1]?.type === "divider"
  ) {
    cleanedBlocks.pop();
  }

  return cleanedBlocks;
}

/**
 * Limpa e normaliza o conteúdo Markdown/HTML de um README de perfil do GitHub
 * para exibição segura e legível dentro do diálogo modal da página Sobre.
 */
export function sanitizeGithubReadme(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  return (
    raw
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]+\)/g, "$1")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[a-zA-Z][^>]*>/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Busca o README.md bruto do repositório de perfil público (`<username>/<username>`) no GitHub.
 * Utiliza cache em memória para evitar chamadas repetidas ao clicar novamente no mesmo integrante.
 * Retorna `null` em caso de 404, timeout ou erro de rede.
 */
export async function fetchMemberGithubReadme(
  username: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const useDefaultCache = fetchImpl === fetch;
  if (useDefaultCache && readmeMemoryCache.has(username)) {
    return readmeMemoryCache.get(username) ?? null;
  }

  for (const branch of DEFAULT_BRANCHES) {
    const url = `${GITHUB_RAW_BASE}/${encodeURIComponent(username)}/${encodeURIComponent(username)}/${branch}/README.md`;
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        continue;
      }

      const rawText = await response.text();
      if (compileGithubReadme(rawText).length > 0) {
        if (useDefaultCache) {
          readmeMemoryCache.set(username, rawText.trim());
        }
        return rawText.trim();
      }
    } catch {
      continue;
    }
  }

  if (useDefaultCache) {
    readmeMemoryCache.set(username, null);
  }
  return null;
}

/**
 * Constrói o perfil completo de um integrante combinando a configuração local
 * com o avatar e o README público do GitHub (ou `fallbackBio` quando ausente).
 */
export async function resolveTeamMemberProfile(
  member: TeamMemberConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<TeamMemberProfile> {
  const readme = await fetchMemberGithubReadme(member.username, fetchImpl);

  return {
    ...member,
    avatarUrl: `https://github.com/${encodeURIComponent(member.username)}.png?size=320`,
    githubUrl: `https://github.com/${encodeURIComponent(member.username)}`,
    readmeContent: readme ?? member.fallbackBio,
    hasCustomReadme: readme !== null,
  };
}

/**
 * Gera instantaneamente a lista inicial de perfis do time (sem bloquear o carregamento da rota).
 * O README do GitHub é buscado sob demanda quando o usuário clica na foto do integrante.
 */
export function getInitialTeamProfiles(
  members: readonly TeamMemberConfig[] = TEAM_MEMBERS,
): TeamMemberProfile[] {
  return members.map((member) => ({
    ...member,
    avatarUrl: `https://github.com/${encodeURIComponent(member.username)}.png?size=320`,
    githubUrl: `https://github.com/${encodeURIComponent(member.username)}`,
    readmeContent: member.fallbackBio,
    hasCustomReadme: false,
  }));
}

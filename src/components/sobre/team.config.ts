export interface TeamMemberConfig {
  id: string;
  username: string;
  name: string;
  role: string;
  fallbackBio: string;
}

export interface TeamMemberProfile extends TeamMemberConfig {
  avatarUrl: string;
  githubUrl: string;
  readmeContent: string;
  hasCustomReadme: boolean;
}

export const TEAM_MEMBERS: readonly TeamMemberConfig[] = [
  {
    id: "matheus-oliveira",
    username: "OliveiraMatheuus",
    name: "Matheus Oliveira",
    role: "Engenharia de Software · Full-stack ",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP responsável pelo desenvolvimento full-stack, design de interfaces no Figma e documentação arquitetural da plataforma Hubee.",
  },
  {
    id: "cibelle-godoy",
    username: "Cibelleeg",
    name: "Cibelle Godoy",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP atuando no desenvolvimento de funcionalidades web e serviços de backend da plataforma Hubee.",
  },
  {
    id: "yuji-furukawa",
    username: "yujifkw",
    name: "Yuji Furukawa",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP contribuindo na arquitetura, componentes de interface e fluxos de eventos do Hubee.",
  },
  {
    id: "artur-santos",
    username: "Artursnt",
    name: "Artur de Camargo Santos",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP dedicado à construção dos módulos de eventos, APIs e experiência do usuário no Hubee.",
  },
  {
    id: "daldin",
    username: "daldindev",
    name: "Daldin",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Estudante de Ciência da Computação na UNIFESP e integrante da equipe de Engenharia de Software no desenvolvimento da plataforma Hubee.",
  },
  {
    id: "bianca-takahashi",
    username: "biancakimi",
    name: "Bianca Kimi Takahashi",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP atuando na implementação de interfaces responsivas e fluxos da plataforma Hubee.",
  },
  {
    id: "gustavo-baptistella",
    username: "GustavoBaptistella",
    name: "Gustavo Baptistella",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP colaborando no desenvolvimento da API, banco de dados e aplicação web do Hubee.",
  },
  {
    id: "felipe-zina",
    username: "FelipeZina",
    name: "Felipe Zina",
    role: "Engenharia de Software · Full-stack",
    fallbackBio:
      "Integrante da equipe de Engenharia de Software da UNIFESP focado na implementação de serviços de backend, infraestrutura e qualidade do Hubee.",
  },
];


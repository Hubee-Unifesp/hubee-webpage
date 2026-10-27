import { ContaCard } from "@/components/conta/conta-card";
import { canCreateEvents } from "@/lib/permissions";
import type { OrganizationAccessLevel, Usuario } from "@/types/usuario";

const roleLabels: Record<Usuario["role"], string> = {
  USER: "Usuário",
  ADMIN: "Administrador da plataforma",
};

const intentLabels = {
  BUY: "Comprar ingressos",
  ORGANIZE: "Organizar eventos",
} as const;

const levelLabels: Record<OrganizationAccessLevel, string> = {
  read: "Somente consulta",
  write: "Cria e edita eventos",
  manage: "Gerencia a organização",
};

/** Cartão do Meu Perfil com o tipo da conta e as permissões em cada organização. */
export function PermissoesCard({ usuario }: { usuario: Usuario }) {
  const organizations = usuario.organizations ?? [];
  const summary = [
    { label: "Tipo de conta", value: roleLabels[usuario.role] },
    { label: "Objetivo no cadastro", value: usuario.signupIntent ? intentLabels[usuario.signupIntent] : "Não informado" },
    { label: "Criação de eventos", value: canCreateEvents(usuario) ? "Permitida" : "Não permitida" },
  ];

  return (
    <ContaCard title="Permissões e perfil" description="O que a sua conta pode fazer na plataforma.">
      <dl className="grid gap-4 sm:grid-cols-3">
        {summary.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-hubee-neutral-300 dark:text-hubee-200">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-sm font-semibold">Organizações</h3>
      {organizations.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2">
          {organizations.map(({ orgId, organizationName, role, level }) => (
            <li
              key={orgId}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-hubee-200 px-3 py-2 dark:border-hubee-50/10"
            >
              <span className="text-sm font-medium">{organizationName}</span>
              <span className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
                {role === "admin" ? "Administrador" : "Membro"} · {levelLabels[level]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-hubee-neutral-300 dark:text-hubee-200">
          {usuario.signupIntent === "ORGANIZE"
            ? "Você ainda não faz parte de nenhuma organização. Quando aceitar um convite, a gestão de eventos aparece aqui."
            : "Você ainda não faz parte de nenhuma organização."}
        </p>
      )}
    </ContaCard>
  );
}

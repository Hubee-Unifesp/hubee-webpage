# Mock temporário de usuário logado

A implementação atual de `/login` existe **exclusivamente para demonstração visual**. Ao acessar a rota, `page.tsx` renderiza `HomeContent` com `role="user"` e `homeHref="/login"`, sem chamar uma API, validar credenciais ou criar sessão.

O link “Sair” apenas navega para `/`; não invalida uma sessão. Reabrir `/login` volta a mostrar o usuário simulado.

## Remover ao integrar a autenticação real

1. Excluir a implementação mock de `src/app/login/page.tsx`. Se a rota `/login` for usada pelo login real, substituir seu conteúdo pelo fluxo real em vez de excluir a rota.
2. Atualizar `loginItem` em `src/components/layout/header/actions/actions.config.ts` para o destino de autenticação escolhido.
3. Fornecer o perfil do usuário a `HomeContent` a partir da sessão real, removendo o `role="user"` fixo usado nesta página.
4. Remover o uso de `homeHref="/login"`; a navegação de Início e Eventos deve voltar a apontar para a home real (`/`).
5. Substituir a saída simulada (`logoutHref="/"`, fornecida em `home-content.tsx` e renderizada em `actions/user-menu.tsx`) pelo encerramento real da sessão antes do redirecionamento.
6. Validar os estados visitante e autenticado, recarregamento da página, navegação até Eventos e logout. Atualizar as referências ao mock nos READMEs e excluir este documento quando a migração terminar.

`HomeContent` e `Header` são componentes compartilhados da aplicação e devem ser preservados. Somente a página de demonstração e os comportamentos específicos da simulação devem ser removidos ou substituídos.

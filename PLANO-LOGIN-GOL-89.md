# Plano de implementação: tela de login GOL-89

**Objetivo:** substituir o conteúdo simulado de `/login` por uma tela responsiva com validação local, mantendo a autenticação simulada isolada da interface.

## 1. Conferir o layout no Figma

- [ ] Verificar dimensões, textos, espaçamentos e elementos visuais no frame.
- [ ] Confirmar se a tela inclui cabeçalho e rodapé. A página atual os recebe indiretamente por `HomeContent`; ao removê-lo, essa composição precisa ser definida explicitamente.
- [ ] Conferir os temas claro e escuro e a apresentação em 375 px.

## 2. Preparar dependências e tipos

- [ ] Instalar `react-hook-form`, `zod` e `@hookform/resolvers`.
- [ ] Definir o tipo dos dados do formulário: `email` e `password`.
- [ ] Criar o schema Zod com campos obrigatórios e formato válido de e-mail.

## 3. Criar o componente do formulário

Arquivo: `src/components/auth/login-form.tsx`

- [ ] Criar um Client Component que recebe `onSubmit`, `isLoading` e `error` por props.
- [ ] Usar `Input` e `Button` existentes, seguindo os estilos e tokens do projeto.
- [ ] Configurar validação no envio e revalidação a cada alteração dos campos que já apresentaram erro.
- [ ] Associar cada mensagem ao campo com `aria-describedby` e marcar o campo com `aria-invalid`.
- [ ] Garantir o foco no primeiro campo inválido após uma tentativa de envio.
- [ ] Implementar mostrar/ocultar senha com `aria-label` e `aria-pressed`.
- [ ] Fazer “Entrar” enviar o formulário, desabilitando o botão durante o carregamento.
- [ ] Exibir o erro geral de forma acessível com `role="alert"`.
- [ ] Mostrar “Esqueci minha senha” sem navegação e sem `href="#"`.
- [ ] Apontar “Criar conta” para `/cadastro`.

## 4. Substituir a página falsa

Arquivo: `src/app/login/page.tsx`

- [ ] Remover a renderização de `HomeContent` como usuário logado.
- [ ] Montar o `LoginForm` e implementar a simulação temporária no callback da página.
- [ ] Esperar um segundo antes de apresentar o resultado.
- [ ] Para `erro@teste.com`, exibir “E-mail ou senha inválidos”; para os demais e-mails, exibir “Login simulado”.
- [ ] Marcar a simulação com `// TODO(auth-api)` para removê-la na integração.
- [ ] Não adicionar chamadas à API, sessão, token ou redirecionamento.

## 5. Atualizar a documentação da rota

Arquivo: `src/app/login/README.md`

- [ ] Atualizar a descrição, que hoje apresenta `/login` como página simulada de usuário logado.
- [ ] Registrar que a tela possui formulário e simulação temporária, sem autenticação real.

## 6. Validar os critérios de aceite

- [ ] Envio vazio ou com e-mail inválido exibe o erro de campo e foca o primeiro campo inválido.
- [ ] Erros não aparecem antes do primeiro envio e somem quando o campo fica válido.
- [ ] Mostrar/ocultar senha funciona e informa o estado a leitores de tela.
- [ ] Erro geral, sucesso simulado e carregamento aparecem corretamente.
- [ ] O formulário funciona com teclado, incluindo Tab e Enter.
- [ ] “Criar conta” navega para `/cadastro`.
- [ ] Conferir responsividade em 375 px e temas claro e escuro.
- [ ] Executar `npm run lint` e `npm run build`.

## Fora do escopo

- Integração com `hubee-api`, token, sessão ou redirecionamento.
- Recuperação de senha.
- Login com Google ou outras redes.
- Alteração da simulação do cabeçalho.

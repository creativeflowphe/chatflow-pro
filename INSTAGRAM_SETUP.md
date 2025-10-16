# Guia Completo de Configuração do Instagram (Graph API)

Este guia irá ajudá-lo a configurar a integração com Instagram do zero, passo a passo, para ambiente de produção usando a Graph API do Facebook.

## Visão Geral

A integração do Instagram permite que os usuários conectem suas contas comerciais do Instagram ao sistema para automação de mensagens. O sistema usa OAuth2 da Instagram Graph API (via Facebook Login).

## Arquitetura

1. **Frontend** (React + Vite) hospedado na Vercel
2. **Backend** (Supabase Edge Functions) para processar tokens OAuth
3. **Database** (Supabase PostgreSQL) para armazenar conexões

---

## IMPORTANTE: Diferença entre as APIs

Existem DUAS APIs do Instagram:

1. **Instagram Basic Display API** - Para perfis pessoais básicos (ANTIGA)
2. **Instagram Graph API** - Para contas comerciais com recursos avançados (ATUAL)

**Este sistema usa a Graph API**, que requer:
- Uma **Página do Facebook**
- Uma **Conta Comercial do Instagram** conectada à página

---

## Parte 1: Pré-requisitos

### Você Precisa:

1. Uma conta do Facebook
2. Uma Página do Facebook (crie uma se não tiver)
3. Uma conta do Instagram convertida para **Conta Comercial** ou **Conta de Criador**
4. A conta do Instagram deve estar **conectada à Página do Facebook**

### Como Conectar Instagram à Página do Facebook:

1. Acesse sua Página do Facebook
2. Vá em **Configurações** > **Instagram**
3. Clique em **Conectar conta**
4. Faça login na sua conta do Instagram
5. Confirme a conexão

---

## Parte 2: Configurar o Aplicativo no Meta for Developers

### Passo 1: Criar o Aplicativo

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Faça login com sua conta do Facebook
3. Clique em **"Meus Aplicativos"** no menu superior direito
4. Clique em **"Criar Aplicativo"**
5. Selecione **"Empresa"** como tipo de aplicativo
6. Preencha:
   - **Nome do Aplicativo**: Escolha um nome descritivo (ex: "ChatFlow Pro")
   - **Email de Contato**: Seu email válido
7. Clique em **"Criar Aplicativo"**

### Passo 2: Adicionar o Produto Instagram

1. No painel do aplicativo, na seção **"Adicionar Produtos"**
2. Localize **"Instagram"** (NÃO é o Basic Display)
3. Clique em **"Configurar"**

### Passo 3: Configurar Permissões e URLs

1. No menu lateral, clique em **"Instagram"** > **"Configuração da API com login do Instagram"**

2. Configure as **URLs de Redirecionamento OAuth válidas**:

**Para Desenvolvimento Local:**
```
http://localhost:5173/auth/instagram/callback
```

**Para Produção (substitua pelo seu domínio):**
```
https://seu-dominio.vercel.app/auth/instagram/callback
```

3. Configure **"Desautorizar URL de retorno de chamada"**:
```
https://seu-dominio.vercel.app/auth/deauthorize
```

4. Configure **"Exclusão de dados do cliente"**:
```
https://seu-dominio.vercel.app/auth/deletion
```

5. Clique em **"Salvar Alterações"**

### Passo 4: Obter as Credenciais

Você precisará de **DOIS conjuntos** de IDs:

#### Do App Principal (Configurações > Básico):
- **ID do Aplicativo**: Este é o `VITE_INSTAGRAM_APP_ID`
  - Exemplo: `651067714529155`

#### Da Configuração do Instagram:
- **ID do app do Instagram**: Este é o `INSTAGRAM_APP_ID`
  - Exemplo: `1212987200641405`
- **Chave secreta do app do Instagram**: Este é o `INSTAGRAM_APP_SECRET`
  - Exemplo: `02bf4e1dd23655b13aa`

**IMPORTANTE**: São valores DIFERENTES! Não confunda!

### Passo 5: Adicionar Permissões

1. No menu lateral, vá em **"Configurações do app"** > **"Básico"**
2. Na seção **"Instagram"**, certifique-se de que as seguintes permissões estão habilitadas:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`
   - `pages_show_list`
   - `pages_read_engagement`

---

## Parte 3: Configurar Variáveis de Ambiente

### Para Desenvolvimento Local (.env)

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_INSTAGRAM_APP_ID=651067714529155
```

**ATENÇÃO**: Use o **ID do Aplicativo Principal** (da página Básico), NÃO o ID do app do Instagram!

### Para Produção (Vercel)

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **"Settings"** > **"Environment Variables"**
4. Adicione as seguintes variáveis:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJhbG...` |
| `VITE_INSTAGRAM_APP_ID` | ID do Aplicativo Principal | `651067714529155` |

**IMPORTANTE:** Após adicionar as variáveis, faça um novo deploy do projeto.

### Para Supabase Edge Functions

As Edge Functions precisam das credenciais da configuração do Instagram:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **"Project Settings"** > **"Edge Functions"** > **"Secrets"**
4. Clique em **"Add new secret"** e adicione:

| Nome | Valor | Exemplo | Onde Encontrar |
|------|-------|---------|----------------|
| `INSTAGRAM_APP_ID` | ID do app do Instagram | `1212987200641405` | Instagram > Configuração da API com login |
| `INSTAGRAM_APP_SECRET` | Chave secreta do Instagram | `02bf4e1dd23655b13aa` | Instagram > Configuração da API com login |

**IMPORTANTE**: Use os valores da **Configuração da API com login do Instagram**, NÃO da página Básico!

---

## Parte 4: Deploy da Edge Function

A Edge Function `instagram-oauth` já está no projeto. Para fazer deploy:

```bash
# Via Supabase CLI (se tiver instalado)
supabase functions deploy instagram-oauth

# Ou use a ferramenta de deploy do seu sistema
```

---

## Parte 5: Fluxo de Autenticação

### Como Funciona:

1. **Usuário clica em "Conectar Instagram"**
2. **Sistema gera um estado único** e salva na tabela `oauth_states`
3. **Usuário é redirecionado** para o Facebook OAuth
4. **Facebook pede permissões** (acesso a páginas e Instagram)
5. **Facebook redireciona de volta** com `code` e `state`
6. **Sistema valida o estado** (segurança CSRF)
7. **Edge Function troca o código por token**
8. **Sistema busca páginas do Facebook**
9. **Sistema busca conta do Instagram conectada à página**
10. **Sistema salva a conexão** na tabela `connections`

### URLs Importantes:

**Desenvolvimento:**
- Callback: `http://localhost:5173/auth/instagram/callback`
- OAuth: `https://www.facebook.com/v21.0/dialog/oauth`

**Produção:**
- Callback: `https://seu-dominio.vercel.app/auth/instagram/callback`

---

## Parte 6: Testando a Integração

### Checklist de Verificação:

- [ ] App criado no Meta for Developers
- [ ] Produto Instagram adicionado
- [ ] URLs de redirecionamento configuradas (dev + prod)
- [ ] Página do Facebook criada
- [ ] Instagram conectado à Página do Facebook
- [ ] Instagram é Conta Comercial ou de Criador
- [ ] Credenciais copiadas corretamente (ambos os IDs)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Secrets configuradas no Supabase
- [ ] Edge Function deployada
- [ ] Banco de dados migrado

### Teste Passo a Passo:

1. Acesse a página de Conexões do sistema
2. Clique no botão "Conectar" do Instagram
3. Você será redirecionado para o Facebook
4. Faça login (se necessário)
5. Conceda as permissões solicitadas
6. Selecione a Página do Facebook que tem o Instagram conectado
7. Você será redirecionado de volta para o sistema
8. A conexão deve aparecer como "Conectado" com seu username do Instagram

### Possíveis Erros e Soluções:

| Erro | Causa Provável | Solução |
|------|---------------|---------|
| "Invalid platform app" | App ID incorreto ou app não configurado | Verifique se está usando o ID correto (principal, não do Instagram) |
| "Instagram App ID não configurado" | Variável VITE_INSTAGRAM_APP_ID não definida | Configure na Vercel e faça redeploy |
| "Redirect URI mismatch" | URL não cadastrada no Meta | Adicione a URL EXATA nas configurações |
| "Nenhuma página encontrada" | Conta não tem página do Facebook | Crie uma página do Facebook primeiro |
| "Página não conectada ao Instagram" | Instagram não vinculado à página | Conecte o Instagram à página nas configurações da página |
| "Configuração do Instagram não encontrada" | Secrets não configuradas | Configure INSTAGRAM_APP_ID e INSTAGRAM_APP_SECRET no Supabase |
| "Esta conta não é comercial" | Instagram é conta pessoal | Converta para Conta Comercial ou de Criador |

---

## Parte 7: Resumo das Credenciais

Para evitar confusão, aqui está um resumo:

### Frontend (.env e Vercel):
```
VITE_INSTAGRAM_APP_ID = ID do Aplicativo Principal (Básico)
Exemplo: 651067714529155
```

### Backend (Supabase Secrets):
```
INSTAGRAM_APP_ID = ID do app do Instagram (Configuração da API)
Exemplo: 1212987200641405

INSTAGRAM_APP_SECRET = Chave secreta do Instagram (Configuração da API)
Exemplo: 02bf4e1dd23655b13aa
```

---

## Parte 8: Ir para Produção

### 1. Verificar Configuração da Business

Antes de publicar:
- Confirme que sua conta é **Business Verified**
- Adicione URLs de política de privacidade
- Adicione URLs de termos de serviço
- Configure ícones do app (1024x1024)

### 2. Modo Ao Vivo

1. No Meta for Developers, vá em **"Configurações"** > **"Básico"**
2. Toggle para **"Ao vivo"** (live mode)
3. Se necessário, passe pela revisão do Facebook

### 3. Permissões Avançadas

Para usar recursos avançados (webhooks, mensagens, etc.), você precisará submeter para revisão:
- Descreva como usa os dados do Instagram
- Forneça vídeo demonstrativo
- Aguarde aprovação (pode levar dias/semanas)

---

## Documentação Oficial

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Instagram Messaging](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)

---

## Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs da Edge Function no Supabase Dashboard
3. Confirme que TODAS as variáveis estão configuradas corretamente
4. Certifique-se de que está usando os IDs corretos em cada lugar
5. Verifique se o Instagram está conectado à Página do Facebook
6. Confirme que a conta do Instagram é Comercial ou de Criador

---

**Última atualização:** Outubro 2025

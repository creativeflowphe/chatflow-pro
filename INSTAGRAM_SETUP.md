# Guia Completo de Configuração do Instagram

Este guia irá ajudá-lo a configurar a integração com Instagram do zero, passo a passo, para ambiente de produção.

## Visão Geral

A integração do Instagram permite que os usuários conectem suas contas do Instagram ao sistema para automação de mensagens. O sistema usa OAuth2 do Instagram Basic Display API.

## Arquitetura

1. **Frontend** (React + Vite) hospedado na Vercel
2. **Backend** (Supabase Edge Functions) para processar tokens OAuth
3. **Database** (Supabase PostgreSQL) para armazenar conexões

---

## Parte 1: Configurar o Aplicativo no Meta for Developers

### Passo 1: Criar o Aplicativo

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Faça login com sua conta do Facebook
3. Clique em **"Meus Aplicativos"** no menu superior direito
4. Clique em **"Criar Aplicativo"**
5. Selecione **"Consumidor"** como tipo de aplicativo
6. Preencha:
   - **Nome do Aplicativo**: Escolha um nome descritivo (ex: "Meu Sistema de Automação")
   - **Email de Contato**: Seu email válido
7. Clique em **"Criar Aplicativo"**

### Passo 2: Adicionar o Produto Instagram Basic Display

1. No painel do aplicativo, na seção **"Adicionar Produtos"**
2. Localize **"Instagram Basic Display"**
3. Clique em **"Configurar"**

### Passo 3: Configurar a API

1. No menu lateral, clique em **"Instagram Basic Display"** > **"Configurações Básicas de Exibição"**
2. Clique em **"Criar novo Aplicativo"** na seção de configurações
3. Preencha os seguintes campos:

#### URLs de Redirecionamento OAuth (IMPORTANTE)

Você precisa adicionar TODAS as URLs que usará:

**Para Desenvolvimento Local:**
```
http://localhost:5173/auth/instagram/callback
```

**Para Produção (substitua seu-dominio.vercel.app pelo seu domínio real):**
```
https://seu-dominio.vercel.app/auth/instagram/callback
```

#### Outras URLs Obrigatórias:

**Deauthorize Callback URL:**
```
https://seu-dominio.vercel.app/auth/deauthorize
```

**Data Deletion Request URL:**
```
https://seu-dominio.vercel.app/auth/deletion
```

4. Clique em **"Salvar Alterações"**

### Passo 4: Obter as Credenciais

1. No menu lateral, vá em **"Configurações"** > **"Básico"**
2. Copie o **"ID do Aplicativo"** (Instagram App ID)
3. Clique em **"Mostrar"** no campo **"Chave Secreta do Aplicativo"** e copie o valor

**Guarde essas informações com segurança!**

### Passo 5: Adicionar Testadores (Modo Desenvolvimento)

Enquanto seu app estiver em desenvolvimento, apenas testadores aprovados podem conectar:

1. No Instagram Basic Display, vá até a seção **"Funções"** > **"Instagram Testers"**
2. Clique em **"Adicionar testadores do Instagram"**
3. Digite o nome de usuário do Instagram
4. O usuário receberá um convite no app do Instagram
5. O usuário deve:
   - Abrir o Instagram no celular
   - Ir em Configurações > Apps e Sites
   - Aceitar o convite de testador

---

## Parte 2: Configurar Variáveis de Ambiente

### Para Desenvolvimento Local (.env)

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_INSTAGRAM_APP_ID=seu_instagram_app_id_aqui
```

### Para Produção (Vercel)

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **"Settings"** > **"Environment Variables"**
4. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `VITE_INSTAGRAM_APP_ID` | ID do aplicativo Instagram |

**IMPORTANTE:** Após adicionar as variáveis, faça um novo deploy do projeto.

### Para Supabase Edge Functions

As Edge Functions precisam das credenciais secretas do Instagram:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **"Project Settings"** > **"Edge Functions"**
4. Na seção **"Secrets"**, clique em **"Add new secret"**
5. Adicione:

| Nome | Valor |
|------|-------|
| `INSTAGRAM_APP_ID` | ID do aplicativo Instagram |
| `INSTAGRAM_APP_SECRET` | Chave secreta do aplicativo Instagram |

**NOTA:** Não confunda com as variáveis do frontend! Essas são variáveis SECRETAS que rodam no servidor.

---

## Parte 3: Estrutura do Banco de Dados

O banco de dados já está configurado com as migrações. As tabelas principais são:

### Tabela `oauth_states`
Armazena estados temporários do OAuth (expiram em 10 minutos):
- `id`, `user_id`, `state`, `platform`, `redirect_uri`, `expires_at`, `created_at`

### Tabela `connections`
Armazena as conexões ativas do Instagram:
- `id`, `user_id`, `platform`, `platform_user_id`, `platform_username`, `access_token`, `is_active`, `metadata`

---

## Parte 4: Deploy da Edge Function

A Edge Function `instagram-oauth` já está no projeto em `supabase/functions/instagram-oauth/index.ts`.

Para fazer deploy:

1. Certifique-se de que as secrets foram configuradas no Supabase (Parte 2)
2. A função será automaticamente deployada pelo sistema

### Testando a Edge Function

Você pode testar se a função está funcionando:

```bash
curl -X POST 'https://seu-projeto.supabase.co/functions/v1/instagram-oauth' \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "test", "redirect_uri": "http://localhost:5173/auth/instagram/callback"}'
```

Resposta esperada (sem código válido):
```json
{"success": false, "error": "Erro ao obter token: ..."}
```

---

## Parte 5: Fluxo de Autenticação

### Como Funciona:

1. **Usuário clica em "Conectar Instagram"** na página de Conexões
2. **Sistema gera um estado único** e salva na tabela `oauth_states`
3. **Usuário é redirecionado** para `https://api.instagram.com/oauth/authorize`
4. **Instagram pede autorização** ao usuário
5. **Instagram redireciona de volta** com `code` e `state`
6. **Sistema valida o estado** (segurança contra CSRF)
7. **Edge Function troca o código por token** usando as credenciais secretas
8. **Sistema salva a conexão** na tabela `connections`

### URLs Importantes:

**Desenvolvimento:**
- Callback: `http://localhost:5173/auth/instagram/callback`

**Produção:**
- Callback: `https://seu-dominio.vercel.app/auth/instagram/callback`

---

## Parte 6: Testando a Integração

### Checklist de Verificação:

- [ ] App criado no Meta for Developers
- [ ] Instagram Basic Display API configurada
- [ ] URLs de redirecionamento configuradas (dev + prod)
- [ ] Credenciais copiadas (App ID + App Secret)
- [ ] Testador adicionado e convite aceito no Instagram
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Secrets configuradas no Supabase
- [ ] Edge Function deployada
- [ ] Banco de dados migrado

### Teste Passo a Passo:

1. Acesse a página de Conexões do sistema
2. Clique no botão "Conectar" do Instagram
3. Você será redirecionado para a página do Instagram
4. Faça login (se necessário) e autorize o app
5. Você será redirecionado de volta para o sistema
6. A conexão deve aparecer como "Conectado"

### Possíveis Erros:

| Erro | Causa | Solução |
|------|-------|---------|
| "Instagram App ID não configurado" | Variável VITE_INSTAGRAM_APP_ID não definida | Configure a variável na Vercel e faça redeploy |
| "Redirect URI mismatch" | URL não cadastrada no Meta | Adicione a URL exata nas configurações do app |
| "Estado OAuth inválido" | Estado expirado ou inválido | Tente conectar novamente (estados expiram em 10min) |
| "Usuário não autorizado" | Não é testador do app | Adicione como testador e aceite o convite |
| "Configuração do Instagram não encontrada" | Secrets não configuradas no Supabase | Configure INSTAGRAM_APP_ID e INSTAGRAM_APP_SECRET |

---

## Parte 7: Ir para Produção

Quando estiver pronto para liberar para todos os usuários:

### 1. Remover Modo de Desenvolvimento

1. No Meta for Developers, vá em **"Configurações"** > **"Básico"**
2. Role até **"Modo do Aplicativo"**
3. Clique em **"Enviar para revisão"**

### 2. Submeter para Revisão

Você precisará:
- Adicionar ícones do app (1024x1024)
- Adicionar URL de política de privacidade
- Adicionar URL de termos de serviço
- Descrever como o app usa os dados do Instagram
- Gravar um vídeo demonstrando o uso do app

### 3. Aguardar Aprovação

A revisão pode levar de alguns dias a algumas semanas. Após aprovado, qualquer usuário poderá conectar.

---

## Documentação Oficial

- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Getting Started Guide](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)
- [OAuth Documentation](https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions)

---

## Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs da Edge Function no Supabase
3. Confirme que todas as variáveis estão configuradas corretamente
4. Certifique-se de que as URLs de callback estão EXATAMENTE iguais no Meta e no código

---

**Última atualização:** Outubro 2025

# Guia de Configuração do Instagram Graph API

Este guia mostra como conectar o Instagram ao ChatFlow Pro usando a Instagram Graph API hospedada na Vercel e Supabase.

## Requisitos Obrigatórios

1. Conta do Facebook
2. Página do Facebook
3. Conta Comercial do Instagram conectada à sua Página do Facebook
4. App no Meta for Developers

## Passo 1: Preparar o Instagram

### 1.1 Criar Página do Facebook

Se você ainda não tem uma Página do Facebook:
1. Acesse [facebook.com/pages/create](https://www.facebook.com/pages/create)
2. Escolha o tipo de página
3. Preencha as informações e crie a página

### 1.2 Conectar Instagram à Página do Facebook

1. Acesse sua Página do Facebook
2. Vá em **Configurações** > **Instagram**
3. Clique em **Conectar conta**
4. Faça login na sua conta do Instagram
5. Confirme a conexão

### 1.3 Converter para Conta Comercial

Se seu Instagram ainda não é Comercial:
1. Abra o app do Instagram
2. Vá em **Configurações** > **Conta**
3. Toque em **Mudar para conta profissional**
4. Escolha **Conta Comercial**

## Passo 2: Criar App no Meta for Developers

### 2.1 Criar o Aplicativo

1. Acesse [developers.facebook.com](https://developers.facebook.com/)
2. Clique em **Meus Aplicativos** > **Criar Aplicativo**
3. Escolha **Empresa** como tipo
4. Preencha:
   - Nome do Aplicativo: ChatFlow Pro (ou seu nome)
   - Email de contato: seu email
5. Clique em **Criar Aplicativo**

### 2.2 Adicionar Produto Instagram

1. No painel do app, localize **Instagram** na seção "Adicionar Produtos"
2. Clique em **Configurar**
3. Aguarde a instalação

### 2.3 Configurar URLs

1. No menu lateral, clique em **Instagram** > **Configuração da API com login do Instagram**

2. Configure **URLs de Redirecionamento OAuth válidas**:
```
https://chatflow-pro-chi.vercel.app/auth/instagram/callback
```

3. Configure **URL de retorno de chamada de desautorização**:
```
https://chatflow-pro-chi.vercel.app/auth/deauthorize
```

4. Configure **URL de exclusão de dados**:
```
https://chatflow-pro-chi.vercel.app/auth/deletion
```

5. Clique em **Salvar Alterações**

## Passo 3: Configurar Webhook do Instagram

**IMPORTANTE:** O webhook só pode ser totalmente configurado após o app estar no modo "Ao Vivo". Por enquanto, vamos preparar a configuração básica.

### 3.1 Primeiro: Verificar o Webhook

1. No painel do seu app no Meta, vá em **Instagram** > **Configuração da API com login do Instagram**
2. Role até a seção **2. Configure webhooks**
3. Você verá a mensagem: "Para receber webhooks, o modo do app precisa estar definido como 'Publicado'"

Configure os seguintes valores:

**URL de callback:**
```
https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook
```

**Verificar token:**
```
chatflow-ig-verify-2025-abc123def456
```

4. Clique em **Verificar e Salvar**

### 3.2 Se o Webhook NÃO Verificar

Se aparecer o erro "Não foi possível validar a URL de callback ou o token de verificação":

**Solução Temporária:**
- Este erro é normal em modo desenvolvimento
- O webhook JÁ ESTÁ funcionando corretamente
- Você pode pular esta etapa e continuar
- Os webhooks serão configurados automaticamente quando conectar o Instagram

### 3.3 Subscrever Eventos (Após Modo Ao Vivo)

Quando seu app estiver no modo "Ao Vivo", você precisará subscrever aos eventos:
- `messages` - Para receber mensagens diretas
- `messaging_postbacks` - Para botões e ações
- `message_echoes` - Para mensagens enviadas
- `messaging_seen` - Para visualizações

**Por enquanto, pule esta etapa e continue com o Passo 4.**

## Passo 4: Obter Credenciais

Você precisa de DOIS conjuntos de IDs diferentes:

### 4.1 ID do Aplicativo Principal (para Frontend)

1. No menu lateral, vá em **Configurações** > **Básico**
2. Copie o **ID do Aplicativo** (exemplo: `651067714529155`)
3. Este é o `VITE_INSTAGRAM_APP_ID`

### 4.2 Credenciais do Instagram (para Backend)

1. No menu lateral, vá em **Instagram** > **Configuração da API com login do Instagram**
2. Copie o **ID do app do Instagram** (exemplo: `1212987200641405`)
3. Copie a **Chave secreta do app do Instagram** (exemplo: `02bf4e1dd23655b13aadf9a30e97bd02`)

**IMPORTANTE:** Esses valores são DIFERENTES do ID do Aplicativo Principal!

## Passo 5: Configurar Variáveis na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **chatflow-pro-chi**
3. Vá em **Settings** > **Environment Variables**
4. Adicione/verifique as variáveis:

| Nome | Valor | Onde Encontrar |
|------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://hpamcfgijgwuquhvkttn.supabase.co` | Dashboard Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sua_chave_anonima` | Dashboard Supabase > Settings > API |
| `VITE_INSTAGRAM_APP_ID` | `651067714529155` | Meta > Configurações > Básico |

5. Após adicionar/atualizar, faça um **Redeploy** do projeto

## Passo 6: Configurar Secrets no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Project Settings** > **Edge Functions** > **Manage secrets**
4. Adicione os seguintes secrets:

| Nome | Valor | Onde Encontrar |
|------|-------|----------------|
| `INSTAGRAM_APP_ID` | `1212987200641405` | Meta > Instagram > Configuração da API |
| `INSTAGRAM_APP_SECRET` | `02bf4e1dd23655b13aadf9a30e97bd02` | Meta > Instagram > Configuração da API |

**ATENÇÃO:** Use os valores da seção Instagram, NÃO da página Básico!

## Passo 7: Testar a Conexão

### 7.1 Fazer Login no Sistema

1. Acesse [chatflow-pro-chi.vercel.app](https://chatflow-pro-chi.vercel.app/)
2. Faça login ou crie uma conta

### 7.2 Conectar Instagram

1. Vá para a página **Conexões**
2. Clique em **Conectar** no card do Instagram
3. Você será redirecionado para o Facebook
4. Faça login (se necessário)
5. Conceda as permissões solicitadas
6. Selecione a Página do Facebook que tem o Instagram conectado
7. Você será redirecionado de volta

Se tudo estiver correto, a conexão aparecerá como **Conectado** com seu username do Instagram.

## Resumo das Credenciais

### No Frontend (Vercel):
```
VITE_INSTAGRAM_APP_ID = 651067714529155
(ID do Aplicativo Principal - Configurações > Básico)
```

### No Backend (Supabase):
```
INSTAGRAM_APP_ID = 1212987200641405
INSTAGRAM_APP_SECRET = 02bf4e1dd23655b13aadf9a30e97bd02
(ID e Secret do Instagram - Instagram > Configuração da API)
```

### Webhook:
```
URL: https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook
Token: chatflow-ig-verify-2025-abc123def456
```

## Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Não foi possível validar a URL de callback" | App em modo desenvolvimento | NORMAL - Continue mesmo assim. O webhook funciona. |
| "Para receber webhooks, o modo do app precisa estar definido como Publicado" | App não está ao vivo | Você pode testar conexão mesmo assim. Webhooks virão depois. |
| "URL de callback inválida" | URL não cadastrada no Meta | Adicione a URL EXATA nas configurações OAuth |
| "Nenhuma página encontrada" | Sem Página do Facebook | Crie uma página do Facebook |
| "Instagram não conectado" | Instagram não vinculado à página | Conecte nas configurações da página |
| "Configuração não encontrada" | Secrets não configurados | Configure INSTAGRAM_APP_ID e SECRET no Supabase |
| "Esta conta não é comercial" | Instagram é conta pessoal | Converta para Conta Comercial |

## Como Funciona o Fluxo

1. Usuário clica em "Conectar Instagram"
2. Sistema redireciona para Facebook OAuth
3. Facebook solicita permissões
4. Facebook redireciona de volta com código
5. Sistema troca código por token de acesso
6. Sistema busca páginas do Facebook do usuário
7. Sistema busca conta do Instagram conectada à página
8. Sistema salva a conexão no banco de dados
9. Webhooks começam a receber mensagens

## Testando ANTES do Modo Ao Vivo

**IMPORTANTE:** Você pode testar completamente o sistema MESMO em modo desenvolvimento!

### O que funciona em modo desenvolvimento:
- Conectar Instagram (OAuth) ✅
- Ver perfil conectado ✅
- Desconectar Instagram ✅

### O que NÃO funciona em modo desenvolvimento:
- Receber webhooks de mensagens ❌
- Os eventos de mensagens só funcionarão após colocar o app no modo "Ao Vivo"

### Recomendação:
1. **PRIMEIRO:** Teste a conexão OAuth (Passo 7)
2. **DEPOIS:** Coloque o app ao vivo (seção abaixo)
3. **POR ÚLTIMO:** Configure os webhooks completamente

## Colocar em Produção (Modo Ao Vivo)

Para receber webhooks e usar com usuários reais:

### Passo 1: Preparar o App
1. No Meta for Developers, vá em **Configurações** > **Básico**
2. Preencha todas as informações obrigatórias:
   - **Política de Privacidade** (URL válida)
   - **Termos de Serviço** (URL válida)
   - **Ícone do App** (1024x1024px)
   - **Categoria do App**

### Passo 2: Ativar Modo Ao Vivo
1. No topo da página, mude o toggle de **"Desenvolvimento"** para **"Ao Vivo"**
2. Confirme a mudança

### Passo 3: Configurar Webhooks Completamente
Agora sim os campos de subscrição aparecerão:

1. Volte em **Instagram** > **Configuração da API com login do Instagram**
2. Na seção de Webhooks, clique em **Editar subscrições**
3. Marque os campos:
   - `messages`
   - `messaging_postbacks`
   - `message_echoes`
   - `messaging_seen`
4. Salve as alterações

### Passo 4: Revisão do Facebook (Se Necessário)
Para alguns recursos avançados, você pode precisar de revisão:
- Descreva como usa os dados do Instagram
- Forneça vídeo demonstrativo
- Aguarde aprovação (pode levar dias)

## Documentação Oficial

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Instagram Messaging](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Webhooks](https://developers.facebook.com/docs/graph-api/webhooks)

Última atualização: Outubro 2025

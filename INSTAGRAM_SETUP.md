# Guia de Configuração do Instagram via Business Manager

Este guia mostra como conectar o Instagram ao ChatFlow Pro usando o Business Manager do Facebook.

## Requisitos Obrigatórios

1. Conta do Facebook
2. Business Manager (Meta Business Suite)
3. Conta Comercial do Instagram
4. App no Meta for Developers

## Passo 1: Criar/Acessar Business Manager

### 1.1 Criar Business Manager

Se você ainda não tem um Business Manager:

1. Acesse [business.facebook.com](https://business.facebook.com/)
2. Clique em **Criar conta**
3. Preencha as informações:
   - Nome da empresa
   - Seu nome
   - Email comercial
4. Clique em **Avançar** e complete o cadastro

### 1.2 Acessar Business Manager Existente

Se você já tem um Business Manager:

1. Acesse [business.facebook.com](https://business.facebook.com/)
2. Faça login com sua conta do Facebook
3. Selecione o Business Manager desejado

## Passo 2: Adicionar Conta do Instagram ao Business Manager

### 2.1 Verificar se seu Instagram é Comercial

Antes de adicionar ao BM, seu Instagram precisa ser uma conta comercial:

1. Abra o app do Instagram
2. Vá em **Configurações** > **Tipo de conta e ferramentas**
3. Se aparecer **Mudar para conta pessoal**, sua conta já é comercial
4. Se não for comercial, toque em **Mudar para conta profissional** e escolha **Empresa**

### 2.2 Adicionar Instagram ao Business Manager

1. No Business Manager, vá em **Configurações da empresa** (ícone de engrenagem no canto superior esquerdo)
2. No menu lateral, clique em **Contas** > **Contas do Instagram**
3. Clique em **Adicionar**
4. Escolha uma das opções:
   - **Adicionar uma conta do Instagram**: Se você é o proprietário
   - **Solicitar acesso a uma conta do Instagram**: Se outra pessoa é proprietária
5. Para adicionar sua própria conta:
   - Clique em **Conectar seu Instagram**
   - Faça login na sua conta do Instagram
   - Autorize a conexão com o Business Manager
6. A conta aparecerá na lista de Contas do Instagram

## Passo 3: Adicionar Usuário do Sistema no Business Manager

Você precisa criar um usuário do sistema para gerar tokens de acesso permanentes.

### 3.1 Criar Usuário do Sistema

1. No Business Manager, vá em **Configurações da empresa**
2. No menu lateral, clique em **Usuários** > **Usuários do sistema**
3. Clique em **Adicionar**
4. Preencha:
   - **Nome**: ChatFlow Instagram Bot (ou qualquer nome descritivo)
   - **Função**: Administrador (ou conforme necessário)
5. Clique em **Criar usuário do sistema**

### 3.2 Gerar Token de Acesso

1. Clique no usuário do sistema recém-criado
2. Clique em **Gerar novo token**
3. Selecione o aplicativo (você criará isso no próximo passo)
4. Selecione as permissões necessárias:
   - `business_management`
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`
   - `pages_show_list`
   - `pages_read_engagement`
5. Defina a validade do token:
   - **60 dias** (recomendado para produção)
   - **Nunca expira** (apenas para desenvolvimento)
6. Clique em **Gerar token**
7. **IMPORTANTE**: Copie e guarde o token em local seguro. Ele não será exibido novamente.

### 3.3 Adicionar Ativos ao Usuário do Sistema

1. Na página do usuário do sistema, role até **Atribuir ativos**
2. Clique em **Adicionar ativos**
3. Selecione **Contas do Instagram**
4. Marque a conta do Instagram que você adicionou
5. Selecione as permissões:
   - **Gerenciar conta**: Ativado
   - **Criar conteúdo**: Ativado
   - **Gerenciar mensagens**: Ativado
6. Clique em **Salvar alterações**

## Passo 4: Criar App no Meta for Developers

### 4.1 Criar o Aplicativo

1. Acesse [developers.facebook.com](https://developers.facebook.com/)
2. Clique em **Meus Aplicativos** > **Criar Aplicativo**
3. Escolha **Empresa** como tipo de uso
4. Preencha:
   - **Nome do Aplicativo**: ChatFlow Pro (ou seu nome)
   - **Email de contato**: seu email
   - **Conta do Business Manager**: Selecione seu BM
5. Clique em **Criar Aplicativo**

### 4.2 Adicionar Produto Instagram

1. No painel do app, localize **Instagram** na seção "Adicionar produtos"
2. Clique em **Configurar**
3. Aguarde a instalação completar

### 4.3 Configurar Instagram Graph API

1. No menu lateral, clique em **Instagram** > **Configuração da API com login do Instagram**

2. Configure as **URLs de Redirecionamento OAuth válidas**:
```
https://chatflow-pro-chi.vercel.app/auth/instagram/callback
http://localhost:5173/auth/instagram/callback
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

## Passo 5: Configurar Webhook do Instagram

### 5.1 Configurar Callback do Webhook

1. No painel do app, vá em **Instagram** > **Configuração da API com login do Instagram**
2. Role até a seção **Webhooks**
3. Clique em **Editar**

Configure os seguintes valores:

**URL de callback:**
```
https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook
```

**Token de verificação:**
```
chatflow-ig-verify-2025-abc123def456
```

4. Clique em **Verificar e Salvar**

### 5.2 Subscrever Eventos

Na mesma página de Webhooks:

1. Clique em **Editar subscrições**
2. Marque os seguintes eventos:
   - `messages` - Para receber mensagens diretas
   - `messaging_postbacks` - Para botões e ações
   - `message_echoes` - Para mensagens enviadas
   - `messaging_seen` - Para visualizações
3. Clique em **Salvar**

## Passo 6: Obter Credenciais

Você precisa de DOIS conjuntos de IDs diferentes:

### 6.1 ID do Aplicativo Principal (para Frontend)

1. No menu lateral, vá em **Configurações** > **Básico**
2. Copie o **ID do Aplicativo** (exemplo: `651067714529155`)
3. Este é o `VITE_INSTAGRAM_APP_ID`

### 6.2 Credenciais do Instagram (para Backend)

1. No menu lateral, vá em **Instagram** > **Configuração da API com login do Instagram**
2. Copie o **ID do app do Instagram** (exemplo: `1212987200641405`)
3. Copie a **Chave secreta do app do Instagram** (exemplo: `02bf4e1dd23655b13aadf9a30e97bd02`)

**IMPORTANTE:** Esses valores são DIFERENTES do ID do Aplicativo Principal!

## Passo 7: Configurar Variáveis no Projeto

### 7.1 Variáveis no Frontend (Vercel/Local)

No arquivo `.env` do projeto, configure:

```env
VITE_SUPABASE_URL=https://hpamcfgijgwuquhvkttn.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_INSTAGRAM_APP_ID=651067714529155
```

### 7.2 Secrets no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Project Settings** > **Edge Functions** > **Manage secrets**
4. Adicione os seguintes secrets:

```
INSTAGRAM_APP_ID=1212987200641405
INSTAGRAM_APP_SECRET=02bf4e1dd23655b13aadf9a30e97bd02
```

**ATENÇÃO:** Use os valores da seção Instagram, NÃO da página Básico!

## Passo 8: Testar a Conexão

### 8.1 Fazer Login no Sistema

1. Acesse seu ChatFlow Pro
2. Faça login ou crie uma conta

### 8.2 Conectar Instagram

1. Vá para a página **Conexões**
2. Clique em **Conectar** no card do Instagram
3. Você será redirecionado para o Facebook
4. Faça login (se necessário)
5. Conceda as permissões solicitadas ao Business Manager
6. Você será redirecionado de volta

Se tudo estiver correto, a conexão aparecerá como **Conectado** com seu username do Instagram.

## Resumo das Credenciais

### No Frontend:
```
VITE_INSTAGRAM_APP_ID = ID do Aplicativo (Configurações > Básico)
```

### No Backend (Supabase):
```
INSTAGRAM_APP_ID = ID do App do Instagram
INSTAGRAM_APP_SECRET = Chave Secreta do App do Instagram
```

### Webhook:
```
URL: https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook
Token: chatflow-ig-verify-2025-abc123def456
```

## Como Funciona o Novo Fluxo (via BM)

1. Usuário clica em "Conectar Instagram"
2. Sistema redireciona para Facebook OAuth com permissão de Business Manager
3. Facebook solicita permissões e acesso ao Business Manager
4. Facebook redireciona de volta com código
5. Sistema troca código por token de acesso
6. Sistema busca Business Managers do usuário
7. Sistema busca contas do Instagram no Business Manager
8. Sistema salva a conexão com token do usuário do sistema
9. Webhooks começam a receber mensagens

## Vantagens da Conexão via Business Manager

1. **Tokens mais duradouros**: Tokens de usuário do sistema podem durar 60 dias ou nunca expirar
2. **Melhor controle de permissões**: Gerenciamento centralizado no BM
3. **Múltiplas contas**: Fácil adicionar múltiplas contas do Instagram
4. **Ambiente profissional**: Estrutura adequada para uso empresarial
5. **Segurança aprimorada**: Controle granular de acesso e permissões

## Possíveis Erros e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Nenhum Business Manager encontrado" | Usuário não tem BM | Criar Business Manager no business.facebook.com |
| "Nenhuma conta do Instagram encontrada no BM" | Instagram não adicionado ao BM | Adicionar conta do Instagram em Configurações > Contas |
| "Erro ao obter token" | Credenciais incorretas | Verificar INSTAGRAM_APP_ID e SECRET |
| "Permissões insuficientes" | Usuário do sistema sem permissões | Adicionar permissões ao usuário do sistema |
| "Esta conta não é comercial" | Instagram é conta pessoal | Converter para Conta Comercial |
| "Token expirado" | Token do usuário do sistema expirou | Gerar novo token no BM |

## Renovação de Token

Para renovar o token de acesso:

1. Acesse Business Manager > Usuários do sistema
2. Selecione o usuário do sistema
3. Clique em **Gerar novo token**
4. Siga os mesmos passos do Passo 3.2
5. Atualize o token na aplicação

## Colocar em Produção (Modo Ao Vivo)

### Passo 1: Completar Informações do App

1. No Meta for Developers, vá em **Configurações** > **Básico**
2. Preencha todas as informações obrigatórias:
   - **Política de Privacidade** (URL válida)
   - **Termos de Serviço** (URL válida)
   - **Ícone do App** (1024x1024px)
   - **Categoria do App**

### Passo 2: Ativar Modo Ao Vivo

1. No topo da página, mude o toggle de **Desenvolvimento** para **Ao Vivo**
2. Confirme a mudança
3. Webhooks agora funcionarão em produção

### Passo 3: Revisão do Facebook (Se Necessário)

Para alguns recursos avançados:

1. Vá em **Revisão de app**
2. Solicite as permissões necessárias:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`
3. Forneça:
   - Descrição de como usa os dados
   - Vídeo demonstrativo
   - Casos de uso
4. Aguarde aprovação (pode levar alguns dias)

## Documentação Oficial

- [Business Manager](https://business.facebook.com/business/help)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Usuários do Sistema](https://developers.facebook.com/docs/development/build-and-test/system-users)
- [Instagram Messaging](https://developers.facebook.com/docs/instagram-api/guides/messaging)

## Diferenças entre Conexão por App e por BM

| Aspecto | Via App Developers | Via Business Manager |
|---------|-------------------|---------------------|
| Configuração | Mais simples | Mais completa |
| Tokens | 60 dias (padrão) | 60 dias ou nunca expira |
| Gerenciamento | Por app | Centralizado no BM |
| Múltiplas contas | Difícil | Fácil |
| Uso empresarial | Limitado | Recomendado |
| Permissões | Por página | Por Business Manager |

Última atualização: Outubro 2025

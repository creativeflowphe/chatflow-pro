# ChatFlow Pro

Uma plataforma completa de automação de chat para redes sociais, similar ao ManyChat. Automatize conversas no Instagram, Facebook Messenger, WhatsApp e TikTok.

## 🚀 Funcionalidades

### ✅ Implementado

- **Autenticação Completa**: Login/Registro com email e senha via Supabase Auth
- **Dashboard**: Visão geral com estatísticas de contatos, automações ativas e conversas
- **Gerenciamento de Contatos**: Lista, busca, tags e histórico de interações
- **Automações**:
  - Listagem de automações com filtros
  - Editor visual de fluxos (Flow Builder) com React Flow
  - Tipos: Resposta automática, Sequências, Regras personalizadas
  - Paleta de nós: Triggers, Mensagens, Condições, Ações
- **Chat ao Vivo**: Inbox unificado com conversas de todas as conexões
- **Disparo de Mensagens**: Broadcasting com segmentação por tags
- **Conexões**: Integração com Instagram, Facebook, WhatsApp, TikTok (OAuth stubs)
- **Configurações**: Perfil, planos (free/pro), idioma

### 🎨 Design

- Interface em **português (PT-BR)**
- Tema **azul e branco** clean e moderno (inspirado no ManyChat)
- **Totalmente responsivo** (desktop e mobile)
- Ícones do Lucide React
- Tailwind CSS para estilização

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Roteamento**: React Router DOM
- **UI**: Tailwind CSS + Lucide React Icons
- **Flow Editor**: React Flow (editor visual drag-and-drop)
- **Backend**: Supabase (Database + Auth)
- **Database**: PostgreSQL (via Supabase)

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

O arquivo `.env` já está configurado com as credenciais do Supabase.

### 3. Criar as tabelas no banco de dados

Execute o seguinte SQL no **Supabase SQL Editor**:

```sql
-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar seu próprio perfil"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tabela de conexões (integrações)
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'whatsapp', 'tiktok')),
  account_name text NOT NULL,
  access_token text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar suas próprias conexões"
  ON connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conexões"
  ON connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conexões"
  ON connections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias conexões"
  ON connections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connection_id uuid REFERENCES connections(id) ON DELETE SET NULL,
  name text NOT NULL,
  platform_id text NOT NULL,
  tags text[] DEFAULT '{}',
  last_interaction timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar seus próprios contatos"
  ON contacts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios contatos"
  ON contacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios contatos"
  ON contacts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios contatos"
  ON contacts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de automações
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('message_response', 'sequence', 'custom_rules')),
  trigger_type text NOT NULL,
  flow_data jsonb DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  status text DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  runs integer DEFAULT 0,
  ctr numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar suas próprias automações"
  ON automations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias automações"
  ON automations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias automações"
  ON automations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias automações"
  ON automations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  connection_id uuid REFERENCES connections(id) ON DELETE SET NULL,
  status text DEFAULT 'bot' CHECK (status IN ('bot', 'human', 'closed')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar suas próprias conversas"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conversas"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conversas"
  ON conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('bot', 'human', 'contact')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar mensagens de suas conversas"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir mensagens em suas conversas"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Tabela de broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  segment_tags text[] DEFAULT '{}',
  scheduled_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  sent_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar seus próprios broadcasts"
  ON broadcasts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios broadcasts"
  ON broadcasts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios broadcasts"
  ON broadcasts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios broadcasts"
  ON broadcasts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_user_id ON broadcasts(user_id);
```

### 4. (Opcional) Adicionar dados de exemplo

Para popular o banco com dados de exemplo, consulte o arquivo `seed-data.sql` e execute-o no Supabase SQL Editor, substituindo `YOUR_USER_ID` pelo seu ID de usuário.

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📱 Como Usar

### 1. Criar Conta

- Acesse a tela de login
- Clique em "Não tem conta? Criar uma"
- Preencha nome, email e senha
- Faça login

### 2. Conectar Redes Sociais

- Vá em **Conexões** no menu lateral
- Clique em uma das plataformas (Instagram, Facebook, WhatsApp, TikTok)
- Digite o nome da conta (é uma demonstração, OAuth real não está implementado)
- Clique em "Conectar"

### 3. Criar Automação

- Clique no botão **"Nova Automação"** no header (azul, canto superior direito)
- Escolha o tipo:
  - **Responder Mensagens**: Para responder keywords específicas
  - **Sequência Automática**: Para enviar mensagens em sequência com delays
  - **Regras Personalizadas**: Para lógica avançada com condições
- Digite um nome e descrição
- Clique em "Criar Automação"

### 4. Editar Flow (Editor Visual)

Você será redirecionado para o **Flow Builder**:

- **Arraste nós** da paleta lateral direita para o canvas
- **Conecte nós** clicando e arrastando dos conectores (círculos)
- Tipos de nós disponíveis:
  - 🔷 **Gatilhos** (azul): Quando iniciar o fluxo (ex: mensagem recebida)
  - 🟢 **Mensagens** (verde): Enviar mensagem com texto/botões
  - 🟡 **Condições** (amarelo): If/else para ramificar o fluxo
  - 🟣 **Ações** (roxo): Adicionar tag, chamar API, iniciar sequência
- Clique em **"Publicar"** para salvar
- Toggle **"Ativo/Inativo"** para ativar a automação

### 5. Chat ao Vivo

- Vá em **Chat ao Vivo** no menu
- Veja todas as conversas ativas
- Clique em uma conversa para ver mensagens
- Envie respostas manuais (handoff de bot para humano)

### 6. Disparo de Mensagens

- Vá em **Disparo de Mensagens**
- Clique em **"Novo Disparo"**
- Digite nome e mensagem
- (Opcional) Segmente por tags (ex: "cliente-vip, interessado")
- Clique em "Criar Disparo"
- Use "Enviar Agora" para disparar

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx          # Tela de login/registro
│   ├── automations/
│   │   └── NewAutomationModal.tsx # Modal para criar automação
│   ├── flow/
│   │   ├── nodes/                 # Componentes de nós do flow
│   │   │   ├── TriggerNode.tsx
│   │   │   ├── MessageNode.tsx
│   │   │   ├── ConditionNode.tsx
│   │   │   └── ActionNode.tsx
│   │   └── NodePalette.tsx        # Paleta lateral de nós
│   └── layout/
│       ├── Header.tsx             # Header fixo
│       ├── Sidebar.tsx            # Menu lateral
│       └── Layout.tsx             # Layout wrapper
├── contexts/
│   └── AuthContext.tsx            # Context de autenticação
├── lib/
│   └── supabase.ts                # Cliente Supabase + types
├── pages/
│   ├── Dashboard.tsx              # Home com stats
│   ├── Contacts.tsx               # Lista de contatos
│   ├── Automations.tsx            # Lista de automações
│   ├── FlowEditor.tsx             # Editor visual de fluxos
│   ├── Chat.tsx                   # Chat ao vivo
│   ├── Broadcasts.tsx             # Disparo de mensagens
│   ├── Connections.tsx            # Integrações
│   └── Settings.tsx               # Configurações
├── App.tsx                        # Rotas principais
├── main.tsx                       # Entry point
└── index.css                      # Estilos globais
```

## 🎯 Próximos Passos (Sugestões)

- **Webhooks reais**: Integrar com Meta Graph API, WhatsApp Business API
- **Processamento de flows**: Backend para executar automações
- **Analytics**: Gráficos de performance, taxa de conversão
- **Templates**: Biblioteca de automações prontas
- **IA/NLP**: Processar intenções de mensagens
- **Testes A/B**: Testar variações de mensagens
- **Integração com CRM**: Zapier, Make, n8n

## 📄 Licença

Projeto de demonstração - uso livre.

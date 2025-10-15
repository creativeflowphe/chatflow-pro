/*
  # Estrutura Completa do Banco de Dados - Sistema de Automação de Redes Sociais

  ## Resumo
  Criação da estrutura completa do banco de dados para sistema de automação de mensagens em redes sociais.
  
  ## 1. Novas Tabelas
  
  ### `connections`
  Armazena conexões com redes sociais (Instagram, Facebook, WhatsApp, etc.)
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `platform` (text) - nome da rede social
  - `platform_user_id` (text) - ID do usuário na plataforma
  - `platform_username` (text) - username na plataforma
  - `access_token` (text) - token de acesso
  - `refresh_token` (text) - token de refresh
  - `token_expires_at` (timestamptz) - expiração do token
  - `is_active` (boolean) - se a conexão está ativa
  - `metadata` (jsonb) - dados adicionais da conexão
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `automations`
  Armazena automações criadas pelos usuários
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `name` (text) - nome da automação
  - `description` (text) - descrição
  - `flow_data` (jsonb) - estrutura completa do fluxo
  - `selected_platforms` (jsonb) - redes sociais selecionadas
  - `is_active` (boolean) - se está ativa
  - `trigger_type` (text) - tipo de gatilho
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `contacts`
  Armazena contatos/leads capturados
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `platform` (text) - plataforma de origem
  - `platform_user_id` (text) - ID na plataforma
  - `username` (text) - username do contato
  - `full_name` (text) - nome completo
  - `email` (text) - email
  - `phone` (text) - telefone
  - `tags` (jsonb) - tags/etiquetas
  - `custom_fields` (jsonb) - campos personalizados
  - `last_interaction` (timestamptz) - última interação
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `keywords`
  Armazena palavras-chave para automações
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `automation_id` (uuid, referência para automations)
  - `keyword` (text) - palavra-chave
  - `response_type` (text) - tipo de resposta
  - `response_content` (jsonb) - conteúdo da resposta
  - `is_active` (boolean) - se está ativa
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `messages`
  Armazena mensagens enviadas e recebidas
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `contact_id` (uuid, referência para contacts)
  - `automation_id` (uuid, referência para automations, nullable)
  - `platform` (text) - plataforma
  - `direction` (text) - 'inbound' ou 'outbound'
  - `content` (text) - conteúdo da mensagem
  - `metadata` (jsonb) - metadados
  - `status` (text) - status da mensagem
  - `created_at` (timestamptz)
  
  ### `broadcasts`
  Armazena campanhas de broadcast
  - `id` (uuid, primary key)
  - `user_id` (uuid, referência para auth.users)
  - `name` (text) - nome da campanha
  - `platforms` (jsonb) - plataformas selecionadas
  - `message_content` (text) - conteúdo da mensagem
  - `target_contacts` (jsonb) - contatos alvo
  - `status` (text) - status da campanha
  - `scheduled_at` (timestamptz) - agendamento
  - `sent_at` (timestamptz) - quando foi enviado
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## 2. Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por usuário autenticado
  - Cada usuário acessa apenas seus próprios dados
  
  ## 3. Índices
  - Índices em colunas de busca frequente
  - Otimização para queries por user_id
  - Índices em campos de relacionamento
*/

-- Criar tabela de conexões
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_user_id text NOT NULL,
  platform_username text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de automações
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  flow_data jsonb DEFAULT '{}'::jsonb,
  selected_platforms jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT false,
  trigger_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_user_id text NOT NULL,
  username text,
  full_name text,
  email text,
  phone text,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  last_interaction timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- Criar tabela de palavras-chave
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_id uuid REFERENCES automations(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  response_type text DEFAULT 'text',
  response_content jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  automation_id uuid REFERENCES automations(id) ON DELETE SET NULL,
  platform text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  platforms jsonb DEFAULT '[]'::jsonb,
  message_content text NOT NULL,
  target_contacts jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Políticas para connections
CREATE POLICY "Usuários podem ver suas próprias conexões"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias conexões"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias conexões"
  ON connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias conexões"
  ON connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para automations
CREATE POLICY "Usuários podem ver suas próprias automações"
  ON automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias automações"
  ON automations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias automações"
  ON automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias automações"
  ON automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para contacts
CREATE POLICY "Usuários podem ver seus próprios contatos"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios contatos"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios contatos"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios contatos"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para keywords
CREATE POLICY "Usuários podem ver suas próprias palavras-chave"
  ON keywords FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias palavras-chave"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias palavras-chave"
  ON keywords FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias palavras-chave"
  ON keywords FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para messages
CREATE POLICY "Usuários podem ver suas próprias mensagens"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias mensagens"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias mensagens"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias mensagens"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para broadcasts
CREATE POLICY "Usuários podem ver seus próprios broadcasts"
  ON broadcasts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios broadcasts"
  ON broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios broadcasts"
  ON broadcasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios broadcasts"
  ON broadcasts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_platform ON connections(platform);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_platform ON contacts(platform);
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_automation_id ON keywords(automation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_contact_id ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_user_id ON broadcasts(user_id);
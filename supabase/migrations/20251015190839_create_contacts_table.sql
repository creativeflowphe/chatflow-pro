/*
  # Criação da Tabela de Contatos

  1. Nova Tabela
    - `contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `name` (text) - nome do contato
      - `phone` (text) - telefone do contato
      - `email` (text) - email do contato
      - `platform` (text) - plataforma de origem: instagram, whatsapp, facebook, tiktok
      - `platform_user_id` (text) - ID do usuário na plataforma
      - `connection_id` (uuid) - referência para a conexão
      - `tags` (text[]) - array de tags para categorização
      - `notes` (text) - notas sobre o contato
      - `metadata` (jsonb) - dados adicionais
      - `last_interaction` (timestamptz) - última interação
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Políticas para usuários autenticados acessarem apenas seus próprios contatos
    - Índices para otimização de queries
    - Constraint único para evitar duplicação

  3. Importantes Notas
    - Campo tags permite categorização flexível
    - metadata armazena dados específicos da plataforma
    - Índices para busca rápida por nome, telefone e tags
    - connection_id vincula o contato à conexão da plataforma
*/

-- Criar tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES connections(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  platform text CHECK (platform IN ('instagram', 'whatsapp', 'facebook', 'tiktok', 'other')),
  platform_user_id text,
  tags text[] DEFAULT ARRAY[]::text[],
  notes text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  last_interaction timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_connection_id ON contacts(connection_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_platform ON contacts(platform);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction ON contacts(last_interaction DESC);

-- Habilitar RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
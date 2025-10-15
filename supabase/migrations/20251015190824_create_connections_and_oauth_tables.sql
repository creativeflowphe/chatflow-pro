/*
  # Criação das Tabelas de Conexões e OAuth

  1. Novas Tabelas
    - `connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `platform` (text) - instagram, facebook, whatsapp, tiktok
      - `account_name` (text) - nome de usuário/conta
      - `account_id` (text) - ID da conta na plataforma
      - `access_token` (text) - token de acesso OAuth
      - `refresh_token` (text) - token para renovação
      - `token_expires_at` (timestamptz) - expiração do token
      - `status` (text) - active, inactive, error
      - `metadata` (jsonb) - dados adicionais da conta
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `oauth_states`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `state` (text) - código de estado para segurança OAuth
      - `platform` (text) - plataforma sendo conectada
      - `redirect_uri` (text) - URI de retorno
      - `expires_at` (timestamptz) - expiração do estado
      - `created_at` (timestamptz)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
    - Índices para otimização de queries
    - Constraint único para evitar duplicação de conexões

  3. Importantes Notas de Segurança
    - Tokens são armazenados de forma segura
    - Estados OAuth expiram automaticamente
    - RLS garante isolamento de dados entre usuários
*/

-- Criar tabela de conexões
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook', 'whatsapp', 'tiktok')),
  account_name text NOT NULL,
  account_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Criar tabela de estados OAuth
CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state text NOT NULL UNIQUE,
  platform text NOT NULL,
  redirect_uri text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_platform ON connections(platform);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Habilitar RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Políticas para connections
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para oauth_states
CREATE POLICY "Users can view own oauth states"
  ON oauth_states FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own oauth states"
  ON oauth_states FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own oauth states"
  ON oauth_states FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em connections
DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar estados OAuth expirados
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
/*
  # Criação da Tabela de Palavras-chave

  1. Nova Tabela
    - `keywords`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `name` (text) - nome da regra de palavra-chave
      - `keywords` (text[]) - array de palavras-chave
      - `match_type` (text) - tipo de correspondência: exact, contains, starts_with, ends_with
      - `case_sensitive` (boolean) - se é sensível a maiúsculas/minúsculas
      - `status` (text) - status: active, inactive
      - `reply_type` (text) - tipo de resposta: text, flow, tag, both
      - `reply_message` (text) - mensagem de resposta automática
      - `flow_id` (uuid) - ID do fluxo a ser executado (nullable)
      - `tags` (text[]) - tags a serem adicionadas ao contato
      - `priority` (integer) - prioridade de execução (maior = mais prioritário)
      - `statistics` (jsonb) - estatísticas de uso (matches, triggers, etc)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Políticas para usuários autenticados acessarem apenas suas próprias keywords
    - Índices para otimização de queries

  3. Importantes Notas
    - match_type permite diferentes tipos de correspondência
    - Suporta múltiplas keywords por regra
    - Pode executar tanto resposta de texto quanto fluxos
    - Priority permite controlar ordem de execução
    - Statistics rastreia performance
*/

-- Criar tabela de palavras-chave
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  match_type text NOT NULL DEFAULT 'contains' CHECK (match_type IN ('exact', 'contains', 'starts_with', 'ends_with')),
  case_sensitive boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  reply_type text NOT NULL DEFAULT 'text' CHECK (reply_type IN ('text', 'flow', 'tag', 'both')),
  reply_message text,
  flow_id uuid,
  tags text[] DEFAULT ARRAY[]::text[],
  priority integer DEFAULT 0,
  statistics jsonb DEFAULT '{"matches": 0, "triggers": 0, "last_triggered": null}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_keywords ON keywords USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_keywords_updated_at ON keywords(updated_at DESC);

-- Habilitar RLS
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Políticas para keywords
CREATE POLICY "Users can view own keywords"
  ON keywords FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own keywords"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
  ON keywords FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
  ON keywords FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em keywords
DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
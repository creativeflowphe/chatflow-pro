/*
  # Criação da Tabela de Automações

  1. Nova Tabela
    - `automations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `name` (text) - nome da automação
      - `description` (text) - descrição da automação
      - `type` (text) - tipo: message_response, sequence, custom_rules
      - `trigger_type` (text) - tipo de trigger: message_received, sequence_start, custom
      - `flow_data` (jsonb) - dados do fluxo (nodes e edges do ReactFlow)
      - `status` (text) - status: active, inactive
      - `runs` (integer) - número de execuções
      - `ctr` (numeric) - taxa de conversão/cliques
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Políticas para usuários autenticados acessarem apenas suas próprias automações
    - Índices para otimização de queries

  3. Importantes Notas
    - Campo flow_data armazena a estrutura completa do fluxo visual
    - Status padrão é inactive para segurança
    - Trigger automático para atualizar updated_at
*/

-- Criar tabela de automações
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('message_response', 'sequence', 'custom_rules')),
  trigger_type text NOT NULL,
  flow_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  runs integer DEFAULT 0,
  ctr numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
CREATE INDEX IF NOT EXISTS idx_automations_type ON automations(type);
CREATE INDEX IF NOT EXISTS idx_automations_updated_at ON automations(updated_at DESC);

-- Habilitar RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Políticas para automations
CREATE POLICY "Users can view own automations"
  ON automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automations"
  ON automations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations"
  ON automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations"
  ON automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em automations
DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
/*
  # Criar Tabela de Perfis de Usuários

  ## Resumo
  Criação da tabela profiles para armazenar informações adicionais dos usuários como nome completo e plano.

  ## 1. Nova Tabela
  
  ### `profiles`
  Armazena informações de perfil dos usuários
  - `id` (uuid, primary key, referência para auth.users)
  - `full_name` (text) - nome completo do usuário
  - `plan` (text) - plano do usuário (free, pro, enterprise)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Segurança
  - RLS habilitado
  - Usuários podem ler apenas seu próprio perfil
  - Usuários podem atualizar apenas seu próprio perfil
  
  ## 3. Função de Trigger
  - Trigger para criar perfil automaticamente quando um usuário se registra
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
/*
# Create OAuth States Table

1. New Tables
  - `oauth_states`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to profiles)
    - `state` (text, unique)
    - `platform` (text)
    - `redirect_uri` (text)
    - `expires_at` (timestamp)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `oauth_states` table
  - Add policy for users to manage their own OAuth states
  - Add automatic cleanup of expired states

3. Indexes
  - Index on state for fast lookups
  - Index on expires_at for cleanup
*/

-- Create oauth_states table if it doesn't exist
CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  state text UNIQUE NOT NULL,
  platform text NOT NULL,
  redirect_uri text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '1 hour') NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own OAuth states"
  ON oauth_states
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);

-- Function to cleanup expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < now();
END;
$$;

-- Create a scheduled job to cleanup expired states (runs every hour)
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- SELECT cron.schedule('cleanup-oauth-states', '0 * * * *', 'SELECT cleanup_expired_oauth_states();');
-- Script para adicionar conexões de exemplo
-- Execute este SQL após fazer login no sistema

-- Substitua 'SEU_USER_ID_AQUI' pelo ID do seu usuário após o login
-- Você pode obter seu user_id fazendo login e verificando auth.users

INSERT INTO connections (user_id, platform, platform_user_id, platform_username, is_active, access_token, metadata)
VALUES
  (auth.uid(), 'instagram', 'ig_user_123456', 'seu_perfil_insta', true, 'fake_token_instagram', '{"followers": 1500, "connected_at": "2025-10-15T10:00:00Z"}'::jsonb),
  (auth.uid(), 'whatsapp', 'wa_user_123456', '+5511999999999', true, 'fake_token_whatsapp', '{"connected_at": "2025-10-15T10:00:00Z"}'::jsonb),
  (auth.uid(), 'facebook', 'fb_user_123456', 'seu_perfil_fb', true, 'fake_token_facebook', '{"friends": 850, "connected_at": "2025-10-15T10:00:00Z"}'::jsonb)
ON CONFLICT (user_id, platform, platform_user_id) DO NOTHING;

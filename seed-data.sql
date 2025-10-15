-- ChatFlow Pro - Dados de Exemplo
-- Execute este script no Supabase SQL Editor após criar um usuário

-- IMPORTANTE: Substitua 'YOUR_USER_ID' pelo ID do seu usuário após o registro
-- Você pode obter seu ID executando: SELECT id FROM auth.users WHERE email = 'seu@email.com';

-- Inserir perfil (se não existir)
-- INSERT INTO profiles (id, full_name, plan)
-- VALUES ('YOUR_USER_ID', 'Usuário Demo', 'free')
-- ON CONFLICT (id) DO NOTHING;

-- Exemplo de automação de boas-vindas
INSERT INTO automations (user_id, name, description, type, trigger_type, flow_data, status, runs, ctr)
VALUES (
  'YOUR_USER_ID',
  'Boas-vindas Automáticas',
  'Responde automaticamente quando o usuário diz "oi" ou "olá"',
  'message_response',
  'message_received',
  '{
    "nodes": [
      {
        "id": "1",
        "type": "trigger",
        "position": {"x": 100, "y": 100},
        "data": {
          "label": "Quando usuário envia mensagem",
          "keywords": ["oi", "olá", "ola", "hey"]
        }
      },
      {
        "id": "2",
        "type": "message",
        "position": {"x": 100, "y": 250},
        "data": {
          "label": "Mensagem de boas-vindas",
          "content": "Olá! 👋 Bem-vindo ao ChatFlow Pro! Como posso ajudar você hoje?",
          "buttons": ["Ver produtos", "Falar com atendente", "Mais informações"]
        }
      },
      {
        "id": "3",
        "type": "condition",
        "position": {"x": 100, "y": 450},
        "data": {
          "label": "Verificar resposta",
          "condition": "Se usuário clicou em botão"
        }
      },
      {
        "id": "4",
        "type": "message",
        "position": {"x": -100, "y": 650},
        "data": {
          "label": "Resposta: Ver produtos",
          "content": "Aqui estão nossos produtos disponíveis: [link]"
        }
      },
      {
        "id": "5",
        "type": "action_tag",
        "position": {"x": 300, "y": 650},
        "data": {
          "action": "Adicionar tag",
          "details": "cliente-interessado"
        }
      }
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep", "animated": true},
      {"id": "e2-3", "source": "2", "target": "3", "type": "smoothstep", "animated": true},
      {"id": "e3-4", "source": "3", "target": "4", "sourceHandle": "true", "type": "smoothstep"},
      {"id": "e3-5", "source": "3", "target": "5", "sourceHandle": "false", "type": "smoothstep"}
    ]
  }'::jsonb,
  'active',
  127,
  0.85
);

-- Exemplo de sequência de follow-up
INSERT INTO automations (user_id, name, description, type, trigger_type, flow_data, status, runs, ctr)
VALUES (
  'YOUR_USER_ID',
  'Sequência de Follow-up',
  'Envia mensagens de acompanhamento após 1 dia e 3 dias',
  'sequence',
  'sequence_start',
  '{
    "nodes": [
      {
        "id": "1",
        "type": "trigger",
        "position": {"x": 100, "y": 100},
        "data": {"label": "Iniciar sequência"}
      },
      {
        "id": "2",
        "type": "message",
        "position": {"x": 100, "y": 250},
        "data": {
          "content": "Obrigado pelo seu interesse! Tem alguma dúvida?",
          "delay": "Após 1 dia"
        }
      },
      {
        "id": "3",
        "type": "message",
        "position": {"x": 100, "y": 400},
        "data": {
          "content": "Ainda está interessado em nossos produtos? Temos uma oferta especial!",
          "delay": "Após 3 dias"
        }
      }
    ],
    "edges": [
      {"id": "e1-2", "source": "1", "target": "2", "type": "smoothstep", "animated": true},
      {"id": "e2-3", "source": "2", "target": "3", "type": "smoothstep", "animated": true}
    ]
  }'::jsonb,
  'inactive',
  45,
  0.62
);

-- Adicionar conexões de exemplo
INSERT INTO connections (user_id, platform, account_name, access_token, status)
VALUES
  ('YOUR_USER_ID', 'instagram', '@minha_empresa', 'stub_token_instagram', 'active'),
  ('YOUR_USER_ID', 'facebook', 'Minha Empresa', 'stub_token_facebook', 'active');

-- Adicionar contatos de exemplo
INSERT INTO contacts (user_id, connection_id, name, platform_id, tags, last_interaction)
SELECT
  'YOUR_USER_ID',
  c.id,
  'João Silva',
  'joao_silva_123',
  ARRAY['cliente-vip', 'interessado'],
  NOW() - INTERVAL '2 hours'
FROM connections c
WHERE c.user_id = 'YOUR_USER_ID' AND c.platform = 'instagram'
LIMIT 1;

INSERT INTO contacts (user_id, connection_id, name, platform_id, tags, last_interaction)
SELECT
  'YOUR_USER_ID',
  c.id,
  'Maria Santos',
  'maria_santos_456',
  ARRAY['lead'],
  NOW() - INTERVAL '1 day'
FROM connections c
WHERE c.user_id = 'YOUR_USER_ID' AND c.platform = 'facebook'
LIMIT 1;

INSERT INTO contacts (user_id, connection_id, name, platform_id, tags)
SELECT
  'YOUR_USER_ID',
  c.id,
  'Pedro Costa',
  'pedro_costa_789',
  ARRAY['novo']
FROM connections c
WHERE c.user_id = 'YOUR_USER_ID' AND c.platform = 'instagram'
LIMIT 1;

-- Adicionar conversas de exemplo
INSERT INTO conversations (user_id, contact_id, connection_id, status, last_message_at)
SELECT
  'YOUR_USER_ID',
  co.id,
  co.connection_id,
  'bot',
  NOW() - INTERVAL '1 hour'
FROM contacts co
WHERE co.user_id = 'YOUR_USER_ID' AND co.name = 'João Silva'
LIMIT 1;

-- Adicionar mensagens de exemplo
INSERT INTO messages (conversation_id, sender_type, content)
SELECT
  cv.id,
  'contact',
  'Oi, tudo bem?'
FROM conversations cv
JOIN contacts co ON cv.contact_id = co.id
WHERE co.user_id = 'YOUR_USER_ID' AND co.name = 'João Silva'
LIMIT 1;

INSERT INTO messages (conversation_id, sender_type, content, created_at)
SELECT
  cv.id,
  'bot',
  'Olá! 👋 Bem-vindo ao ChatFlow Pro! Como posso ajudar você hoje?',
  NOW() + INTERVAL '1 minute'
FROM conversations cv
JOIN contacts co ON cv.contact_id = co.id
WHERE co.user_id = 'YOUR_USER_ID' AND co.name = 'João Silva'
LIMIT 1;

-- Adicionar broadcast de exemplo
INSERT INTO broadcasts (user_id, name, content, segment_tags, status, sent_count)
VALUES (
  'YOUR_USER_ID',
  'Promoção de Lançamento',
  'Olá! Estamos com uma promoção especial de lançamento! 🎉 Aproveite 30% de desconto em todos os produtos. Use o cupom: LANCAMENTO30',
  ARRAY['cliente-vip', 'interessado'],
  'draft',
  0
);

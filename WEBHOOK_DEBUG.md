# Debug do Webhook Instagram - ChatFlow Pro

## Problemas Identificados e Soluções

### 1. **Webhook URL Correta**
```
https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook
```

### 2. **Token de Verificação**
```
chatflow-ig-verify-2025-abc123def456
```

### 3. **Configuração no Meta for Developers**

#### Passo 1: Verificar App Status
- Vá em **Meta for Developers** > Seu App
- Verifique se o app está em modo **"Desenvolvimento"** ou **"Ao Vivo"**

#### Passo 2: Configurar Webhook
1. Vá em **Instagram** > **Configuração da API com login do Instagram**
2. Na seção **"2. Configure webhooks"**:
   - **URL de callback**: `https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook`
   - **Verificar token**: `chatflow-ig-verify-2025-abc123def456`
3. Clique em **"Verificar e Salvar"**

#### Passo 3: Subscrever Eventos (Após Verificação)
Marque os seguintes eventos:
- ✅ `messages`
- ✅ `messaging_postbacks`
- ✅ `message_echoes`
- ✅ `messaging_seen`

### 4. **Testar Webhook Manualmente**

#### Teste de Verificação (GET):
```bash
curl "https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook?hub.mode=subscribe&hub.verify_token=chatflow-ig-verify-2025-abc123def456&hub.challenge=test123"
```

**Resposta esperada**: `test123`

#### Teste de Evento (POST):
```bash
curl -X POST "https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "test",
      "messaging": [{
        "sender": {"id": "test_user"},
        "recipient": {"id": "test_page"},
        "timestamp": 1234567890,
        "message": {
          "text": "Hello test"
        }
      }]
    }]
  }'
```

**Resposta esperada**: `EVENT_RECEIVED`

### 5. **Verificar Logs**

#### No Supabase:
1. Vá em **Edge Functions** > **instagram-webhook**
2. Clique na aba **"Logs"**
3. Verifique se há erros ou mensagens de debug

#### Logs Importantes:
- ✅ `Webhook verification attempt`
- ✅ `Webhook verified successfully`
- ✅ `Instagram webhook received`
- ❌ `Verification failed`
- ❌ `Webhook error`

### 6. **Possíveis Problemas e Soluções**

#### Problema: "Não foi possível validar a URL"
**Soluções:**
1. Verificar se a URL está correta
2. Verificar se o token está correto
3. Testar manualmente com curl
4. Verificar logs do Supabase

#### Problema: "App precisa estar no modo Publicado"
**Soluções:**
1. Para desenvolvimento: Ignore este erro, o webhook funciona mesmo assim
2. Para produção: Coloque o app no modo "Ao Vivo"

#### Problema: Webhook verifica mas não recebe eventos
**Soluções:**
1. Verificar se os eventos estão subscritos
2. Verificar se a conta do Instagram está conectada à página do Facebook
3. Verificar se a conta é Comercial/Criador

### 7. **Checklist de Verificação**

- [ ] URL do webhook está correta
- [ ] Token de verificação está correto
- [ ] App do Instagram está configurado
- [ ] Página do Facebook está conectada ao Instagram
- [ ] Conta do Instagram é Comercial/Criador
- [ ] Webhook foi verificado com sucesso
- [ ] Eventos estão subscritos
- [ ] Teste manual funciona
- [ ] Logs não mostram erros

### 8. **Próximos Passos**

Após o webhook funcionar:
1. Implementar processamento de mensagens
2. Conectar com automações do ChatFlow
3. Salvar mensagens no banco de dados
4. Processar palavras-chave
5. Executar fluxos de automação

### 9. **Comandos de Debug**

```bash
# Testar verificação
curl "https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook?hub.mode=subscribe&hub.verify_token=chatflow-ig-verify-2025-abc123def456&hub.challenge=CHALLENGE_ACCEPTED"

# Testar evento
curl -X POST "https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook" \
  -H "Content-Type: application/json" \
  -d '{"object":"instagram","entry":[{"messaging":[{"sender":{"id":"123"},"message":{"text":"test"}}]}]}'

# Verificar status da função
curl -I "https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook"
```

---

**Última atualização**: Janeiro 2025
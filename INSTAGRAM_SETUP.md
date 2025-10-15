# Configuração da Integração com Instagram

Este guia explica como configurar a integração OAuth do Instagram no seu sistema.

## Pré-requisitos

Para conectar contas do Instagram, você precisa criar um aplicativo no Meta for Developers.

## Passo 1: Criar Aplicativo no Meta for Developers

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Clique em "Meus Aplicativos" no canto superior direito
3. Clique em "Criar Aplicativo"
4. Selecione "Consumidor" como tipo de aplicativo
5. Preencha as informações:
   - Nome do Aplicativo: escolha um nome
   - Email de Contato: seu email
6. Clique em "Criar Aplicativo"

## Passo 2: Adicionar Produto Instagram Basic Display

1. No painel do aplicativo, procure por "Instagram Basic Display API"
2. Clique em "Configurar"
3. Role até "Configurações Básicas de Exibição"
4. Preencha os campos obrigatórios:
   - **Valid OAuth Redirect URIs**: `http://localhost:5173/auth/instagram/callback` (para desenvolvimento)
   - **Deauthorize Callback URL**: `http://localhost:5173/auth/deauthorize`
   - **Data Deletion Request URL**: `http://localhost:5173/auth/deletion`
5. Clique em "Salvar Alterações"

## Passo 3: Obter Credenciais

1. Vá para "Configurações Básicas" no menu lateral
2. Copie o "ID do Aplicativo" (App ID)
3. Clique em "Mostrar" no campo "Chave Secreta do Aplicativo" (App Secret) e copie o valor

## Passo 4: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
VITE_INSTAGRAM_APP_ID=seu_app_id_aqui
```

**IMPORTANTE**: Você também precisa configurar as variáveis secretas no Supabase:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em "Project Settings" > "Edge Functions"
4. Na seção "Secrets", adicione:
   - `INSTAGRAM_APP_ID`: o ID do seu aplicativo
   - `INSTAGRAM_APP_SECRET`: a chave secreta do seu aplicativo

## Passo 5: Adicionar Testadores (Modo de Desenvolvimento)

Enquanto seu aplicativo estiver em modo de desenvolvimento, apenas usuários adicionados como testadores podem se conectar:

1. No painel do aplicativo, vá em "Funções" > "Instagram Basic Display"
2. Role até "Usuários Testadores do Aplicativo"
3. Clique em "Adicionar Testadores do Instagram"
4. Digite o nome de usuário do Instagram que você quer adicionar
5. O usuário receberá um convite no Instagram que precisa aceitar

## Passo 6: Para Produção

Quando estiver pronto para produção:

1. Atualize os URIs de redirecionamento para seu domínio de produção
2. Envie seu aplicativo para revisão do Meta
3. Aguarde aprovação antes de disponibilizar para usuários finais

## URLs de Callback

Para desenvolvimento:
- `http://localhost:5173/auth/instagram/callback`

Para produção (substitua pelo seu domínio):
- `https://seudominio.com/auth/instagram/callback`

## Limitações

- **Modo Desenvolvimento**: Apenas testadores aprovados podem se conectar
- **Tokens**: Tokens de curta duração expiram em 1 hora
- **Rate Limits**: Limite de requisições por hora conforme documentação do Instagram

## Documentação Oficial

- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Getting Started](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)
- [User Access Tokens](https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions)

## Solução de Problemas

### Erro: "Instagram App ID não configurado"

Verifique se a variável `VITE_INSTAGRAM_APP_ID` está definida no arquivo `.env` e reinicie o servidor de desenvolvimento.

### Erro: "Estado OAuth inválido ou expirado"

Os estados OAuth expiram após 10 minutos. Tente conectar novamente.

### Erro: "Redirect URI mismatch"

Certifique-se de que o URI de redirecionamento no Meta for Developers corresponde exatamente ao URI usado na aplicação.

### Usuário não consegue se conectar

Verifique se o usuário foi adicionado como testador do aplicativo e aceitou o convite no Instagram.

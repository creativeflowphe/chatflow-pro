import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

// Hardcoded constants (no env vars)
const INSTAGRAM_APP_ID = '31813681161608818';  // VITE_INSTAGRAM_APP_ID
const REDIRECT_URI = 'https://chatflow-pro-chi.vercel.app/auth/instagram/callback';
const INSTAGRAM_VERIFY_TOKEN = 'chatflow-ig-verify-2025-abc123def456';  // Verify pro webhook
const INSTAGRAM_APP_SECRET = '71c81ffe83617c7a7801a1722d39728f';  // INSTAGRAM_APP_SECRET
const SUPABASE_URL = 'https://hpamcfgijgwuquhvkttn.supabase.co';
const SUPABASE_ANON_KEY = '666f5a09e7720780934848bc8a7368e5';  // VITE_SUPABASE_ANON_KEY
const WEBHOOK_URL = 'https://hpamcfgijgwuquhvkttn.supabase.co/functions/v1/instagram-webhook';

// Generate random state for OAuth security
const generateState = () => uuidv4();

// Step 1: Initiate Instagram OAuth (BM flow)
export const initiateInstagramOAuth = async (userId: string) => {
  const state = generateState();

  // Save state in Supabase for callback validation
  const { error: stateError } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state,
      platform: 'instagram',
      redirect_uri: REDIRECT_URI,
    });

  if (stateError) {
    throw new Error('Erro ao salvar state de OAuth');
  }

  // BM-friendly scopes for manage_messages and business
  const scopes = 'business_management,instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement';

  // OAuth URL with hardcoded ID
  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}&ret=login`;

  // Redirect to OAuth
  window.location.href = authUrl;
};

// Step 2: Callback handler (called from /auth/instagram/callback route)
export const handleInstagramCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    console.error('OAuth Error:', error);
    toast.error('Erro na autenticação: ' + urlParams.get('error_description') || 'Tente novamente');
    return;
  }

  if (!code || !state) {
    toast.error('Código ou state inválido');
    return;
  }

  // Validate state from Supabase
  const { data: stateData, error: stateError } = await supabase
    .from('oauth_states')
    .select('user_id')
    .eq('state', state)
    .single();

  if (stateError || !stateData) {
    toast.error('State inválido ou expirado');
    return;
  }

  const userId = stateData.user_id;

  try {
    // Exchange code for short-lived token
    const tokenResponse = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${INSTAGRAM_APP_ID}&client_secret=${INSTAGRAM_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);

    if (!tokenResponse.ok) {
      throw new Error('Falha ao trocar code por token');
    }

    const { access_token: shortToken } = await tokenResponse.json();

    // Get long-lived token (60 days, extendable for BM)
    const longTokenResponse = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${INSTAGRAM_APP_ID}&client_secret=${INSTAGRAM_APP_SECRET}&fb_exchange_token=${shortToken}`);

    const { access_token: longToken } = await longTokenResponse.json();

    // Get user accounts (BM businesses and IG)
    const accountsResponse = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${longToken}&fields=access_token,name,id,instagram_business_account{username,id}`);

    const { data: accounts } = await accountsResponse.json();

    // Find IG account (assume first for now)
    const igAccount = accounts.find((acc: any) => acc.instagram_business_account);
    if (!igAccount) {
      throw new Error('Nenhuma conta do Instagram encontrada no BM');
    }

    const igData = igAccount.instagram_business_account;
    const pageAccessToken = igAccount.access_token;  // Page token for webhook

    // Save connection with BM token
    const { error: insertError } = await supabase
      .from('connections')
      .insert({
        user_id: userId,
        platform: 'instagram',
        account_name: igData.username,
        account_id: igData.id,
        access_token: longToken,  // Long-lived BM token
        refresh_token: pageAccessToken,  // Page token for API calls
        status: 'active',
        metadata: { 
          business_id: igAccount.id,  // BM link
          verify_token: INSTAGRAM_VERIFY_TOKEN 
        }
      });

    if (insertError) {
      throw new Error('Erro ao salvar conexão: ' + insertError.message);
    }

    // Clean up state
    await supabase.from('oauth_states').delete().eq('state', state);

    toast.success('Instagram conectado via BM!');
    window.location.href = '/automations/connections';  // Redirect back
  } catch (error: any) {
    console.error('Callback error:', error);
    toast.error(error.message || 'Erro na conexão BM');
    // Fallback prompt for manual token
    const manualToken = prompt('OAuth falhou. Cole o System User Token do BM manualmente:');
    if (manualToken) {
      const { error: manualError } = await supabase
        .from('connections')
        .insert({
          user_id: userId,
          platform: 'instagram',
          account_name: '@pheenixvesting',
          account_id: '17841025451798',
          access_token: manualToken,
          status: 'active',
          metadata: { verify_token: INSTAGRAM_VERIFY_TOKEN }
        });
      if (manualError) {
        toast.error('Erro ao salvar token manual: ' + manualError.message);
      } else {
        toast.success('Conectado via token manual!');
        window.location.href = '/automations/connections';
      }
    }
  }
};

// Disconnect Instagram (revoke token)
export const disconnectInstagram = async (connectionId: string) => {
  const { data: connection } = await supabase
    .from('connections')
    .select('access_token, account_id')
    .eq('id', connectionId)
    .single();

  if (!connection) return false;

  try {
    // Revoke token via Graph API
    await fetch(`https://graph.facebook.com/v21.0/${connection.account_id}/permissions`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${connection.access_token}` }
    });

    // Delete from Supabase
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    return !error;
  } catch (error) {
    console.error('Disconnect error:', error);
    return false;
  }
};

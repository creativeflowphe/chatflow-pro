import { supabase } from '../lib/supabase';

const getInstagramAppId = (): string | undefined => {
  return import.meta.env.VITE_INSTAGRAM_APP_ID;
};

const REDIRECT_URI = `${window.location.origin}/auth/instagram/callback`;

export const generateRandomState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const initiateInstagramOAuth = async (userId: string): Promise<void> => {
  const INSTAGRAM_APP_ID = getInstagramAppId();

  if (!INSTAGRAM_APP_ID) {
    throw new Error('Instagram App ID não configurado. Por favor, configure a variável de ambiente VITE_INSTAGRAM_APP_ID');
  }

  const state = generateRandomState();

  const { error } = await supabase.from('oauth_states').insert({
    user_id: userId,
    state,
    platform: 'instagram',
    redirect_uri: REDIRECT_URI,
  });

  if (error) {
    throw new Error('Erro ao iniciar autenticação');
  }

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  authUrl.searchParams.append('client_id', INSTAGRAM_APP_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', 'business_management,instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('config_id', '');
  authUrl.searchParams.append('extras', JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } }));

  window.location.href = authUrl.toString();
};

export const handleInstagramCallback = async (
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Processing Instagram callback:', { code: code?.substring(0, 10) + '...', state });

    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('platform', 'instagram')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (stateError || !oauthState) {
      console.error('OAuth state error:', stateError);
      return { success: false, error: 'Estado OAuth inválido ou expirado' };
    }

    console.log('OAuth state found, calling edge function...');

    const { data: result, error: functionError } = await supabase.functions.invoke(
      'instagram-oauth',
      {
        body: { code, redirect_uri: REDIRECT_URI },
      }
    );

    if (functionError || !result?.success) {
      console.error('Edge function error:', functionError, result);
      return { success: false, error: result?.error || 'Erro ao autenticar com Instagram' };
    }

    console.log('Instagram OAuth successful, saving connection...');

    const { access_token, user_id, username } = result;

    const { error: connectionError } = await supabase.from('connections').insert({
      user_id: oauthState.user_id,
      platform: 'instagram',
      platform_user_id: user_id,
      platform_username: username,
      access_token,
      is_active: true,
      metadata: { username },
    });

    if (connectionError) {
      console.error('Connection save error:', connectionError);
      return { success: false, error: 'Erro ao salvar conexão' };
    }

    console.log('Connection saved, cleaning up OAuth state...');

    await supabase.from('oauth_states').delete().eq('id', oauthState.id);

    console.log('Instagram connection completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Erro no callback do Instagram:', error);
    return { success: false, error: 'Erro ao processar autenticação' };
  }
};

export const disconnectInstagram = async (connectionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    return !error;
  } catch (error) {
    console.error('Erro ao desconectar Instagram:', error);
    return false;
  }
};

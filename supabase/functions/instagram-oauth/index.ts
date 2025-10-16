import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID');
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET');

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface PageResponse {
  data: Array<{
    id: string;
    name: string;
    access_token: string;
  }>;
}

interface InstagramAccountResponse {
  instagram_business_account?: {
    id: string;
  };
  id: string;
}

interface InstagramProfileResponse {
  id: string;
  username: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuração do Instagram não encontrada. Configure INSTAGRAM_APP_ID e INSTAGRAM_APP_SECRET.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { code, redirect_uri } = await req.json();

    if (!code || !redirect_uri) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código ou redirect_uri ausente' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&client_secret=${INSTAGRAM_APP_SECRET}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return new Response(
        JSON.stringify({ success: false, error: `Erro ao obter token: ${error}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${tokenData.access_token}`
    );

    if (!pagesResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter páginas do Facebook' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pagesData: PageResponse = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nenhuma página do Facebook encontrada. Você precisa ter uma página conectada ao Instagram.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;

    const instagramAccountResponse = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );

    if (!instagramAccountResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter conta do Instagram' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const instagramAccountData: InstagramAccountResponse = await instagramAccountResponse.json();

    if (!instagramAccountData.instagram_business_account) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Esta página não está conectada a uma conta comercial do Instagram. Conecte sua conta do Instagram à página do Facebook.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const instagramAccountId = instagramAccountData.instagram_business_account.id;

    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username&access_token=${pageAccessToken}`
    );

    if (!profileResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter perfil do Instagram' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const profileData: InstagramProfileResponse = await profileResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        access_token: pageAccessToken,
        user_id: profileData.id,
        username: profileData.username,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no OAuth do Instagram:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

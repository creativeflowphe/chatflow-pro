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

    const businessesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/businesses?fields=id,name&access_token=${tokenData.access_token}`
    );

    if (!businessesResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter Business Manager' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const businessesData = await businessesResponse.json();

    if (!businessesData.data || businessesData.data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nenhum Business Manager encontrado. Você precisa ter acesso a um Business Manager.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const business = businessesData.data[0];
    const businessId = business.id;

    const instagramAccountsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${businessId}/instagram_accounts?fields=id,username,name&access_token=${tokenData.access_token}`
    );

    if (!instagramAccountsResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter contas do Instagram no Business Manager' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const instagramAccountsData = await instagramAccountsResponse.json();

    if (!instagramAccountsData.data || instagramAccountsData.data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nenhuma conta do Instagram encontrada no Business Manager. Adicione uma conta do Instagram no BM.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const instagramAccount = instagramAccountsData.data[0];
    const instagramAccountId = instagramAccount.id;

    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username&access_token=${tokenData.access_token}`
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
        access_token: tokenData.access_token,
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
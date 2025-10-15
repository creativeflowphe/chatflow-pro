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
  user_id: number;
}

interface UserResponse {
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

    const tokenParams = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri,
      code,
    });

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

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

    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
    );

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao obter dados do usuário' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userData: UserResponse = await userResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        access_token: tokenData.access_token,
        user_id: userData.id,
        username: userData.username,
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
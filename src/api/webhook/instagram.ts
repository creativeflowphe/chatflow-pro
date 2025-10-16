import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Hub-Signature-256',
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VERIFY_TOKEN = import.meta.env.VITE_INSTAGRAM_VERIFY_TOKEN || '';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log('GET params:', { mode, token, challenge }); // Log no Vercel

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Validação OK, ecoando challenge:', challenge);
    return new Response(challenge || '', { status: 200, headers: corsHeaders });
  }
  console.log('Validação falhou');
  return new Response('Forbidden', { status: 403, headers: corsHeaders });
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log('POST body (DM):', body); // Log no Vercel

  try {
    const { data, error } = await supabase.from('messages').insert({
      user_id: body.entry[0].id, // Ajuste pro seu user_id do Supabase
      contact_id: body.entry[0].messaging[0].sender.id,
      content: body.entry[0].messaging[0].message.text || 'Mídia ou sticker',
      direction: 'inbound',
      is_automated: false,
      platform: 'instagram',
      metadata: body
    });

    if (error) {
      console.error('Erro salvar DM:', error);
      return new Response('Error saving', { status: 500, headers: corsHeaders });
    }
    console.log('DM salva OK:', data);
  } catch (err) {
    console.error('Erro no POST:', err);
    return new Response('Internal Error', { status: 500, headers: corsHeaders });
  }

  return new Response('OK', { status: 200, headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
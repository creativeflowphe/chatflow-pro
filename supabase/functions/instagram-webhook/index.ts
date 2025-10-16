const VERIFY_TOKEN = 'chatflow-ig-verify-2025-abc123def456';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Instagram Webhook Verification:', { mode, token, challenge });

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new Response(challenge, {
          status: 200,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/plain' 
          },
        });
      } else {
        console.error('Verification failed. Expected token:', VERIFY_TOKEN);
        return new Response('Forbidden', {
          status: 403,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/plain' 
          },
        });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Instagram webhook received:', JSON.stringify(body, null, 2));

      if (body.object === 'instagram') {
        for (const entry of body.entry || []) {
          const messaging = entry.messaging || [];

          for (const event of messaging) {
            console.log('Processing Instagram event:', event);

            if (event.message) {
              console.log('Message received:', {
                senderId: event.sender?.id,
                recipientId: event.recipient?.id,
                messageText: event.message?.text,
                timestamp: event.timestamp,
              });
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'text/plain' 
        },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/plain' 
      },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/plain' 
      },
    });
  }
});
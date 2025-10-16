import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VERIFY_TOKEN = Deno.env.get('INSTAGRAM_VERIFY_TOKEN') || 'chatflow-ig-verify-2025-abc123def456';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  try {
    if (req.method === 'OPTIONS') {
      console.log(`[${timestamp}] Handling OPTIONS request`);
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

      console.log(`[${timestamp}] Webhook verification attempt:`, {
        mode,
        tokenReceived: token ? 'yes' : 'no',
        tokenMatch: token === VERIFY_TOKEN,
        challengeReceived: challenge ? 'yes' : 'no'
      });

      if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
        console.log(`[${timestamp}] ✅ Webhook verified successfully`);
        return new Response(challenge, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders
          },
        });
      } else {
        console.error(`[${timestamp}] ❌ Verification failed:`, {
          mode,
          hasToken: !!token,
          tokenMatch: token === VERIFY_TOKEN,
          hasChallenge: !!challenge
        });
        return new Response('Verification Failed', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders
          },
        });
      }
    }

    if (req.method === 'POST') {
      let body;
      try {
        const text = await req.text();
        console.log(`[${timestamp}] Raw webhook body:`, text.substring(0, 500));
        body = JSON.parse(text);
      } catch (error) {
        console.error(`[${timestamp}] Failed to parse webhook body:`, error);
        return new Response('Bad Request - Invalid JSON', {
          status: 400,
          headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders
          },
        });
      }

      console.log(`[${timestamp}] 📨 Instagram webhook received:`, JSON.stringify(body, null, 2));

      if (body.object === 'instagram') {
        for (const entry of body.entry || []) {
          console.log(`[${timestamp}] Processing entry:`, entry.id);

          if (entry.messaging) {
            for (const event of entry.messaging) {
              await processMessagingEvent(event, timestamp);
            }
          }

          if (entry.changes) {
            for (const change of entry.changes) {
              console.log(`[${timestamp}] Change event:`, change);
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          ...corsHeaders
        },
      });
    }

    console.log(`[${timestamp}] Method not allowed: ${req.method}`);
    return new Response('Method not allowed', {
      status: 405,
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders
      },
    });

  } catch (error) {
    console.error(`[${timestamp}] ❌ Webhook error:`, error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders
      },
    });
  }
});

async function processMessagingEvent(event: any, timestamp: string) {
  try {
    console.log(`[${timestamp}] 📱 Processing messaging event:`, {
      senderId: event.sender?.id,
      recipientId: event.recipient?.id,
      timestamp: event.timestamp,
      hasMessage: !!event.message,
      hasPostback: !!event.postback,
      hasDelivery: !!event.delivery,
      hasRead: !!event.read
    });

    if (event.message) {
      const message = event.message;
      console.log(`[${timestamp}] 💬 Message received:`, {
        text: message.text,
        attachments: message.attachments,
        quickReply: message.quick_reply,
        isEcho: message.is_echo
      });

      if (message.is_echo) {
        console.log(`[${timestamp}] ⏭️ Skipping echo message`);
        return;
      }

      await processIncomingMessage({
        senderId: event.sender.id,
        recipientId: event.recipient.id,
        messageText: message.text,
        timestamp: event.timestamp
      }, timestamp);
    }

    if (event.postback) {
      console.log(`[${timestamp}] 🔘 Postback received:`, {
        payload: event.postback.payload,
        title: event.postback.title
      });
    }

    if (event.delivery) {
      console.log(`[${timestamp}] ✅ Delivery confirmation:`, {
        messageIds: event.delivery.mids,
        watermark: event.delivery.watermark
      });
    }

    if (event.read) {
      console.log(`[${timestamp}] 👁️ Read confirmation:`, {
        watermark: event.read.watermark
      });
    }

  } catch (error) {
    console.error(`[${timestamp}] Error processing messaging event:`, error);
  }
}

async function processIncomingMessage(data: {
  senderId: string;
  recipientId: string;
  messageText: string;
  timestamp: number;
}, timestamp: string) {
  try {
    console.log(`[${timestamp}] 🔄 Processing incoming message:`, data);
    console.log(`[${timestamp}] 📝 Message processed successfully`);

  } catch (error) {
    console.error(`[${timestamp}] Error processing incoming message:`, error);
  }
}
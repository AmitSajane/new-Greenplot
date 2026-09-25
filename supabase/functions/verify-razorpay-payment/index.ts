// Verifies a Razorpay checkout result and, only if the signature is genuine,
// flips the matching `payments` row to 'paid'. This is the step that
// actually matters for security — the client's "payment succeeded" callback
// on its own proves nothing, since a compromised device could fake it.
//
// Deploy:  supabase functions deploy verify-razorpay-payment
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) return json({ error: 'Razorpay is not configured on the server yet.' }, 500);

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: 'Not authenticated.' }, 401);

    const body: VerifyBody = await req.json();
    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return json({ error: 'Missing order id, payment id, or signature.' }, 400);
    }

    // Signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    // https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/verify-payment-signature/
    const expected = await hmacHex(keySecret, `${body.razorpay_order_id}|${body.razorpay_payment_id}`);
    const verified = timingSafeEqual(expected, body.razorpay_signature);

    // Confirm the order actually belongs to this caller before touching it —
    // RLS on this select (auth.uid() in payer_id/payee_id) enforces that.
    const { data: existing, error: fetchError } = await userClient
      .from('payments')
      .select('id, payer_id')
      .eq('razorpay_order_id', body.razorpay_order_id)
      .single();
    if (fetchError || !existing) return json({ error: 'Payment record not found.' }, 404);

    if (verified) {
      const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { error: updateError } = await serviceClient
        .from('payments')
        .update({ razorpay_payment_id: body.razorpay_payment_id, status: 'paid', paid_at: new Date().toISOString() })
        .eq('razorpay_order_id', body.razorpay_order_id);
      if (updateError) return json({ error: updateError.message }, 500);
    }

    return json({ verified });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error.' }, 500);
  }
});

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

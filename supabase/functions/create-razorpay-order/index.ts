// Creates a Razorpay order and a matching `payments` row (status='created').
//
// The Razorpay Key Secret lives only here (as a Supabase function secret),
// never in the app bundle — see supabase/functions/README.md for setup.
//
// Deploy:  supabase functions deploy create-razorpay-order
// Secrets: supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface CreateOrderBody {
  amountPaise: number;
  context: string; // 'lease_rent' | 'labor_wage' | ...
  contextId?: string;
  payeeId?: string;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      return json({ error: 'Razorpay is not configured on the server yet.' }, 500);
    }

    // Identify the caller from their own JWT — the payer is whoever is
    // authenticated, never a value the client sends us.
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: 'Not authenticated.' }, 401);

    const body: CreateOrderBody = await req.json();
    const amountPaise = Math.round(body.amountPaise);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return json({ error: 'amountPaise must be a positive integer.' }, 400);
    }
    if (!body.context) return json({ error: 'context is required.' }, 400);

    // Razorpay Orders API — https://razorpay.com/docs/api/orders/create/
    const receipt = `${body.context}_${body.contextId ?? user.id}_${Date.now()}`.slice(0, 40);
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { context: body.context, contextId: body.contextId ?? '', payerId: user.id },
      }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) {
      return json({ error: order?.error?.description ?? 'Razorpay order creation failed.' }, 502);
    }

    // Record it so the app has a durable, RLS-scoped view of its own
    // payments even before Razorpay's webhook (if any) arrives.
    const serviceClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error: insertError } = await serviceClient.from('payments').insert({
      razorpay_order_id: order.id,
      payer_id: user.id,
      payee_id: body.payeeId ?? null,
      context: body.context,
      context_id: body.contextId ?? null,
      amount_paise: amountPaise,
      currency: 'INR',
      status: 'created',
    });
    if (insertError) return json({ error: insertError.message }, 500);

    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error.' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

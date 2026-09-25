/**
 * Payments data layer (Razorpay via Supabase edge functions).
 *
 * The app never talks to Razorpay's Orders API directly — that would need
 * the Key Secret on-device. Instead it calls two edge functions:
 *  - create-razorpay-order: opens an order, returns the public Key ID + order id
 *  - verify-razorpay-payment: checks the signature server-side, marks it paid
 *
 * See supabase/functions/README.md for deploying these and setting secrets.
 */
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type PaymentContext = 'lease_rent' | 'labor_wage';

export interface CreateOrderParams {
  /** Amount in paise (₹1 = 100 paise) — Razorpay's native unit, no rounding surprises. */
  amountPaise: number;
  context: PaymentContext;
  contextId?: string;
  payeeId?: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  /** Public Key ID, echoed back so the client doesn't need its own copy of env config. */
  keyId: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function db() {
  if (!supabase) {
    console.error('[paymentsApi] Supabase is not configured.');
    return null;
  }
  return supabase;
}

// Unlike its `realtime` client, supabase-js's `functions` client does NOT
// automatically attach the signed-in user's session token — it only sends
// whatever static Authorization header the client was constructed with
// (the anon/publishable key). The edge functions need the real user JWT
// (they read it via `Deno.env`-configured Supabase client to identify the
// caller), so it has to be attached explicitly on every call.
async function authHeader(client: NonNullable<typeof supabase>): Promise<Record<string, string> | null> {
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    console.error('[paymentsApi] You need to be signed in to make a payment.');
    return null;
  }
  return { Authorization: `Bearer ${token}` };
}

// supabase-js's default error for a non-2xx edge function response is just
// "Edge Function returned a non-2xx status code" — the actually useful
// message (either our own function's `{ error }` body, or the Supabase
// gateway's own `{ message }` body for e.g. an auth failure) is in the
// response, which this pulls out instead of surfacing the generic one.
async function getFunctionsErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      const message = body?.error || body?.message;
      if (message) return message;
    } catch {
      // body wasn't JSON (or already threw above) — fall through to the generic message
    }
  }
  return error instanceof Error ? error.message : 'Payment request failed.';
}

export const paymentsApi = {
  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder | null> {
    try {
      const client = db();
      if (!client) return null;

      const headers = await authHeader(client);
      if (!headers) return null;

      const { data, error } = await client.functions.invoke('create-razorpay-order', { body: params, headers });
      if (error) {
        console.error('[paymentsApi] Failed to create Razorpay order:', await getFunctionsErrorMessage(error));
        return null;
      }
      if (data?.error) {
        console.error('[paymentsApi] Failed to create Razorpay order:', data.error);
        return null;
      }

      console.log('[paymentsApi] Razorpay order created successfully.', data);
      return data as RazorpayOrder;
    } catch (error) {
      console.error('[paymentsApi] Failed to create Razorpay order:', error);
      return null;
    }
  },

  async verifyPayment(params: VerifyPaymentParams): Promise<{ verified: boolean } | null> {
    try {
      const client = db();
      if (!client) return null;

      const headers = await authHeader(client);
      if (!headers) return null;

      const { data, error } = await client.functions.invoke('verify-razorpay-payment', { body: params, headers });
      if (error) {
        console.error('[paymentsApi] Failed to verify Razorpay payment:', await getFunctionsErrorMessage(error));
        return null;
      }
      if (data?.error) {
        console.error('[paymentsApi] Failed to verify Razorpay payment:', data.error);
        return null;
      }

      console.log('[paymentsApi] Razorpay payment verified successfully.', data);
      return data as { verified: boolean };
    } catch (error) {
      console.error('[paymentsApi] Failed to verify Razorpay payment:', error);
      return null;
    }
  },
};

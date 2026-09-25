// Shared CORS headers for the payment edge functions. The app calls these
// via supabase-js's `functions.invoke`, which is a plain fetch under the
// hood, so the OPTIONS preflight needs a response too.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

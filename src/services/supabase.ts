/**
 * Supabase client (React Native).
 *
 * Created only when SUPABASE_URL + SUPABASE_ANON_KEY exist in `.env`
 * (`isSupabaseConfigured`). Until then `supabase` is null and the app falls
 * back to in-memory mock data — so the demo keeps working with no backend.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from '../config/env';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export { isSupabaseConfigured };

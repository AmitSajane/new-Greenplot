/**
 * Central, typed access to environment variables (from `.env` via
 * react-native-dotenv). Import `ENV` instead of reading `@env` directly so we
 * have one place for defaults and validation.
 *
 * Non-secret public URLs fall back to sensible defaults so the app still runs
 * if a URL is omitted from `.env`. Secret keys have NO fallback on purpose.
 */
import {
  MAPBOX_ACCESS_TOKEN,
  GEOCODE_API_KEY,
  GEOCODE_BASE_URL,
  SOIL_API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from '@env';

export const ENV = {
  mapboxToken: MAPBOX_ACCESS_TOKEN ?? '',
  geocodeApiKey: GEOCODE_API_KEY ?? '',
  geocodeBaseUrl: GEOCODE_BASE_URL ?? 'https://geocode.maps.co',
  soilApiBaseUrl: SOIL_API_BASE_URL ?? 'https://www.kaegro.com/farms/api/soil',
  supabaseUrl: SUPABASE_URL ?? '',
  supabaseAnonKey: SUPABASE_ANON_KEY ?? '',
};

/** True once a Supabase project URL + anon key are present in .env. */
export const isSupabaseConfigured = !!ENV.supabaseUrl && !!ENV.supabaseAnonKey;

if (__DEV__ && !ENV.mapboxToken) {
  console.warn('[env] MAPBOX_ACCESS_TOKEN is missing — maps will fail to load. Add it to .env.');
}

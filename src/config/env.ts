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
  NEWS_API_KEY,
  NEWS_API_BASE_URL,
  YOUTUBE_API_KEY,
  YOUTUBE_API_BASE_URL,
  DATA_GOV_API_KEY,
} from '@env';

/**
 * data.gov.in publishes this sample key openly in its API docs (not a secret) —
 * it lets the app work out-of-the-box for the demo. Users can drop their own
 * free key into .env (DATA_GOV_API_KEY) for higher rate limits.
 */
const DATA_GOV_SAMPLE_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

export const ENV = {
  mapboxToken: MAPBOX_ACCESS_TOKEN ?? '',
  geocodeApiKey: GEOCODE_API_KEY ?? '',
  geocodeBaseUrl: GEOCODE_BASE_URL ?? 'https://geocode.maps.co',
  soilApiBaseUrl: SOIL_API_BASE_URL ?? 'https://www.kaegro.com/farms/api/soil',
  supabaseUrl: SUPABASE_URL ?? '',
  supabaseAnonKey: SUPABASE_ANON_KEY ?? '',
  newsApiKey: NEWS_API_KEY ?? '',
  newsApiBaseUrl: NEWS_API_BASE_URL ?? 'https://newsdata.io/api/1',
  youtubeApiKey: YOUTUBE_API_KEY ?? '',
  youtubeApiBaseUrl: YOUTUBE_API_BASE_URL ?? 'https://www.googleapis.com/youtube/v3',
  // Mandi prices (data.gov.in Agmarknet). Free public sample key by default.
  dataGovApiKey: DATA_GOV_API_KEY || DATA_GOV_SAMPLE_KEY,
  dataGovBaseUrl: 'https://api.data.gov.in/resource',
};

/** True once a Supabase project URL + anon key are present in .env. */
export const isSupabaseConfigured = !!ENV.supabaseUrl && !!ENV.supabaseAnonKey;

/** True once a NewsData.io key is present in .env (else we fall back to mock news). */
export const isNewsConfigured = !!ENV.newsApiKey;

/** True once a YouTube Data API key is present (enables in-app video SEARCH;
 *  RSS-based category feeds work without it). */
export const isYoutubeConfigured = !!ENV.youtubeApiKey;

if (__DEV__ && !ENV.mapboxToken) {
  console.warn('[env] MAPBOX_ACCESS_TOKEN is missing — maps will fail to load. Add it to .env.');
}

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
  WEATHER_API_KEY,
  WEATHER_API_BASE_URL,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  HOT_UPDATER_BASE_URL,
} from '@env';

/**
 * data.gov.in publishes this sample key openly in its API docs (not a secret) —
 * it lets the app work out-of-the-box for the demo. Users can drop their own
 * free key into .env (DATA_GOV_API_KEY) for higher rate limits.
 */
const DATA_GOV_SAMPLE_KEY = '';
const cleanEnv = (value: string | undefined, fallback = '') => value?.trim() || fallback;

export const ENV = {
  mapboxToken: cleanEnv(MAPBOX_ACCESS_TOKEN),
  geocodeApiKey: cleanEnv(GEOCODE_API_KEY),
  geocodeBaseUrl: cleanEnv(GEOCODE_BASE_URL, 'https://geocode.maps.co'),
  soilApiBaseUrl: cleanEnv(SOIL_API_BASE_URL, 'https://www.kaegro.com/farms/api/soil'),
  supabaseUrl: cleanEnv(SUPABASE_URL),
  supabaseAnonKey: cleanEnv(SUPABASE_ANON_KEY),
  newsApiKey: cleanEnv(NEWS_API_KEY),
  newsApiBaseUrl: cleanEnv(NEWS_API_BASE_URL, 'https://newsdata.io/api/1'),
  youtubeApiKey: cleanEnv(YOUTUBE_API_KEY),
  youtubeApiBaseUrl: cleanEnv(YOUTUBE_API_BASE_URL, 'https://www.googleapis.com/youtube/v3'),
  // Mandi prices (data.gov.in Agmarknet). Free public sample key by default.
  dataGovApiKey: cleanEnv(DATA_GOV_API_KEY, DATA_GOV_SAMPLE_KEY),
  dataGovBaseUrl: 'https://api.data.gov.in/resource',
  weatherApiKey: cleanEnv(WEATHER_API_KEY),
  weatherApiBaseUrl: cleanEnv(WEATHER_API_BASE_URL, 'https://api.openweathermap.org/data/2.5/weather'),
  // Kisan Mitra real AI (Google Gemini, free tier). No key → offline engine.
  geminiApiKey: cleanEnv(GEMINI_API_KEY),
  geminiModel: cleanEnv(GEMINI_MODEL, 'gemini-2.5-flash-lite'),
  geminiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  // OTA update check endpoint (Hot Updater). Empty until `npx hot-updater
  // init --provider supabase` provisions the Supabase Edge Function and
  // prints its URL — see HOT_UPDATER_BASE_URL in .env.example.
  hotUpdaterBaseUrl: cleanEnv(HOT_UPDATER_BASE_URL),
};

/** True once a Supabase project URL + anon key are present in .env. */
export const isSupabaseConfigured = !!ENV.supabaseUrl && !!ENV.supabaseAnonKey;

/** True once a NewsData.io key is present in .env (else we fall back to mock news). */
export const isNewsConfigured = !!ENV.newsApiKey;

/** True once a YouTube Data API key is present (enables in-app video SEARCH;
 *  RSS-based category feeds work without it). */
export const isYoutubeConfigured = !!ENV.youtubeApiKey;

/** True once an OpenWeather API key is present. */
export const isWeatherConfigured = !!ENV.weatherApiKey;

/** True once a Gemini key is present → Kisan Mitra uses real AI (else offline engine). */
export const isGeminiConfigured = !!ENV.geminiApiKey;

/** True once an OTA update endpoint is configured → HotUpdater.wrap() checks
 *  for updates on launch (release builds only). False = OTA is a no-op and
 *  the app just runs its normal bundled JS, same as before this was added. */
export const isHotUpdaterConfigured = !!ENV.hotUpdaterBaseUrl;

if (__DEV__ && !ENV.mapboxToken) {
  console.warn('[env] MAPBOX_ACCESS_TOKEN is missing — maps will fail to load. Add it to .env.');
}

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
} from '@env';

export const ENV = {
  mapboxToken: MAPBOX_ACCESS_TOKEN ?? '',
  geocodeApiKey: GEOCODE_API_KEY ?? '',
  geocodeBaseUrl: GEOCODE_BASE_URL ?? 'https://geocode.maps.co',
  soilApiBaseUrl: SOIL_API_BASE_URL ?? 'https://www.kaegro.com/farms/api/soil',
};

if (__DEV__ && !ENV.mapboxToken) {
  // eslint-disable-next-line no-console
  console.warn('[env] MAPBOX_ACCESS_TOKEN is missing — maps will fail to load. Add it to .env.');
}

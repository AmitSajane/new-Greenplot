/**
 * Geocoding helpers (geocode.maps.co).
 *  - reverseGeocode: lat/lon → human-readable address
 *  - forwardGeocode: typed place name → coordinates
 *
 * Network/shape errors are thrown to the caller, which decides how to fall back.
 */
import { ENV } from '../../config/env';

const GEOCODE_API_KEY = ENV.geocodeApiKey;
const BASE_URL = ENV.geocodeBaseUrl;

export interface GeoPlace {
  lat: number;
  lon: number;
  label: string;
  district?: string;
  state?: string;
}

interface GeocodeAddress {
  village?: string;
  town?: string;
  city?: string;
  suburb?: string;
  county?: string;
  state_district?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface GeocodeResult {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: GeocodeAddress;
}

/** Build a short, farmer-readable label from the richer geocode payload. */
function formatAddress(result: GeocodeResult): string {
  const a = result.address;
  if (a) {
    const parts = [
      a.village || a.town || a.city || a.suburb || a.county,
      a.state_district || a.district,
      a.state,
    ].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return result.display_name || 'Unknown location';
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `${BASE_URL}/reverse?lat=${lat}&lon=${lon}&api_key=${GEOCODE_API_KEY}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
  const json: GeocodeResult = await res.json();
  return formatAddress(json);
}

export interface ReverseDetail {
  label: string;
  district?: string;
  state?: string;
}

/** Reverse geocode returning a label plus structured district/state. */
export async function reverseGeocodeDetailed(lat: number, lon: number): Promise<ReverseDetail> {
  const url = `${BASE_URL}/reverse?lat=${lat}&lon=${lon}&api_key=${GEOCODE_API_KEY}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
  const json: GeocodeResult = await res.json();
  const a = json.address || {};
  return {
    label: formatAddress(json),
    district: a.state_district || a.district || a.county || undefined,
    state: a.state || undefined,
  };
}

export async function forwardGeocode(query: string): Promise<GeoPlace | null> {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&api_key=${GEOCODE_API_KEY}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Forward geocode failed: ${res.status}`);
  const json: GeocodeResult[] = await res.json();
  if (!Array.isArray(json) || json.length === 0) return null;
  const first = json[0];
  const lat = parseFloat(first.lat ?? '');
  const lon = parseFloat(first.lon ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const a = first.address || {};
  return {
    lat,
    lon,
    label: formatAddress(first),
    district: a.state_district || a.district || a.county || undefined,
    state: a.state || undefined,
  };
}

/** Typed place name → up to `limit` matches, for a search-results list. */
export async function forwardGeocodeMultiple(query: string, limit = 5): Promise<GeoPlace[]> {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&api_key=${GEOCODE_API_KEY}&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Forward geocode failed: ${res.status}`);
  const json: GeocodeResult[] = await res.json();
  if (!Array.isArray(json)) return [];
  const places: GeoPlace[] = [];
  for (const result of json) {
    const lat = parseFloat(result.lat ?? '');
    const lon = parseFloat(result.lon ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const a = result.address || {};
    places.push({
      lat,
      lon,
      label: formatAddress(result),
      district: a.state_district || a.district || a.county || undefined,
      state: a.state || undefined,
    });
  }
  return places;
}

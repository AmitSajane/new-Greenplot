/**
 * Resolves a farm's approximate lat/lon — the same fallback chain
 * useSatelliteMapScreen.ts already uses (boundary centroid, else
 * geocode the location text), extracted here so Step 8's Soil section can
 * share it without duplicating the logic.
 */
import { calculatePolygonCentroid } from './polygonCentroid';
import { forwardGeocode } from './geocoding';
import type { FarmListing } from '../../context/FarmListingsContext';

export interface FarmCoordinates {
  lat: number;
  lon: number;
}

export async function resolveFarmCoordinates(farm: FarmListing): Promise<FarmCoordinates | null> {
  const coords = farm.plotGeoJSON?.features?.[0]?.geometry?.coordinates?.[0];
  if (Array.isArray(coords) && coords.length > 0) {
    const [lon, lat] = calculatePolygonCentroid(coords as any);
    if (lon !== 0 || lat !== 0) return { lat, lon };
  }

  const query = [farm.location, farm.district, farm.state].filter(Boolean).join(', ');
  if (!query) return null;
  try {
    const place = await forwardGeocode(query);
    return place ? { lat: place.lat, lon: place.lon } : null;
  } catch {
    return null;
  }
}

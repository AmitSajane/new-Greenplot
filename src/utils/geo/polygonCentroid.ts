import { LngLat } from './polygonArea';

/**
 * Calculates the arithmetic centroid (center of mass) of a polygon ring.
 * Accepts a GeoJSON-style coordinates array: [lng, lat][]
 * Returns [lng, lat] suitable for Mapbox Camera centerCoordinate.
 */
export function calculatePolygonCentroid(coords: LngLat[]): LngLat {
  if (!coords || coords.length === 0) {
    return [0, 0];
  }

  // Remove closing point if polygon is closed (first === last)
  const lastIdx = coords.length - 1;
  const isClosed =
    coords[0][0] === coords[lastIdx][0] && coords[0][1] === coords[lastIdx][1];
  const ring = isClosed ? coords.slice(0, lastIdx) : coords;

  if (ring.length === 0) return [0, 0];

  let sumLng = 0;
  let sumLat = 0;
  for (const [lng, lat] of ring) {
    sumLng += lng;
    sumLat += lat;
  }

  return [sumLng / ring.length, sumLat / ring.length];
}

/**
 * Calculates the bounding box of a polygon ring.
 * Returns { minLng, minLat, maxLng, maxLat }
 */
export function calculatePolygonBounds(coords: LngLat[]): {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
} {
  if (!coords || coords.length === 0) {
    return { minLng: 0, minLat: 0, maxLng: 0, maxLat: 0 };
  }

  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return { minLng, minLat, maxLng, maxLat };
}

/**
 * Estimates an appropriate zoom level based on the geographic extent of a polygon.
 * Smaller fields → higher zoom; larger fields → lower zoom.
 */
export function estimateZoomForPolygon(coords: LngLat[]): number {
  const { minLng, minLat, maxLng, maxLat } = calculatePolygonBounds(coords);
  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;
  const span = Math.max(lngSpan, latSpan);

  if (span < 0.001) return 17;
  if (span < 0.005) return 15;
  if (span < 0.01) return 14;
  if (span < 0.05) return 12;
  if (span < 0.1) return 11;
  return 10;
}

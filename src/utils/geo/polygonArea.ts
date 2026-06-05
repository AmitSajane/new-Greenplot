/** Approximate polygon area on Earth (acres) from [lng, lat] coordinates. */

export type LngLat = [number, number];

const EARTH_RADIUS_M = 6371000;
const ACRES_PER_SQ_METER = 1 / 4046.8564224;

export function calculatePolygonAreaAcres(coords: LngLat[]): number {
  if (!coords || coords.length < 3) return 0;

  const [lng0, lat0] = coords[0];
  const lambda0 = (lng0 * Math.PI) / 180;
  const phi0 = (lat0 * Math.PI) / 180;
  const cosPhi0 = Math.cos(phi0);

  const lastIdx = coords.length - 1;
  const isClosed =
    coords[0][0] === coords[lastIdx][0] && coords[0][1] === coords[lastIdx][1];
  const effectiveN = isClosed ? lastIdx : coords.length;

  if (effectiveN < 3) return 0;

  let areaMeters2 = 0;
  const first = coords[0];
  let prevLambda = (first[0] * Math.PI) / 180;
  let prevPhi = (first[1] * Math.PI) / 180;
  let prevX = EARTH_RADIUS_M * (prevLambda - lambda0) * cosPhi0;
  let prevY = EARTH_RADIUS_M * (prevPhi - phi0);

  for (let i = 1; i <= effectiveN; i++) {
    const [lng, lat] = coords[i % effectiveN];
    const lambda = (lng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const x = EARTH_RADIUS_M * (lambda - lambda0) * cosPhi0;
    const y = EARTH_RADIUS_M * (phi - phi0);
    areaMeters2 += prevX * y - x * prevY;
    prevX = x;
    prevY = y;
  }

  return (Math.abs(areaMeters2) / 2) * ACRES_PER_SQ_METER;
}

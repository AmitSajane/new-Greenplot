import Mapbox from '@rnmapbox/maps';
import { ENV } from './env';

let initialized = false;

export function initMapbox(): void {
  if (initialized) return;
  Mapbox.setAccessToken(ENV.mapboxToken);
  initialized = true;
}

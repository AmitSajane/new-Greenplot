import Mapbox from '@rnmapbox/maps';

// TODO: Move token to env / secure storage — see MAPBOX_SETUP.md
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoiYW1pdHNhamFuZSIsImEiOiJjbW9uMGJ3bTEwNDNmMnFzNjg4aDN4MmZzIn0.XFX729F8EQDVEGrO8lY3WQ';

let initialized = false;

export function initMapbox(): void {
  if (initialized) return;
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
  initialized = true;
}

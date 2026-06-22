/**
 * Resolve the device's current location to a short, farmer-readable label
 * (e.g. "Kasba, Purnea, Bihar"). Uses the app's working geo helpers
 * (@react-native-community/geolocation + geocode.maps.co) — not the unreliable
 * web `navigator.geolocation`. Shared by the Farmer and Owner home headers.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentCoords } from '../utils/geo/location';
import { reverseGeocode } from '../utils/geo/geocoding';

export default function useCurrentLocation() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentCoords();
      const label = await reverseGeocode(lat, lon);
      if (mounted.current) setAddress(label);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Failed to get location');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  return { address, loading, error, refresh } as const;
}

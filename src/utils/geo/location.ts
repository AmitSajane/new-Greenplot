/**
 * Device location helper built on @react-native-community/geolocation.
 * Requests permission (Android) and resolves the current coordinates, or
 * rejects so the caller can fall back to a default region.
 */
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Coords {
  lat: number;
  lon: number;
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message: 'GreenPlot needs your location to fetch soil data for your farm.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export async function getCurrentCoords(): Promise<Coords> {
  const ok = await ensurePermission();
  if (!ok) throw new Error('Location permission denied');

  return new Promise<Coords>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}

import { useCallback, useEffect, useState } from 'react';
import type { WeatherInfo } from '../screens/farmerHome/constants/farmerDashboardData';
import { fetchWeatherByLocation } from '../services/weatherApi';

interface WeatherState {
  weather: WeatherInfo | null;
  loading: boolean;
  error: string | null;
}

export default function useWeather(location: string): WeatherState & { refresh: () => void } {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    loading: false,
    error: null,
  });
  // Bumped by `refresh()` to force a refetch even when `location` hasn't
  // changed (e.g. the profile location is fixed but the user still wants
  // the latest reading).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const query = location.trim();
    if (!query) {
      setState({ weather: null, loading: false, error: null });
      return;
    }

    let active = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    fetchWeatherByLocation(query)
      .then(weather => {
        if (!active) return;
        setState({ weather, loading: false, error: weather ? null : 'Weather API is not configured.' });
      })
      .catch(error => {
        if (!active) return;
        setState({ weather: null, loading: false, error: error?.message || 'Failed to fetch weather.' });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, reloadKey]);

  const refresh = useCallback(() => setReloadKey(k => k + 1), []);

  return { ...state, refresh };
}

import { ENV, isWeatherConfigured } from '../config/env';
import type { ForecastDay, WeatherInfo } from '../screens/farmerHome/constants/farmerDashboardData';

interface OpenWeatherCurrent {
  name?: string;
  weather?: Array<{ main?: string; description?: string; icon?: string }>;
  main?: { temp?: number; humidity?: number };
  wind?: { speed?: number };
}

interface OpenWeatherForecast {
  list?: Array<{
    dt?: number;
    weather?: Array<{ main?: string; description?: string; icon?: string }>;
    main?: { temp?: number };
  }>;
}

const iconToEmoji = (icon?: string, condition?: string): string => {
  const code = icon || '';
  const text = (condition || '').toLowerCase();
  if (code.startsWith('11') || text.includes('thunder')) return '⛈';
  if (code.startsWith('09') || code.startsWith('10') || text.includes('rain')) return '🌧';
  if (code.startsWith('13') || text.includes('snow')) return '❄️';
  if (code.startsWith('50') || text.includes('mist') || text.includes('fog')) return '🌫';
  if (code.startsWith('01') || text.includes('clear')) return '☀️';
  if (code.startsWith('02')) return '🌤';
  if (code.startsWith('03') || code.startsWith('04') || text.includes('cloud')) return '☁️';
  return '🌤';
};

const titleCase = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getAdvice = (condition: string, tempC: number, humidityPct: number): string => {
  const text = condition.toLowerCase();
  if (text.includes('rain') || text.includes('drizzle') || text.includes('thunder')) return 'Avoid spraying today';
  if (tempC >= 34) return 'Irrigate early morning';
  if (humidityPct >= 80) return 'Watch for fungal disease';
  if (text.includes('clear')) return 'Good day for field work';
  return 'Check crops before field work';
};

const getAdvisory = (condition: string, tempC: number, humidityPct: number, windKmh: number): string => {
  const text = condition.toLowerCase();
  if (text.includes('rain') || text.includes('thunder')) return 'Rain expected · pause pesticide spray and check drainage';
  if (tempC >= 34) return 'High heat · irrigate before 9 AM and avoid midday spraying';
  if (humidityPct >= 80) return 'High humidity · monitor leaves for fungal infection';
  if (windKmh >= 25) return 'Windy conditions · avoid fertilizer or pesticide spraying';
  return 'Weather looks workable · continue planned farm tasks';
};

const secureUrl = (value: string): string => value.trim().replace(/^http:\/\//i, 'https://');

const buildUrl = (baseUrl: string, params: Record<string, string>): string => {
  const url = new URL(secureUrl(baseUrl));
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

const forecastBaseUrl = (): string => secureUrl(ENV.weatherApiBaseUrl).replace(/\/weather(\?|$)/, '/forecast$1');

const pickDailyForecast = (forecast?: OpenWeatherForecast): ForecastDay[] => {
  const items = forecast?.list || [];
  const byDay = new Map<string, NonNullable<OpenWeatherForecast['list']>[number]>();

  items.forEach(item => {
    if (!item.dt) return;
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    const hour = date.getHours();
    if (!byDay.has(key) || Math.abs(hour - 12) < 3) byDay.set(key, item);
  });

  return Array.from(byDay.entries())
    .slice(0, 4)
    .map(([key, item], index) => {
      const date = new Date(`${key}T12:00:00`);
      const day = index === 0 ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short' });
      const weather = item.weather?.[0];
      const temp = Math.round(item.main?.temp ?? 0);
      return {
        id: key,
        day,
        emoji: iconToEmoji(weather?.icon, weather?.main || weather?.description),
        temp: `${temp}°`,
      };
    });
};

export async function fetchWeatherByLocation(location: string): Promise<WeatherInfo | null> {
  const query = location.trim();
  if (!query || !isWeatherConfigured) return null;

  const currentUrl = buildUrl(ENV.weatherApiBaseUrl, {
    q: query,
    appid: ENV.weatherApiKey,
    units: 'metric',
  });
  const currentRes = await fetch(currentUrl);
  if (!currentRes.ok) throw new Error(`Weather request failed: ${currentRes.status}`);
  const current: OpenWeatherCurrent = await currentRes.json();

  let forecast: OpenWeatherForecast | undefined;
  try {
    const forecastUrl = buildUrl(forecastBaseUrl(), {
      q: query,
      appid: ENV.weatherApiKey,
      units: 'metric',
    });
    const forecastRes = await fetch(forecastUrl);
    if (forecastRes.ok) forecast = await forecastRes.json();
  } catch {
    forecast = undefined;
  }

  const weather = current.weather?.[0];
  const tempC = Math.round(current.main?.temp ?? 0);
  const humidityPct = Math.round(current.main?.humidity ?? 0);
  const windKmh = Math.round((current.wind?.speed ?? 0) * 3.6);
  const condition = titleCase(weather?.description || weather?.main || 'Weather unavailable');

  return {
    emoji: iconToEmoji(weather?.icon, condition),
    tempC,
    condition,
    advice: getAdvice(condition, tempC, humidityPct),
    humidityPct,
    windKmh,
    location: current.name || query,
    forecast: pickDailyForecast(forecast),
    advisory: getAdvisory(condition, tempC, humidityPct, windKmh),
  };
}

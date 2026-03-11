import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TimelapseDate } from '../components/satelliteMap/TimelapseSlider';

export interface PlotGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties?: Record<string, any>;
  }>;
}

export interface SatelliteMapState {
  // Layer toggles
  ndviEnabled: boolean;
  soilMoistureEnabled: boolean;
  weatherEnabled: boolean;
  govtDataEnabled: boolean;
  
  // NDVI opacity
  ndviOpacity: number;
  
  // Selected date for timelapse
  selectedDateIndex: number;
  
  // Timelapse animation
  isPlaying: boolean;
  
  // Plot GeoJSON
  plotGeoJSON: PlotGeoJSON | null;
  
  // Map center (default to Purnea, Bihar)
  mapCenter: [number, number];
}

interface SatelliteMapContextType extends SatelliteMapState {
  setNdviEnabled: (enabled: boolean) => void;
  setSoilMoistureEnabled: (enabled: boolean) => void;
  setWeatherEnabled: (enabled: boolean) => void;
  setGovtDataEnabled: (enabled: boolean) => void;
  setNdviOpacity: (opacity: number) => void;
  setSelectedDateIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlotGeoJSON: (geoJSON: PlotGeoJSON | null) => void;
  setMapCenter: (center: [number, number]) => void;
  loadPlotData: () => Promise<void>;
}

const SatelliteMapContext = createContext<SatelliteMapContextType | undefined>(undefined);

// Mock timelapse dates (last 5 satellite captures)
const MOCK_TIMELAPSE_DATES: TimelapseDate[] = [
  { id: '1', date: '2024-01-15', label: 'Jan 15, 2024' },
  { id: '2', date: '2024-01-30', label: 'Jan 30, 2024' },
  { id: '3', date: '2024-02-14', label: 'Feb 14, 2024' },
  { id: '4', date: '2024-03-01', label: 'Mar 1, 2024' },
  { id: '5', date: '2024-03-15', label: 'Mar 15, 2024' },
];

// Mock plot GeoJSON (Purnea, Bihar area)
const MOCK_PLOT_GEOJSON: PlotGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [87.4648, 25.7777], // Southwest corner
            [87.4700, 25.7777], // Southeast corner
            [87.4700, 25.7820], // Northeast corner
            [87.4648, 25.7820], // Northwest corner
            [87.4648, 25.7777], // Close polygon
          ],
        ],
      },
      properties: {
        name: 'Farmer Plot',
        area: '5 acres',
      },
    },
  ],
};

interface SatelliteMapProviderProps {
  children: ReactNode;
}

export function SatelliteMapProvider({ children }: SatelliteMapProviderProps) {
  const [ndviEnabled, setNdviEnabled] = useState(false);
  const [soilMoistureEnabled, setSoilMoistureEnabled] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [govtDataEnabled, setGovtDataEnabled] = useState(false);
  const [ndviOpacity, setNdviOpacity] = useState(0.7);
  const [selectedDateIndex, setSelectedDateIndex] = useState(MOCK_TIMELAPSE_DATES.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [plotGeoJSON, setPlotGeoJSON] = useState<PlotGeoJSON | null>(null);
  // Default to user's location (lng, lat) - Karnataka region
  const [mapCenter, setMapCenter] = useState<[number, number]>([74.91711421195988, 16.59086417203163]);

  const loadPlotData = useCallback(async () => {
    // Don't load mock plot - let user draw their farm polygon
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
    setPlotGeoJSON(null);
  }, []);

  return (
    <SatelliteMapContext.Provider
      value={{
        ndviEnabled,
        soilMoistureEnabled,
        weatherEnabled,
        govtDataEnabled,
        ndviOpacity,
        selectedDateIndex,
        isPlaying,
        plotGeoJSON,
        mapCenter,
        setNdviEnabled,
        setSoilMoistureEnabled,
        setWeatherEnabled,
        setGovtDataEnabled,
        setNdviOpacity,
        setSelectedDateIndex,
        setIsPlaying,
        setPlotGeoJSON,
        setMapCenter,
        loadPlotData,
      }}
    >
      {children}
    </SatelliteMapContext.Provider>
  );
}

export function useSatelliteMap() {
  const context = useContext(SatelliteMapContext);
  if (context === undefined) {
    throw new Error('useSatelliteMap must be used within a SatelliteMapProvider');
  }
  return context;
}

// Export timelapse dates for use in components
export { MOCK_TIMELAPSE_DATES };

# Satellite Map Dashboard Feature

## Overview

A comprehensive satellite monitoring feature that allows farmers and landowners to view their plots on an interactive map with NDVI overlays, soil moisture data, weather information, and government satellite data.

## Features Implemented

### ✅ Core Features

1. **Satellite Map Screen**
   - Full-screen Mapbox map with satellite imagery
   - Default location: Purnea, Bihar (configurable)
   - Camera controls (zoom, pan, rotate, pitch)

2. **Plot Boundary Display**
   - GeoJSON polygon rendering
   - Green fill with border stroke
   - "Draw Plot" button when no plot exists
   - Interactive plot drawing mode

3. **NDVI Layer Overlay**
   - Toggle ON/OFF
   - Opacity control slider (0-100%)
   - WMS tile integration (Sentinel Hub compatible)
   - Updates based on selected timelapse date

4. **ISRO Bhuvan Vegetation Layer**
   - Toggle ON/OFF
   - Government satellite data overlay
   - Integrated with layer control panel

5. **Timelapse Slider**
   - Bottom slider UI
   - Last 5 satellite capture dates
   - Date selection updates NDVI tiles
   - Selected date label display
   - Play/Pause animation

6. **Layer Control Panel**
   - Floating right panel
   - Toggles for:
     - NDVI
     - Soil Moisture
     - Weather
     - Government Data (ISRO Bhuvan)
   - Switch buttons with visual feedback

7. **Health Legend UI**
   - Bottom-left legend
   - Color-coded crop health indicators:
     - Red → Poor crop
     - Yellow → Moderate
     - Light Green → Healthy
     - Dark Green → Very healthy

8. **Plot Drawing Mode**
   - FAB button: "Draw Plot"
   - Tap-to-add polygon points
   - Save GeoJSON functionality
   - Cancel option

### ✅ Navigation Integration

- **FarmerHomeScreen** → SatelliteMapScreen
- **OwnerHomeScreen** → SatelliteMapScreen
- Stack navigation with back button support
- "Satellite Monitoring" card on both dashboards

### ✅ Components Created

1. **LayerToggle** (`src/components/satelliteMap/LayerToggle.tsx`)
   - Reusable layer toggle with opacity control
   - Switch UI with active/inactive states

2. **TimelapseSlider** (`src/components/satelliteMap/TimelapseSlider.tsx`)
   - Date selection slider
   - Play/pause controls
   - Visual date markers

3. **HealthLegend** (`src/components/satelliteMap/HealthLegend.tsx`)
   - Crop health color legend
   - Customizable items

4. **MapFloatingButton** (`src/components/satelliteMap/MapFloatingButton.tsx`)
   - Floating action button
   - Configurable position and variant

5. **SatelliteMonitoringCard** (`src/components/satelliteMap/SatelliteMonitoringCard.tsx`)
   - Dashboard card component
   - Navigation trigger

### ✅ State Management

- **SatelliteMapContext** (`src/context/SatelliteMapContext.tsx`)
  - Centralized state for all map features
  - Layer toggles
  - Opacity values
  - Selected date index
  - Plot GeoJSON
  - Map center coordinates

### ✅ Services

- **satelliteMapService** (`src/services/satelliteMapService.ts`)
  - NDVI tile URL generation
  - Bhuvan vegetation URL
  - Plot GeoJSON fetch/save

## File Structure

```
src/
├── components/
│   └── satelliteMap/
│       ├── LayerToggle.tsx
│       ├── TimelapseSlider.tsx
│       ├── HealthLegend.tsx
│       ├── MapFloatingButton.tsx
│       ├── SatelliteMonitoringCard.tsx
│       └── index.ts
├── context/
│   └── SatelliteMapContext.tsx
├── screens/
│   └── SatelliteMapScreen.tsx
├── services/
│   └── satelliteMapService.ts
└── navigation/
    ├── FarmerHomeStack.tsx (updated)
    └── OwnerHomeStack.tsx (updated)
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Mapbox Token**
   - Get token from https://account.mapbox.com/access-tokens/
   - Update `src/screens/SatelliteMapScreen.tsx`:
     ```typescript
     Mapbox.setAccessToken('YOUR_TOKEN_HERE');
     ```
   - See `MAPBOX_SETUP.md` for detailed instructions

3. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the App**
   ```bash
   npm run ios
   # or
   npm run android
   ```

## Usage

1. **Access from Dashboard**
   - Tap "Satellite Monitoring" card on FarmerHomeScreen or OwnerHomeScreen
   - Navigates to SatelliteMapScreen

2. **Using the Map**
   - Toggle layers using the right panel
   - Adjust NDVI opacity with the slider
   - Use timelapse slider to view historical data
   - Tap play to animate through dates

3. **Drawing a Plot**
   - Tap "Draw Plot" FAB (if no plot exists)
   - Tap on map to add points
   - Tap "Save" when done (minimum 3 points)
   - Tap "Cancel" to exit draw mode

## Configuration

### Default Location
- Currently set to Purnea, Bihar: `[87.4674, 25.7799]`
- Update in `SatelliteMapContext.tsx` → `mapCenter`

### Timelapse Dates
- Configure in `SatelliteMapContext.tsx` → `MOCK_TIMELAPSE_DATES`
- Format: `{ id: string, date: string, label: string }`

### Plot GeoJSON
- Mock data in `SatelliteMapContext.tsx`
- Replace `loadPlotData()` with actual API call

## API Integration Points

1. **NDVI Tiles**
   - Function: `getNDVITileUrl(date: string)`
   - Currently returns mock WMS URL
   - Replace with actual Sentinel Hub or similar service

2. **Bhuvan Vegetation**
   - Function: `getBhuvanVegetationUrl()`
   - Currently returns mock URL
   - Replace with actual ISRO Bhuvan WMS endpoint

3. **Plot GeoJSON**
   - Function: `fetchPlotGeoJSON(plotId?: string)`
   - Currently returns mock data
   - Replace with actual API endpoint

4. **Save Plot**
   - Function: `savePlotGeoJSON(geoJSON: PlotGeoJSON)`
   - Currently logs to console
   - Replace with actual POST endpoint

## Performance Optimizations

- Lazy loading of map components
- Memoized layer calculations
- Efficient GeoJSON rendering
- Optimized re-renders with React.memo (where applicable)

## Future Enhancements

- [ ] Real-time NDVI data from Sentinel Hub
- [ ] Soil moisture sensor integration
- [ ] Weather overlay from weather API
- [ ] Plot area calculation
- [ ] Export plot boundaries
- [ ] Share map view
- [ ] Multiple plot support
- [ ] Plot comparison mode
- [ ] Historical trend charts

## Notes

- Mapbox free tier: 50,000 map loads/month
- NDVI tiles require valid WMS endpoint
- Plot drawing saves locally (needs API integration)
- All mock data should be replaced with real APIs in production

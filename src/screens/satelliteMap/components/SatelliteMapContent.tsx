import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapFloatingButton } from '../../../components/satelliteMap';
import { SatelliteMapViewModel } from '../hooks/useSatelliteMapScreen';
import { satelliteMapStyles as styles } from '../styles/satelliteMap.styles';
import { SatelliteMapHeader } from './SatelliteMapHeader';
import { SatelliteMapCanvas } from './SatelliteMapCanvas';
import { SatelliteMapSearchBar } from './SatelliteMapSearchBar';
import { SatelliteLayerPanel } from './SatelliteLayerPanel';
import { SatelliteDrawControls } from './SatelliteDrawControls';

export const SatelliteMapContent: React.FC<SatelliteMapViewModel> = (vm) => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <SatelliteMapHeader
      showLayerPanel={vm.showLayerPanel}
      onBack={vm.onBack}
      onToggleLayerPanel={vm.onToggleLayerPanel}
    />
    <View style={styles.mapContainer}>
      <SatelliteMapCanvas
        isLoading={vm.isLoading}
        mapCenter={vm.mapCenter}
        zoomLevel={vm.zoomLevel}
        userLocation={vm.userLocation}
        plotGeoJSON={vm.plotGeoJSON}
        drawnPlotGeoJSON={vm.drawnPlotGeoJSON}
        drawnPoints={vm.drawnPoints}
        ndviEnabled={vm.ndviEnabled}
        ndviTileUrl={vm.ndviTileUrl}
        ndviOpacity={vm.ndviOpacity}
        govtDataEnabled={vm.govtDataEnabled}
        onMapPress={vm.onMapPress}
        onDragPoint={vm.onDragPoint}
      />
      {vm.isSearchBarVisible ? (
        <SatelliteMapSearchBar
          query={vm.searchQuery}
          onChangeQuery={vm.onSearchChange}
          onSubmit={vm.onSearchSubmit}
          onClear={vm.onClearSearch}
          isSearching={vm.isSearching}
          results={vm.searchResults}
          showResults={vm.showSearchResults}
          onSelectResult={vm.onSelectSearchResult}
        />
      ) : (
        <MapFloatingButton
          icon="search"
          onPress={vm.onReopenSearch}
          position="top-left"
          variant="secondary"
        />
      )}
      {vm.showLayerPanel && (
        <SatelliteLayerPanel
          ndviEnabled={vm.ndviEnabled}
          soilMoistureEnabled={vm.soilMoistureEnabled}
          weatherEnabled={vm.weatherEnabled}
          govtDataEnabled={vm.govtDataEnabled}
          ndviOpacity={vm.ndviOpacity}
          onNdviToggle={vm.setNdviEnabled}
          onSoilMoistureToggle={vm.setSoilMoistureEnabled}
          onWeatherToggle={vm.setWeatherEnabled}
          onGovtDataToggle={vm.setGovtDataEnabled}
          onNdviOpacityChange={vm.setNdviOpacity}
        />
      )}
      <View style={styles.legendContainer} />
      <MapFloatingButton
        icon="locate"
        onPress={vm.onCenterUser}
        position="bottom-right"
        variant="secondary"
      />
      <MapFloatingButton
        icon="add"
        onPress={vm.onZoomIn}
        position="bottom-left"
        variant="primary"
      />
      <MapFloatingButton
        icon="remove"
        onPress={vm.onZoomOut}
        position="bottom-left"
        variant="primary"
        style={{ bottom: 76 }}
      />
      {!vm.drawMode && (
        <MapFloatingButton
          icon="create-outline"
          onPress={vm.onStartDraw}
          position="bottom-right"
          variant="primary"
          style={{ bottom: 70 }}
        />
      )}
    </View>
    {vm.drawMode ? (
      <SatelliteDrawControls
        pointCount={vm.drawnPoints.length}
        onUndoLastPoint={vm.onUndoLastPoint}
        onCancel={vm.onCancelDraw}
        onSave={vm.onSavePlot}
      />
    ) : (
      <View style={styles.timelapseContainer} />
    )}
  </SafeAreaView>
);

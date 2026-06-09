import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketStackParamList } from './marketRoutes';
import {
  MarketHomeScreen,
  PriceTrendScreen,
  MandiListScreen,
  DemandMapScreen,
  AIInsightScreen,
  ArrivalsScreen,
  OversupplyAlertScreen,
  FindBuyersScreen,
  PriceForecastScreen,
  AlertsCentreScreen,
  FilterSearchScreen,
  CropCompareScreen,
  MspFrpScreen,
  EmptyStateScreen,
  ColdStorageListScreen,
  ColdStorageDetailScreen,
  ColdStorageBookingScreen,
  StorageBookingConfirmedScreen,
} from '../screens';

const Stack = createNativeStackNavigator<MarketStackParamList>();

/** Market Intelligence module — all 14 screens. */
export default function MarketStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketHome" component={MarketHomeScreen} />
      <Stack.Screen name="PriceTrend" component={PriceTrendScreen} />
      <Stack.Screen name="MandiList" component={MandiListScreen} />
      <Stack.Screen name="DemandMap" component={DemandMapScreen} />
      <Stack.Screen name="AIInsight" component={AIInsightScreen} />
      <Stack.Screen name="Arrivals" component={ArrivalsScreen} />
      <Stack.Screen name="OversupplyAlert" component={OversupplyAlertScreen} />
      <Stack.Screen name="FindBuyers" component={FindBuyersScreen} />
      <Stack.Screen name="PriceForecast" component={PriceForecastScreen} />
      <Stack.Screen name="AlertsCentre" component={AlertsCentreScreen} />
      <Stack.Screen name="FilterSearch" component={FilterSearchScreen} />
      <Stack.Screen name="CropCompare" component={CropCompareScreen} />
      <Stack.Screen name="MspFrp" component={MspFrpScreen} />
      <Stack.Screen name="MarketEmpty" component={EmptyStateScreen} />
      <Stack.Screen name="ColdStorageList" component={ColdStorageListScreen} />
      <Stack.Screen name="ColdStorageDetail" component={ColdStorageDetailScreen} />
      <Stack.Screen name="ColdStorageBooking" component={ColdStorageBookingScreen} />
      <Stack.Screen name="StorageBookingConfirmed" component={StorageBookingConfirmedScreen} />
    </Stack.Navigator>
  );
}

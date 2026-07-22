import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/tokens';
import FarmerHomeStack from './FarmerHomeStack';
import MyLeasesStack from './MyLeasesStack';
import MyCropsStack from './MyCropsStack';
import HubStack from './HubStack';
import { MarketStack } from '../modules/market';

export type FarmerTabParamList = {
  FarmerHome: undefined;
  MyLeases: undefined;
  MyCrops: undefined;
  Market: undefined;
  Hub: undefined;
};

const Tab = createBottomTabNavigator<FarmerTabParamList>();

const tabIconConfig: Record<
  keyof FarmerTabParamList,
  { active: string; inactive: string; label: string }
> = {
  FarmerHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  MyLeases: { active: 'document-text', inactive: 'document-text-outline', label: 'My Leases' },
  MyCrops: { active: 'leaf', inactive: 'leaf-outline', label: 'My Crops' },
  Market: { active: 'bar-chart', inactive: 'bar-chart-outline', label: 'Market' },
  Hub: { active: 'grid', inactive: 'grid-outline', label: 'Hub' },
};

export default function FarmerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: tabIconConfig[route.name].label,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={tabIconConfig[route.name][focused ? 'active' : 'inactive']}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="FarmerHome" component={FarmerHomeStack} />
      <Tab.Screen name="MyLeases" component={MyLeasesStack} />
      <Tab.Screen name="MyCrops" component={MyCropsStack} />
      <Tab.Screen name="Market" component={MarketStack} />
      <Tab.Screen name="Hub" component={HubStack} />
    </Tab.Navigator>
  );
}

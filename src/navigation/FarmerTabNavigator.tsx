import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
// @ts-ignore - react-native-vector-icons types may not be available
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/tokens';
import FarmerHomeStack from './FarmerHomeStack';
import MyCropsStack from './MyCropsStack';
import MachineryStack from './MachineryStack';
import HubStack from './HubStack';
import { MarketStack } from '../modules/market';

export type FarmerTabParamList = {
  FarmerHome: undefined;
  MyCrops: undefined;
  Machinery: undefined;
  Market: undefined;
  Hub: undefined;
};

const Tab = createBottomTabNavigator<FarmerTabParamList>();

const tabIconConfig: Record<
  keyof FarmerTabParamList,
  { active: string; inactive: string; label: string }
> = {
  FarmerHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  MyCrops: { active: 'leaf', inactive: 'leaf-outline', label: 'My Crops' },
  // MaterialCommunityIcons has no outline variant for "tractor", so both states use the same glyph.
  Machinery: { active: 'tractor-variant', inactive: 'tractor-variant', label: 'Machinery' },
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
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = tabIconConfig[route.name][focused ? 'active' : 'inactive'];
          const IconComponent = route.name === 'Machinery' ? MaterialCommunityIcons : Ionicons;
          return <IconComponent name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FarmerHome" component={FarmerHomeStack} />
      <Tab.Screen name="MyCrops" component={MyCropsStack} />
      <Tab.Screen name="Machinery" component={MachineryStack} />
      <Tab.Screen name="Market" component={MarketStack} />
      <Tab.Screen name="Hub" component={HubStack} />
    </Tab.Navigator>
  );
}

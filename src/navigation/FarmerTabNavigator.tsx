import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/tokens';
import FarmerHomeStack from './FarmerHomeStack';
import MyLeasesScreen from '../screens/farmer/MyLeasesScreen';
import MyCropsScreen from '../screens/farmer/MyCropsScreen';
import HubStack from './HubStack';
import SettingsScreen from '../screens/SettingsScreen';

export type FarmerTabParamList = {
  FarmerHome: undefined;
  MyLeases: undefined;
  MyCrops: undefined;
  Hub: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<FarmerTabParamList>();

const tabIconConfig: Record<
  keyof FarmerTabParamList,
  { active: string; inactive: string; label: string }
> = {
  FarmerHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  MyLeases: { active: 'document-text', inactive: 'document-text-outline', label: 'My Leases' },
  MyCrops: { active: 'leaf', inactive: 'leaf-outline', label: 'My Crops' },
  Hub: { active: 'grid', inactive: 'grid-outline', label: 'Hub' },
  Settings: { active: 'settings', inactive: 'settings-outline', label: 'Settings' },
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
      <Tab.Screen name="MyLeases" component={MyLeasesScreen} />
      <Tab.Screen name="MyCrops" component={MyCropsScreen} />
      <Tab.Screen name="Hub" component={HubStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
// @ts-ignore - react-native-vector-icons types may not be available
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/tokens';
import OwnerHomeStack from './OwnerHomeStack';
import MyPropertiesStack from './MyPropertiesStack';
import MachineryStack from './MachineryStack';
import HubStack from './HubStack';
import { MarketStack } from '../modules/market';

export type OwnerTabParamList = {
  OwnerHome: undefined;
  MyProperties: undefined;
  Machinery: undefined;
  Market: undefined;
  Hub: undefined;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const tabIconConfig: Record<
  keyof OwnerTabParamList,
  { active: string; inactive: string; label: string }
> = {
  OwnerHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  MyProperties: { active: 'map', inactive: 'map-outline', label: 'Properties' },
  // MaterialCommunityIcons has no outline variant for "tractor", so both states use the same glyph.
  Machinery: { active: 'tractor-variant', inactive: 'tractor-variant', label: 'Machinery' },
  Market: { active: 'bar-chart', inactive: 'bar-chart-outline', label: 'Market' },
  Hub: { active: 'grid', inactive: 'grid-outline', label: 'Hub' },
};

export default function OwnerTabNavigator() {
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
      <Tab.Screen name="OwnerHome" component={OwnerHomeStack} />
      <Tab.Screen name="MyProperties" component={MyPropertiesStack} />
      <Tab.Screen name="Machinery" component={MachineryStack} />
      <Tab.Screen name="Market" component={MarketStack} />
      <Tab.Screen name="Hub" component={HubStack} />
    </Tab.Navigator>
  );
}

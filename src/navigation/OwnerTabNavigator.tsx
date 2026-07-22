import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/tokens';
import OwnerHomeStack from './OwnerHomeStack';
import MyPropertiesStack from './MyPropertiesStack';
import TenantsScreen from '../screens/owner/TenantsScreen';
import HubStack from './HubStack';
import { MarketStack } from '../modules/market';

export type OwnerTabParamList = {
  OwnerHome: undefined;
  MyProperties: undefined;
  Tenants: undefined;
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
  Tenants: { active: 'people', inactive: 'people-outline', label: 'Tenants' },
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
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={tabIconConfig[route.name][focused ? 'active' : 'inactive']}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="OwnerHome" component={OwnerHomeStack} />
      <Tab.Screen name="MyProperties" component={MyPropertiesStack} />
      <Tab.Screen name="Tenants" component={TenantsScreen} />
      <Tab.Screen name="Market" component={MarketStack} />
      <Tab.Screen name="Hub" component={HubStack} />
    </Tab.Navigator>
  );
}

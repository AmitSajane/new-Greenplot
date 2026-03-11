import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/tokens';
import OwnerHomeStack from './OwnerHomeStack';
import MyPropertiesStack from './MyPropertiesStack';
import TenantsScreen from '../screens/owner/TenantsScreen';
import HubStack from './HubStack';
import SettingsStack from './SettingsStack';

export type OwnerTabParamList = {
  OwnerHome: undefined;
  MyProperties: undefined;
  Tenants: undefined;
  Hub: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const tabIconConfig: Record<
  keyof OwnerTabParamList,
  { active: string; inactive: string; label: string }
> = {
  OwnerHome: { active: 'home', inactive: 'home-outline', label: 'Home' },
  MyProperties: { active: 'map', inactive: 'map-outline', label: 'Properties' },
  Tenants: { active: 'people', inactive: 'people-outline', label: 'Tenants' },
  Hub: { active: 'grid', inactive: 'grid-outline', label: 'Hub' },
  Settings: { active: 'settings', inactive: 'settings-outline', label: 'Settings' },
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
      <Tab.Screen name="Hub" component={HubStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

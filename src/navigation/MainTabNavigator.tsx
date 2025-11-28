import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BusinessScreen from '../screens/BusinessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyShiftsScreen from '../screens/MyShiftsScreen';
import AvailableShiftsScreen from '../screens/AvailableShiftsScreen';
import { colors } from '../theme/tokens';

export type MainTabParamList = {
  Home: undefined;
  MyShifts: undefined;
  AvailableShifts: undefined;
  Business: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIconConfig: Record<
  keyof MainTabParamList,
  { active: string; inactive: string }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  MyShifts: { active: 'briefcase', inactive: 'briefcase-outline' },
  AvailableShifts: { active: 'calendar', inactive: 'calendar-outline' },
  Business: { active: 'briefcase', inactive: 'briefcase-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={tabIconConfig[route.name][focused ? 'active' : 'inactive']}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="MyShifts"
        component={MyShiftsScreen}
        options={{ title: 'My Shifts' }}
      />
      <Tab.Screen
        name="AvailableShifts"
        component={AvailableShiftsScreen}
        options={{ title: 'Available' }}
      />
      <Tab.Screen name="Business" component={BusinessScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

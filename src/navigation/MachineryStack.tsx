import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MachineryScreen from '../screens/MachineryScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import SettingsStack from './SettingsStack';

// Wraps MachineryScreen the same way every other tab wraps its root screen
// (MyCropsStack, HubStack, MarketStack, ...) so the profile avatar / bell in
// AppHeader have somewhere to navigate to from within this tab.
export type MachineryStackParamList = {
  Machinery: undefined;
  NotificationsCenter: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MachineryStackParamList>();

export default function MachineryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Machinery" component={MachineryScreen} />
      <Stack.Screen
        name="NotificationsCenter"
        component={NotificationsCenterScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}

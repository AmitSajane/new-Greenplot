import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/settings';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  LanguageSelection: { fromAuth?: boolean };
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        initialParams={{ fromAuth: false }}
      />
    </Stack.Navigator>
  );
}

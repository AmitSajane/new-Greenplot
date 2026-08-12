import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/settings';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import SettingsWebViewScreen from '../screens/settings/SettingsWebViewScreen';
import LegalDocumentScreen from '../screens/settings/LegalDocumentScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  LanguageSelection: { fromAuth?: boolean };
  SettingsWebView: { title: string; url: string };
  LegalDocument: { document: 'privacy' | 'terms' };
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SettingsWebView" component={SettingsWebViewScreen} />
      <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        initialParams={{ fromAuth: false }}
      />
    </Stack.Navigator>
  );
}

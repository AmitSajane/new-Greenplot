import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import FarmerTabNavigator from './FarmerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';
import ProfileOnboardingScreen from '../screens/ProfileOnboardingScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  LanguageSelection: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function MainNavigator() {
  const { user } = useAuth();

  if (user?.role === 'farmer') {
    return <FarmerTabNavigator />;
  } else if (user?.role === 'owner') {
    return <OwnerTabNavigator />;
  }

  // Fallback - should not reach here if authenticated
  return null;
}

export default function AppNavigator() {
  const { isAuthenticated, realAuth, authReady } = useAuth();

  if (realAuth && !authReady) {
    // Saved session is still being restored — wait instead of treating the
    // user as logged out, or an already-authenticated farmer/owner would
    // briefly (or fully) see Onboarding again on every app reopen.
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {realAuth ? (
          // Live mode (Supabase): real login gate, then the app.
          isAuthenticated ? (
            <RootStack.Screen name="Main" component={MainNavigator} />
          ) : (
            <RootStack.Screen name="Onboarding" component={ProfileOnboardingScreen} />
          )
        ) : (
          // Mock mode (no backend): existing onboarding/profile flow.
          <>
            <RootStack.Screen name="Auth" component={AuthStack} />
            <RootStack.Screen name="Main" component={MainNavigator} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

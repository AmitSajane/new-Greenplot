import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FarmerTabNavigator from './FarmerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';
import ProfileOnboardingScreen from '../screens/ProfileOnboardingScreen';
import SplashScreen from '../screens/SplashScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  LanguageSelection: undefined;
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
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Keep the branded splash visible for at least 1.2 seconds and, in live
  // mode, until the saved Supabase session has been restored. This prevents
  // logged-in users from briefly seeing onboarding during startup.
  if (!splashComplete || (realAuth && !authReady)) {
    return <SplashScreen autoNavigate={false} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={ProfileOnboardingScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

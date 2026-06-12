import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import FarmerTabNavigator from './FarmerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';
import SupabaseAuthScreen from '../screens/SupabaseAuthScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  LanguageSelection: undefined;
  Auth: undefined;
  SupabaseAuth: undefined;
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
  const { isAuthenticated, realAuth } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {realAuth ? (
          // Live mode (Supabase): real login gate, then the app.
          isAuthenticated ? (
            <RootStack.Screen name="Main" component={MainNavigator} />
          ) : (
            <RootStack.Screen name="SupabaseAuth" component={SupabaseAuthScreen} />
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

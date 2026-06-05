import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import FarmerTabNavigator from './FarmerTabNavigator';
import OwnerTabNavigator from './OwnerTabNavigator';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  LanguageSelection: undefined;
  Auth: undefined;
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
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* <RootStack.Screen name="LanguageSelection" component={require("../screens/LanguageSelectionScreen").default} /> */}
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="Main" component={MainNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

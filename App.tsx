/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ShiftsProvider } from './src/context/ShiftsContext';
import { AuthProvider } from './src/context/AuthContext';
import { FarmListingsProvider } from './src/context/FarmListingsContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <FarmListingsProvider>
          {/* <ShiftsProvider> */}
            <AppNavigator />
          {/* </ShiftsProvider> */}
        </FarmListingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

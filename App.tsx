/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FarmListingsProvider } from './src/context/FarmListingsContext';
import { SatelliteMapProvider } from './src/context/SatelliteMapContext';
import { laborStore } from './src/modules/labor/redux/store';
import i18n from './src/localization/i18n';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <I18nextProvider i18n={i18n}>
        <Provider store={laborStore}>
          <AuthProvider>
            <FarmListingsProvider>
              <SatelliteMapProvider>
                <AppNavigator />
              </SatelliteMapProvider>
            </FarmListingsProvider>
          </AuthProvider>
        </Provider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

export default App;

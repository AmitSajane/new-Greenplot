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
import { HotUpdater } from '@hot-updater/react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FarmListingsProvider } from './src/context/FarmListingsContext';
import { LeaseProvider } from './src/context/LeaseContext';
import { CropCycleProvider } from './src/context/CropCycleContext';
import { SatelliteMapProvider } from './src/context/SatelliteMapContext';
import { laborStore } from './src/modules/labor/redux/store';
import i18n from './src/localization/i18n';
import { ENV, isHotUpdaterConfigured } from './src/config/env';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <I18nextProvider i18n={i18n}>
        <Provider store={laborStore}>
          <AuthProvider>
            <FarmListingsProvider>
              <LeaseProvider>
                <CropCycleProvider>
                  <SatelliteMapProvider>
                    <AppNavigator />
                  </SatelliteMapProvider>
                </CropCycleProvider>
              </LeaseProvider>
            </FarmListingsProvider>
          </AuthProvider>
        </Provider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

// HotUpdater.wrap() throws if given an empty baseURL, so it's only applied
// once HOT_UPDATER_BASE_URL is actually set in .env (see src/config/env.ts) —
// until then this exports the app completely unwrapped, same as before OTA
// was added. Run `npx hot-updater init --provider supabase` to provision the
// backend and get that URL.
export default isHotUpdaterConfigured
  ? HotUpdater.wrap({
      baseURL: ENV.hotUpdaterBaseUrl,
      updateStrategy: 'appVersion',
    })(App)
  : App;

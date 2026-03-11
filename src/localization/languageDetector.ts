import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LanguageDetectorModule } from 'i18next';

export const LANGUAGE_STORAGE_KEY = 'greenplot_language';

const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        callback(stored);
        return;
      }
    } catch (e) {
      console.warn('[i18n] Failed to read language from storage', e);
    }
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (e) {
      console.warn('[i18n] Failed to persist language', e);
    }
  },
};

export default languageDetector;

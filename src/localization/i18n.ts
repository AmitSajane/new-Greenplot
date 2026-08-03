import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import languageDetector from './languageDetector';
import en from './resources/en.json';

export const AVAILABLE_LANGUAGES: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
  mr: 'मराठी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
};

/** Short label shown on header language buttons per selected language. */
export const LANGUAGE_SHORT_LABELS: Record<string, string> = {
  en: 'EN', hi: 'हि', kn: 'ಕ', mr: 'म', te: 'తె', ta: 'த',
};

const resources: Resource = {
  en: { common: en },
};

export async function loadLanguage(lng: string) {
  if (!i18n.hasResourceBundle(lng, 'common')) {
    try {
      let mod: any;
      switch (lng) {
        case 'hi':
          mod = await import('./resources/hi.json');
          break;
        case 'kn':
          mod = await import('./resources/kn.json');
          break;
        case 'mr':
          mod = await import('./resources/mr.json');
          break;
        case 'te':
          mod = await import('./resources/te.json');
          break;
        case 'ta':
          mod = await import('./resources/ta.json');
          break;
        default:
          mod = null;
      }
      if (mod?.default) {
        i18n.addResourceBundle(lng, 'common', mod.default, true, true);
      }
    } catch (e) {
      console.warn('[i18n] Failed to load language bundle', lng, e);
    }
  }
  await i18n.changeLanguage(lng);
}

if (!i18n.isInitialized) {
  i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      fallbackLng: 'en',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      saveMissing: true,
      missingKeyHandler: (lngs, ns, key) => {
        console.warn(`[i18n missing] ${lngs}::${ns}::${key}`);
      },
    })
    .catch((e) => {
      console.warn('[i18n] init error', e);
    });
}

export default i18n;

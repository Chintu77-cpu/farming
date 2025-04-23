import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

import enTranslation from '../locales/en.json';
import hiTranslation from '../locales/hi.json';
import teTranslation from '../locales/te.json';

// Initialize i18next with all the required configurations
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      te: {
        translation: teTranslation
      }
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

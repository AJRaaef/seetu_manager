import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationSI from './locales/si.json';
import translationTA from './locales/ta.json';

const resources = {
  en: { translation: translationEN },
  si: { translation: translationSI },
  ta: { translation: translationTA },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

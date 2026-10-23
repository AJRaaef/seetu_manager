import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files for each language (stored in src/locales/)
import translationEN from './locales/en.json';
import translationSI from './locales/si.json';
import translationTA from './locales/ta.json';

// Map each language code to its translation dictionary
const resources = {
  en: { translation: translationEN },
  si: { translation: translationSI },
  ta: { translation: translationTA },
};

// Read the saved language preference safely.
// localStorage can throw in some browsers (e.g. private mode), so we wrap it.
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch (e) {
    return 'en';
  }
};

i18n
  .use(initReactI18next) // Connects i18next to React (enables useTranslation)
  .init({
    resources,
    lng: getSavedLanguage(),   // Start with the saved language, or English
    fallbackLng: 'en',         // If a key is missing in the chosen language, use English
    supportedLngs: ['en', 'si', 'ta'],
    interpolation: {
      escapeValue: false,      // React already escapes values, so no need to escape again
    },
  });

  // Save the language every time it changes, from one place only
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('language', lng);
  } catch (e) {
    // localStorage may be blocked; the change still applies for this session
  }
});

export default i18n;
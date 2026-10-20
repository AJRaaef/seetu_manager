import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const changeLanguage = useCallback((lang) => {
    if (!lang) return;
    const cleanLang = lang.toLowerCase();
    setLanguage(cleanLang);
    localStorage.setItem('language', cleanLang);
    i18n.changeLanguage(cleanLang);
    document.documentElement.lang = cleanLang;
  }, [i18n]);

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    if (i18n.language !== saved) {
      i18n.changeLanguage(saved);
    }
    document.documentElement.lang = saved;
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

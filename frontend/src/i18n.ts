import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from '@/locales/ar/translation.json';
import en from '@/locales/en/translation.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'ar',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_lang',
    },
  });

const applyDirLang = (lng: string) => {
  const html = document.documentElement;
  const isAr = lng.startsWith('ar');
  html.setAttribute('lang', isAr ? 'ar' : 'en');
  html.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  document.body.classList.toggle('font-arabic', isAr);
};

applyDirLang(i18n.language);
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem('app_lang', lng); } catch {}
  applyDirLang(lng);
});

export default i18n;
import i18n from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from "react-i18next";
import { i18nBackend } from '@/utils/locale/i18nBackend';
import { zodConfig } from '@/utils/locale/validation';
import { getCurrentLang } from '@/utils/browser';

// const detector = new LanguageDetector();
// console.log('detector.detect():', detector.detect());

// Namespace for common translations (loaded once at startup)
const defaultNS = 'common';
const currentLang = getCurrentLang() || APP.defaultLang;

// Set document lang, e.g `<html lang="en">`
document.documentElement.lang = currentLang;

i18n
  .use(i18nBackend) // HttpBackend
  /** @DOCS : https://github.com/i18next/i18next-browser-languageDetector */
  // if not use this lng not store in localStorage
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({ // <HttpBackendOptions>
    // showSupportNotice: false,
    // debug: import.meta.env.DEV, // !import.meta.env.PROD, // import.meta.env.MODE === 'development',
    /**
     * if use `lng` lng not store in localStorage
     * if using a language detector, do not define the lng option
     */
    lng: currentLang, 
    fallbackLng: APP.defaultLang,
    // detection: {
    //   order: ["localStorage", "navigator"],
    //   caches: ["localStorage"],
    //   // lookupLocalStorage: "i18nextLng",
    // },
    // nonExplicitSupportedLngs: true,
    supportedLngs: Object.keys(APP.locales),
    ns: [defaultNS],
    defaultNS,
    // Fallback namespace when key not found in a specific namespace
    fallbackNS: defaultNS,
    // Only load current language (not all)
    load: 'currentOnly',
    // react: {
    //   useSuspense: false,
    // },
    // The default setting is sufficient for most modern frameworks
    interpolation: {
      escapeValue: false, // React already escapes
    },
    // Partial bundled languages - allows adding namespaces on demand
    partialBundledLanguages: true,
    // Don't save missing keys to backend (can be enabled later)
    saveMissing: false,
    // resources: {}, // CUSTOM
  });

zodConfig(i18n);

// // Helper to preload a page namespace (e.g., 'login') before rendering the page
// export const preloadPageTranslations = async (namespace: string): Promise<void> => {
//   if (!i18n.hasResourceBundle(currentLang, namespace)) {
//     await i18n.loadNamespaces(namespace);
//   }
// };

// // Helper to change language dynamically
// export const changeLanguage = async (lang: string): Promise<void> => {
//   await i18n.changeLanguage(lang);
//   localStorage.setItem('i18nextLng', lang);
//   document.documentElement.lang = lang;
// };

export default i18n;

// (async () => {
//   const LANG_KEY = localStorage.getItem('i18nextLng') || 'en';
//   const resources = await import(`./locales/${LANG_KEY}/common.json`);

//   i18n
//     // .use(Backend)
//     .use(detector)
//     .use(initReactI18next)
//     .init({
//       resources: { [LANG_KEY]: resources.default },
//       lng: LANG_KEY,

//       supportedLngs: ["id", "en"],
//       // backend: {
//       //   loadPath: "/locales/{{lng}}/{{ns}}.json",
//       // },
//       // ns: ["common"],
//       // defaultNS: "common",
//       fallbackLng: ["id", "en"],
//     });
// })();

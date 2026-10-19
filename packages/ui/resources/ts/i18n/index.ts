import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import { featureApi } from '@/core/feature';
import { i18nBackend } from './i18nBackend';
import { zodConfig } from './validation';

const defaultNS = 'common';
const currentLang = featureApi.getInitialLocale() || APP.defaultLang;

document.documentElement.lang = currentLang;

i18n
  .use(i18nBackend)
  .use(initReactI18next)
  .init({
    lng: currentLang,
    fallbackLng: APP.defaultLang,
    supportedLngs: Object.keys(APP.locales),
    ns: [defaultNS],
    defaultNS,
    fallbackNS: defaultNS,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
    },
    partialBundledLanguages: true,
    saveMissing: false,
  });

zodConfig(i18n);

/**
 * Core i18n runtime hooks. The translation runtime is always present, even in
 * single-language apps; only the locale *switcher* feature is optional.
 */
featureApi.registerTranslator((key, params) =>
  i18n.t(key, params as any) as string
);
featureApi.registerLocaleGetter(() => i18n.language);
featureApi.registerRequestHeaders(() => ({
  'Accept-Language': i18n.language || APP.defaultLang,
}));

export default i18n;

export { i18n };
export { LocaleProvider } from './LocaleProvider';
export { loadLocale } from './loadLocale';

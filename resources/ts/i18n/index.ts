import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import { i18nBackend } from './i18nBackend';
import { zodConfig } from './validation';
import { zoneStrategy } from './factory';

const defaultNS = 'common';
const currentLang = zoneStrategy().getCurrent() || APP.defaultLang;

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

export default i18n;

export { i18n };
export { LocaleProvider, useLocaleContext } from './LocaleProvider';
export { LanguageMenu } from './LanguageMenu';
export { loadLocale } from './loadLocale';
export { localeRegex, getCurrentLang, changeUrlLang } from './url';
export { setLangToUrl } from './setLangToUrl';
export * from './contract';
export * from './factory';

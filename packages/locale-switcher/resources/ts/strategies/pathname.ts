import type { LocaleStrategy } from '../contract';
import { changeUrlLang, getCurrentLang } from '../url';
import { setLangToUrl } from '../setLangToUrl';

export const pathnameStrategy: LocaleStrategy = {
  name: 'pathname',
  getCurrent: () => getCurrentLang(),
  apply: (lang) => {
    changeUrlLang(lang, window.location.pathname);
  },
  getRouterBasename: () => {
    const lang = getCurrentLang();
    return lang ? `/${lang}` : '';
  },
  localizeHref: (to, lang) => setLangToUrl(to, lang) as typeof to,
  getRequestHeaders: () => ({
    'Accept-Language': getCurrentLang() || APP.defaultLang,
  }),
  clear: () => {},
};

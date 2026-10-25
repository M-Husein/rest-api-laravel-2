import type { LocaleStrategy } from '../contract';
import { changeUrlLang, getCurrentLang, localizePath } from '../url';

export const pathnameStrategy: LocaleStrategy = {
  name: 'pathname',
  getCurrent: () => getCurrentLang(),
  apply: (lang) => {
    changeUrlLang(lang);
  },
  getRouterBasename: () => {
    const lang = getCurrentLang();
    return lang ? `/${lang}` : '';
  },
  localizeHref: (to, lang) => localizePath(to, lang) as typeof to,
  clear: () => {},
};

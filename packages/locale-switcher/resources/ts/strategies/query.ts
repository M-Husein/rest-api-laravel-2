import type { LocaleStrategy } from '../contract';
import { setLangToUrl } from '../setLangToUrl';

const getQueryLang = (): string | undefined =>
  new URLSearchParams(window.location.search).get('lang') || undefined;

export const queryStrategy: LocaleStrategy = {
  name: 'query',
  getCurrent: () => getQueryLang(),
  apply: (lang) => {
    const url = new URL(window.location.href);

    if (lang === APP.defaultLang) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }

    window.location.replace(url.toString());
  },
  getRouterBasename: () => '',
  localizeHref: (to, lang) => setLangToUrl(to, lang) as typeof to,
  clear: () => {},
};

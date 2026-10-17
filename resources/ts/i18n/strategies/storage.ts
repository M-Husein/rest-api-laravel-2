import type { LocaleStrategy } from '../contract';

export const storageStrategy: LocaleStrategy = {
  name: 'storage',
  getCurrent: () => localStorage.getItem('i18nextLng') || undefined,
  persist: (locale) => localStorage.setItem('i18nextLng', locale),
  apply: async (locale, ctx) => {
    localStorage.setItem('i18nextLng', locale);
    document.documentElement.lang = locale;
    await ctx.i18n.changeLanguage(locale);
    await ctx.loadLocale(locale);
  },
  getRouterBasename: () => '',
  localizeHref: (to) => to,
  getRequestHeaders: () => ({
    'Accept-Language': localStorage.getItem('i18nextLng') || APP.defaultLang,
  }),
  clear: () => localStorage.removeItem('i18nextLng'),
};

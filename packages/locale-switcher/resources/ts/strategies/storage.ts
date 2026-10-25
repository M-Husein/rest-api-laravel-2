import type { LocaleStrategy } from '../contract';

export const storageStrategy: LocaleStrategy = {
  name: 'storage',
  getCurrent: () => localStorage.getItem('i18nextLng') || undefined,
  apply: async (locale, ctx) => {
    localStorage.setItem('i18nextLng', locale);
    document.documentElement.lang = locale;
    await ctx.i18n.changeLanguage(locale);
    await ctx.loadLocale(locale);
  },
  getRouterBasename: () => '',
  localizeHref: (to) => to,
  clear: () => localStorage.removeItem('i18nextLng'),
};

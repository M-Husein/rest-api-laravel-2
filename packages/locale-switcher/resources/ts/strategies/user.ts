import type { LocaleStrategy } from '../contract';
import { getUser, updateUser } from '@/utils/user';

/**
 * Persist the locale on the server without blocking the UI switch.
 * Uses a dynamic import to avoid a circular dependency between the
 * dataProvider and the i18n factory.
 */
const saveToServer = (locale: string) => {
  import('@/providers/dataProvider').then(({ httpRequest }) => {
    httpRequest.put('me/language', { json: { lang: locale } })
      .catch(() => {
        // Silently ignore — local UI already switched
      });
  });
};

export const userStrategy: LocaleStrategy = {
  name: 'user',
  getCurrent: () => getUser()?.lang || undefined,
  apply: async (locale, ctx) => {
    updateUser({ lang: locale });
    saveToServer(locale);
    document.documentElement.lang = locale;
    await ctx.i18n.changeLanguage(locale);
    await ctx.loadLocale(locale);
  },
  getRouterBasename: () => '',
  localizeHref: (to) => to,
  getRequestHeaders: () => ({
    'Accept-Language': getUser()?.lang || APP.defaultLang,
  }),
  clear: () => {},
};

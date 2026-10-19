import type { LocaleStrategy } from '../contract';
import { featureApi } from '@programmeria/ui/feature';

/**
 * Persist the locale on the server without blocking the UI switch.
 * The HTTP client is provided by the UI runtime through the feature contract.
 */
const saveToServer = (locale: string) => {
  featureApi.getHttp()
    .put('me/language', { json: { lang: locale } })
    .catch(() => {
      // Silently ignore — local UI already switched
    });
};

export const userStrategy: LocaleStrategy = {
  name: 'user',
  getCurrent: () => featureApi.getUser()?.lang || undefined,
  apply: async (locale, ctx) => {
    featureApi.updateUser({ lang: locale });
    saveToServer(locale);
    document.documentElement.lang = locale;
    await ctx.i18n.changeLanguage(locale);
    await ctx.loadLocale(locale);
  },
  getRouterBasename: () => '',
  localizeHref: (to) => to,
  getRequestHeaders: () => ({
    'Accept-Language': featureApi.getUser()?.lang || APP.defaultLang,
  }),
  clear: () => {},
};

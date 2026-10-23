import { message } from 'antd';
import type { LocaleStrategy } from '../contract';
import { featureApi } from '@programmeria/ui/feature';
import { getStoredUserLocale } from '../url';

const currentUserLocale = () => getStoredUserLocale();

const saveToServer = (locale: string) =>
  featureApi.getHttp().put('me/language', { json: { lang: locale } });

export const userStrategy: LocaleStrategy = {
  name: 'user',
  getCurrent: () => currentUserLocale(),
  apply: async (locale, ctx) => {
    const previous = currentUserLocale() ?? null;

    featureApi.updateUser({ lang: locale });
    document.documentElement.lang = locale;

    try {
      await ctx.i18n.changeLanguage(locale);
      await ctx.loadLocale(locale);
      await saveToServer(locale);
    } catch {
      featureApi.updateUser({ lang: previous });
      document.documentElement.lang = previous || APP.defaultLang;
      message.error(featureApi.translate('error.unspecific'));
      await ctx.i18n.changeLanguage(previous || APP.defaultLang);
      await ctx.loadLocale(previous || APP.defaultLang);
    }
  },
  getRouterBasename: () => '',
  localizeHref: (to) => to,
  clear: () => {},
};

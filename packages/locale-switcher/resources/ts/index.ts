import { createElement } from 'react';
import { featureApi } from '@/core/feature';
import type { FeatureDescriptor } from '@/core/feature';
import { loadLocale } from '@/i18n/loadLocale';
import { publicStrategy, zoneStrategy } from './factory';
import { LanguageMenu } from './LanguageMenu';

const overlayStyle = { left: 'auto', right: 0 };

/**
 * The locale *switcher* is optional. The translation runtime and translation
 * data (core) are always present; this feature only enables user-facing
 * language switching and multi-locale plumbing (URL/storage/query/user).
 *
 * Registered on import so that core i18n initialisation (which reads
 * `featureApi.getInitialLocale()`) resolves the correct starting locale.
 */
featureApi.registerInitialLocale(
  () => zoneStrategy().getCurrent() || APP.defaultLang
);
featureApi.registerLocalizeHref((to, lang) =>
  zoneStrategy().localizeHref(to, lang)
);
featureApi.registerRouterBasename(() => publicStrategy.getRouterBasename());
featureApi.registerChangeLocale(async (lang) => {
  const { i18n } = await import('@/i18n');
  await zoneStrategy().apply(lang, { i18n, loadLocale });
});
featureApi.registerClearLocale(() => zoneStrategy().clear());
featureApi.registerNavItem({
  key: 'language',
  order: 100,
  renderMenu: () => ({
    key: 'lang',
    label: createElement(LanguageMenu),
    className: 'after-no',
  }),
  render: () => createElement(LanguageMenu, { overlayStyle }),
});

export const localeSwitcherFeature: FeatureDescriptor = {
  name: 'locale-switcher',
};

export default localeSwitcherFeature;

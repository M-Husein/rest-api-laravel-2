import type { FC, PropsWithChildren } from 'react';
import type { FeatureApi, FeatureDescriptor, FeatureNavItem } from './types';

let translator: (key: string, params?: Record<string, unknown>) => string = (
  key
) => key;
let requestHeaders: () => Record<string, string> = () => ({});
let initialLocale: () => string = () => APP.defaultLang;
let localeGetter: () => string | undefined = () => undefined;
let localizeHref: (to: any, lang: string) => any = (to) => to;
let routerBasename: () => string = () => '';
let changeLocale: (lang: string) => void | Promise<void> = async () => {};
let clearLocale: () => void = () => {};
const navItems: FeatureNavItem[] = [];

export const featureApi: FeatureApi = {
  translate: (key, params) => translator(key, params),
  registerTranslator: (fn) => {
    translator = fn;
  },

  getRequestHeaders: () => requestHeaders(),
  registerRequestHeaders: (fn) => {
    requestHeaders = fn;
  },

  getInitialLocale: () => initialLocale(),
  registerInitialLocale: (fn) => {
    initialLocale = fn;
  },

  getLocale: () => localeGetter(),
  registerLocaleGetter: (fn) => {
    localeGetter = fn;
  },

  localizeHref: <T,>(to: T, lang: string) => localizeHref(to, lang) as T,
  registerLocalizeHref: (fn) => {
    localizeHref = fn;
  },

  getRouterBasename: () => routerBasename(),
  registerRouterBasename: (fn) => {
    routerBasename = fn;
  },

  changeLocale: async (lang) => {
    await changeLocale(lang);
  },
  registerChangeLocale: (fn) => {
    changeLocale = fn;
  },

  clearLocale: () => clearLocale(),
  registerClearLocale: (fn) => {
    clearLocale = fn;
  },

  registerNavItem: (item) => {
    navItems.push(item);
    navItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  getNavItems: () => navItems,
};

export const getFeatureProviders = (
  features: FeatureDescriptor[] = []
): FC<PropsWithChildren>[] =>
  features
    .map((feature) => feature.Providers)
    .filter(Boolean) as FC<PropsWithChildren>[];

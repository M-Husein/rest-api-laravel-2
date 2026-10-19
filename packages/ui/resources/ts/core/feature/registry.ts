import type { FC, PropsWithChildren } from 'react';
import type {
  FeatureApi,
  FeatureDescriptor,
  FeatureHttp,
  FeatureI18n,
  FeatureNavItem,
  FeatureUser,
} from './types';

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
let userGetter: () => FeatureUser | null = () => null;
let userUpdater: (patch: Partial<FeatureUser>) => void = () => {};
let httpClient: FeatureHttp = {
  put: async () => undefined,
};
let i18nRuntime: FeatureI18n = {
  changeLanguage: async () => undefined,
};
let localeLoader: (lang: string) => Promise<unknown> = async () => undefined;
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

  getUser: () => userGetter(),
  registerUserGetter: (fn) => {
    userGetter = fn;
  },

  updateUser: (patch) => userUpdater(patch),
  registerUserUpdater: (fn) => {
    userUpdater = fn;
  },

  getHttp: () => httpClient,
  registerHttp: (client) => {
    httpClient = client;
  },

  getI18n: () => i18nRuntime,
  registerI18n: (i18n) => {
    i18nRuntime = i18n;
  },

  loadLocale: (lang) => localeLoader(lang),
  registerLoadLocale: (fn) => {
    localeLoader = fn;
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

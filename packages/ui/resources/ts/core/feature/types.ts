import type { FC, PropsWithChildren, ReactNode } from 'react';

export interface FeatureNavItem {
  key: string;
  order?: number;
  renderMenu?: () => unknown;
  render?: () => ReactNode;
}

export interface FeatureUser {
  lang?: string | null;
  [key: string]: unknown;
}

export interface FeatureI18n {
  changeLanguage(lang: string): Promise<unknown>;
}

export interface FeatureHttp {
  put(path: string, options?: { json?: unknown }): Promise<unknown>;
}

export interface FeatureApi {
  translate(key: string, params?: Record<string, unknown>): string;
  registerTranslator(
    fn: (key: string, params?: Record<string, unknown>) => string
  ): void;

  getRequestHeaders(): Record<string, string>;
  registerRequestHeaders(fn: () => Record<string, string>): void;

  getInitialLocale(): string;
  registerInitialLocale(fn: () => string): void;

  getLocale(): string | undefined;
  registerLocaleGetter(fn: () => string | undefined): void;

  localizeHref<T>(to: T, lang: string): T;
  registerLocalizeHref(fn: (to: any, lang: string) => any): void;

  getRouterBasename(): string;
  registerRouterBasename(fn: () => string): void;

  changeLocale(lang: string): Promise<void>;
  registerChangeLocale(fn: (lang: string) => void | Promise<void>): void;

  clearLocale(): void;
  registerClearLocale(fn: () => void): void;

  getUser(): FeatureUser | null;
  registerUserGetter(fn: () => FeatureUser | null): void;

  updateUser(patch: Partial<FeatureUser>): void;
  registerUserUpdater(fn: (patch: Partial<FeatureUser>) => void): void;

  getHttp(): FeatureHttp;
  registerHttp(client: FeatureHttp): void;

  getI18n(): FeatureI18n;
  registerI18n(i18n: FeatureI18n): void;

  loadLocale(lang: string): Promise<unknown>;
  registerLoadLocale(fn: (lang: string) => Promise<unknown>): void;

  registerNavItem(item: FeatureNavItem): void;
  getNavItems(): FeatureNavItem[];
}

export interface FeatureDescriptor {
  name: string;
  Providers?: FC<PropsWithChildren>;
}

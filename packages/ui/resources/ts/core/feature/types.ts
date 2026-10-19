import type { FC, PropsWithChildren, ReactNode } from 'react';

export interface FeatureNavItem {
  key: string;
  order?: number;
  renderMenu?: () => unknown;
  render?: () => ReactNode;
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

  registerNavItem(item: FeatureNavItem): void;
  getNavItems(): FeatureNavItem[];
}

export interface FeatureDescriptor {
  name: string;
  Providers?: FC<PropsWithChildren>;
}

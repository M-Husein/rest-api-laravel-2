import type { To } from 'react-router';

export type LocaleStrategyName = 'pathname' | 'query' | 'user' | 'storage';

export interface LocaleApplyContext {
  i18n: { changeLanguage: (lang: string) => Promise<unknown> };
  loadLocale: (lang: string) => Promise<unknown>;
}

export interface LocaleStrategy {
  readonly name: LocaleStrategyName;
  getCurrent(): string | undefined;
  persist(locale: string): void;
  apply(locale: string, ctx: LocaleApplyContext): void | Promise<void>;
  getRouterBasename(): string;
  localizeHref<T extends To>(to: T, lang: string): T;
  getRequestHeaders(): Record<string, string>;
  clear(): void;
}

import type { LocaleStrategy, LocaleStrategyName } from './contract';
import { pathnameStrategy } from './strategies/pathname';
import { storageStrategy } from './strategies/storage';

const STRATEGIES: Partial<Record<LocaleStrategyName, LocaleStrategy>> = {
  pathname: pathnameStrategy,
  storage: storageStrategy,
};

export const createLocaleStrategy = (name: LocaleStrategyName): LocaleStrategy =>
  STRATEGIES[name] ?? pathnameStrategy;

export const publicStrategy = createLocaleStrategy('pathname');
export const adminStrategy = createLocaleStrategy('storage');

export const zoneStrategy = (): LocaleStrategy =>
  window.location.pathname.startsWith('/app') ? adminStrategy : publicStrategy;

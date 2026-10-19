import type { LocaleStrategy, LocaleStrategyName } from './contract';
import { pathnameStrategy } from './strategies/pathname';
import { queryStrategy } from './strategies/query';
import { storageStrategy } from './strategies/storage';
import { userStrategy } from './strategies/user';

const STRATEGIES: Partial<Record<LocaleStrategyName, LocaleStrategy>> = {
  pathname: pathnameStrategy,
  query: queryStrategy,
  user: userStrategy,
  storage: storageStrategy,
};

export const createLocaleStrategy = (name: LocaleStrategyName): LocaleStrategy =>
  STRATEGIES[name] ?? pathnameStrategy;

export const publicStrategy = createLocaleStrategy('pathname');
export const adminStrategy = createLocaleStrategy('user');

/**
 * Resolve the active strategy from the server-injected APP.strategy,
 * falling back to a pathname sniff for safety.
 */
export const zoneStrategy = (): LocaleStrategy =>
  createLocaleStrategy(
    (APP.strategy as LocaleStrategyName) ||
    (window.location.pathname.startsWith('/app') ? 'user' : 'pathname')
  );

import type { To } from 'react-router';
import { featureApi } from '@programmeria/ui/feature';

export const localeRegex = new RegExp(`^\\/(${Object.keys(APP.locales).join('|')})(?=\\/|$)`);

const NON_LOCALIZED_PATHS = [
  '/app',
  '/api',
  '/auth',
  '/email',
  '/reset-password',
  '/up',
  '/verification',
  '/403',
];

export const isSupportedLocale = (lang: unknown): lang is string =>
  typeof lang === 'string' && Object.prototype.hasOwnProperty.call(APP.locales, lang);

export const isAdminPath = (pathname: string) =>
  pathname === '/app' || pathname.startsWith('/app/');

export const getStoredUserLocale = (): string | undefined => {
  const user = featureApi.getUser() ?? window.__APP__?.user;
  const lang = user?.lang;

  return isSupportedLocale(lang) ? lang : undefined;
};

export const getCurrentLang = (withAdmin: boolean = false) => {
  const currentPath = window.location.pathname;

  if (!isAdminPath(currentPath)) {
    return currentPath.match(localeRegex)?.[1] || '';
  }

  if (withAdmin) return '';

  return getStoredUserLocale() ?? '';
};

export const localizePathname = (pathname: string, lang: string) => {
  const stripped = pathname.replace(localeRegex, '') || '/';

  if (NON_LOCALIZED_PATHS.some((path) => stripped === path || stripped.startsWith(`${path}/`))) {
    return stripped;
  }

  if (lang === APP.defaultLang) {
    return stripped;
  }

  return stripped === '/' ? `/${lang}` : `/${lang}${stripped}`;
};

export const changeUrlLang = (lang: string, currentPath: string = window.location.pathname) => {
  const url = new URL(currentPath, window.location.origin);
  const pathname = localizePathname(url.pathname, lang);
  const search = url.search || window.location.search;
  const hash = url.hash || window.location.hash;

  window.location.replace(pathname + search + hash);
};

export const localizePath = <T extends To>(to: T, lang: string): T => {
  if (typeof to === 'string') {
    if (!to || to.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(to) || to.startsWith('//')) {
      return to;
    }

    const url = new URL(
      to.startsWith('?') ? window.location.pathname + to : to,
      window.location.origin
    );

    if (url.origin !== window.location.origin) {
      return to;
    }

    url.pathname = localizePathname(url.pathname, lang);

    return `${url.pathname}${url.search}${url.hash}` as T;
  }

  if (to && typeof to === 'object') {
    const pathname = typeof to.pathname === 'string'
      ? to.pathname
      : window.location.pathname;

    return { ...to, pathname: localizePathname(pathname, lang) };
  }

  return to;
};

import { beforeEach, describe, expect, test } from 'bun:test';
import { featureApi } from '@programmeria/ui/feature';

const runtime = globalThis as typeof globalThis & {
  APP: { locales: Record<string, string>; defaultLang: string };
  __redirectedTo?: string;
  window: {
    __APP__: { user: { lang?: string } | null };
    location: {
      origin: string;
      pathname: string;
      search: string;
      hash: string;
      replace: (url: string) => void;
    };
  };
};

runtime.APP = {
  locales: { en: 'English', id: 'Indonesia' },
  defaultLang: 'en',
};

runtime.window = {
  __APP__: { user: null },
  location: {
    origin: 'https://example.test',
    pathname: '/',
    search: '',
    hash: '',
    replace: (url: string) => {
      runtime.__redirectedTo = url;
    },
  },
};

const { changeUrlLang, getCurrentLang, getStoredUserLocale, localizePath } = await import(
  '../../packages/locale-switcher/resources/ts/url'
);

describe('localizePath', () => {
  test('prefixes non-default paths', () => {
    expect(localizePath('/articles', 'id')).toBe('/id/articles');
  });

  test('removes the prefix for the default locale', () => {
    expect(localizePath('/id/articles', 'en')).toBe('/articles');
  });

  test('preserves query strings and fragments', () => {
    expect(localizePath('/articles?page=2#top', 'id')).toBe('/id/articles?page=2#top');
  });

  test('does not double-prefix', () => {
    expect(localizePath('/id/articles', 'id')).toBe('/id/articles');
  });

  test('keeps non-localized zones and pages untouched', () => {
    expect(localizePath('/app/users', 'id')).toBe('/app/users');
    expect(localizePath('/api/v1/articles', 'id')).toBe('/api/v1/articles');
    expect(localizePath('/reset-password', 'id')).toBe('/reset-password');
  });

  test('handles path objects', () => {
    expect(localizePath({ pathname: '/articles', search: '?page=2', hash: '#top' }, 'id'))
      .toEqual({ pathname: '/id/articles', search: '?page=2', hash: '#top' });
  });

  test('leaves external URLs untouched', () => {
    expect(localizePath('https://other.test/articles', 'id')).toBe('https://other.test/articles');
  });
});

describe('changeUrlLang', () => {
  beforeEach(() => {
    runtime.__redirectedTo = undefined;
    runtime.window.location.pathname = '/';
    runtime.window.location.search = '';
    runtime.window.location.hash = '';
  });

  test('preserves the current query and hash', () => {
    runtime.window.location.pathname = '/articles';
    runtime.window.location.search = '?page=2';
    runtime.window.location.hash = '#top';

    changeUrlLang('id');

    expect(runtime.__redirectedTo).toBe('/id/articles?page=2#top');
  });

  test('removes the prefix when switching to the default locale', () => {
    runtime.window.location.pathname = '/id/articles';

    changeUrlLang('en');

    expect(runtime.__redirectedTo).toBe('/articles');
  });

  test('uses the canonical root for non-default home', () => {
    changeUrlLang('id');

    expect(runtime.__redirectedTo).toBe('/id');
  });
});

describe('getCurrentLang', () => {
  test('reads the public locale from the path', () => {
    runtime.window.location.pathname = '/id/articles';

    expect(getCurrentLang()).toBe('id');
  });

  test('does not treat /application as an admin path', () => {
    runtime.window.location.pathname = '/id/application';

    expect(getCurrentLang()).toBe('id');
  });

  test('reads the admin locale from the in-memory user', () => {
    featureApi.registerUserGetter(() => ({ lang: 'id' }));
    runtime.window.location.pathname = '/app/users';

    expect(getCurrentLang()).toBe('id');
  });

  test('falls back to the server-injected user during startup', () => {
    runtime.window.location.pathname = '/app/users';
    runtime.window.__APP__ = { user: { lang: 'id' } };
    featureApi.registerUserGetter(() => null);

    expect(getCurrentLang()).toBe('id');

    runtime.window.__APP__ = { user: null };
  });

  test('falls back to an empty string for an unsupported user locale', () => {
    featureApi.registerUserGetter(() => ({ lang: 'xx' }));
    runtime.window.location.pathname = '/app/users';

    expect(getCurrentLang()).toBe('');
  });
});

describe('getStoredUserLocale', () => {
  test('reads the server-injected user during startup', () => {
    runtime.window.__APP__ = { user: { lang: 'id' } };
    featureApi.registerUserGetter(() => null);

    expect(getStoredUserLocale()).toBe('id');

    runtime.window.__APP__ = { user: null };
  });
});

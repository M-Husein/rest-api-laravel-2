import { To } from 'react-router';

export const setLangToUrl = (to: To, lang: string): To => {
  // Don't add lang if it's the default language (optional)
  if (!(lang && lang !== APP.defaultLang)) return to;

  if (typeof to === 'string' && !to.startsWith('http')) {
    const url = new URL(to, window.location.origin);
    // Only add lang if not already present
    if (!url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
    }
    // Ensure trailing slash
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    return url.pathname + url.search + (url.hash || '');
  }

  if (typeof to === 'object' && to !== null) {
    const search = new URLSearchParams(to.search || '');
    if (!search.has('lang')) {
      search.set('lang', lang);
    }
    let pathname = to.pathname || '';
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    const newSearch = search.toString();
    return { ...to, pathname, search: newSearch };
  }

  return to;
};

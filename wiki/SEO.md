# SEO

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id/SEO)

Public-site SEO is provided by the `seo` feature package (`programmeria/laravel-seo`).

## What it provides

- a server-rendered public SPA shell with first-load meta tags;
- Open Graph and Twitter metadata;
- JSON-LD structured data;
- localized page translations through `GET /api/v1/locales/{lang}/page/{name}`;
- canonical URLs and robots directives for public and private pages.

SEO is **first-load metadata only**; the application does not use server-side rendering for
the React pages. The package requires the `ui` package because the public shell references
the bundled frontend entry points.

## Public vs private pages

- Public routes (home, about, articles, contact) receive meta tags and are indexable.
- Private/admin pages are marked `noindex` and are never intended for search engines.

## Preset

SEO is included only in the `site` preset. It requires `ui`; installing `seo` without `ui`
is rejected by the installer.

## Relationship with i18n

Localized public URLs use the `pathname` locale strategy from the `locale-switcher` feature.
The `site` preset therefore includes `ui`, `locale-switcher`, and `seo`.

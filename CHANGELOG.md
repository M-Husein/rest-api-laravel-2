# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed

- Localize public URLs with path prefixes. `/en` redirects to the unprefixed
  canonical URL, while non-default locales stay prefixed.
- Read the admin locale from the authenticated user instead of `localStorage`.
- Apply API locales in this order: `?lang`, `Accept-Language`, `users.lang`,
  default locale. API token guards use middleware for the user fallback.
- Preserve the query string and fragment when switching languages.
- Emit canonical `hreflang` URLs without an `/en` prefix.
- Send the requested language in the frontend `Accept-Language` header.
- Revert the admin locale and show an error when saving the preference fails.

### Added

- Add `LocaleResolver`, `LocaleContractTest`, and `tests/frontend/locale.test.ts`.
- Add the `test:frontend` script and run frontend tests in CI.
- Add a manual i18n smoke-test checklist to the wiki.

### Removed

- Remove `LocaleStrategy.getRequestHeaders()`. The core i18n runtime owns the
  request header and sends `i18n.language` as `Accept-Language`.

### Breaking changes

- Public non-default locale URLs require the `/id/...` prefix; `/en` is not
  canonical and redirects to the unprefixed URL.
- Admin locale no longer comes from `localStorage`; it comes from `users.lang`.
- Locale strategies no longer provide `getRequestHeaders()`.

## [0.2.0] - 2026-10-23

### Security

- Require PHP `^8.5.12` because older PHP versions are affected by PHP2Shell
  (`CVE-2026-109618`, `CVE-2026-109619`).
- Add `SECURITY.md` and `SECURITY-id_ID.md` with supported versions and the reporting policy.
- Update README requirements to PHP 8.5.12 or newer.

### Changed

- Update the GitHub Actions PHP job to PHP 8.5.12.
- Redirect successful login and registration to `/` and remove the
  `APP.redirectAfterLogin` frontend configuration.
- Write starterkit JSON files with two-space indentation.
- Format `features.json` with two spaces.
- Add the `13px` font size and `0` border radius utilities to Tailwind.

### Removed

- Remove the unused `refine_demo` auth provider files.
- Remove the unused `routes/api-OPTION.php_option` route file.

### Breaking changes

- PHP 8.3 and 8.4 are no longer supported.
- `APP.redirectAfterLogin` is no longer available in the frontend configuration.

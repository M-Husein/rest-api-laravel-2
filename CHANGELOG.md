# Changelog

All notable changes to this project are documented in this file.

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

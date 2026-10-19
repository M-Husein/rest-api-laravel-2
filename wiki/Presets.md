# Presets

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id/Presets)

Presets are product profiles, not implementation details. The same names and capabilities
are intended to be used by every language port.

## Preset contract

| No | Preset | Features | UI | Locales | Public site / SEO | Typical use case |
|----|--------|----------|----|---------|-------------------|------------------|
| 1 | `api` | — | No | Single | No | Headless API, custom frontend |
| 2 | `api-ui` | `ui` | Yes | Single | No | Private admin/auth app |
| 3 | `multilingual` | `locale-switcher` | No | Multiple | No | Multilingual API, custom frontend |
| 4 | `multilingual-ui` | `ui`, `locale-switcher` | Yes | Multiple | No | Private multilingual company system |
| 5 | `site` | `ui`, `locale-switcher`, `seo` | Yes | Multiple | Yes | Public website with SEO |

The default preset is `site`.

Notes:

- `seo` requires `ui`; a public SEO shell needs an HTML/UI layer.
- Presets without UI do not register `/app`, `/login`, `/settings`, or other HTML routes.
  Admin and authentication capabilities are exposed through the API.
- For a private multilingual system, use `multilingual-ui` rather than `multilingual`.

## Preset details

### 1. `api`

Backend and API only. Includes authentication, admin domain logic, roles, users, sessions,
and the public API endpoints. No HTML shell, no frontend build, and no public website.

Use it when the frontend is built with another framework or when the project is a service
consumed by mobile apps or third-party clients.

### 2. `api-ui`

The `api` baseline plus the bundled React/Ant Design UI. Includes the admin dashboard,
login, forgot/reset password, and account settings pages.

It does not include public marketing pages. Use it for private applications that need a
ready-to-use UI but should not be publicly indexed.

### 3. `multilingual`

The `api` baseline plus server-side locale support: the user `lang` column, locale
middleware, and the per-user language preference endpoint.

It has no UI. The frontend can be built with any framework; the API client decides how to
detect and persist the locale.

### 4. `multilingual-ui`

The `multilingual` baseline plus the bundled React/Ant Design UI. This is the recommended
preset for private multilingual company systems: authentication, admin dashboard, and
language switching without a public website.

### 5. `site`

The complete starterkit: backend, UI, multilingual support, public pages, first-load SEO
metadata, Open Graph, JSON-LD, and localized page translations.

Public routes include the home page, about, articles, contact, login, registration, and
settings. Private/admin routes remain protected by authentication and roles.

## Legacy preset names

The legacy `minimal`, `default`, and `full` presets were removed; no aliases are provided.
Use `api` instead of `minimal`, and `site` instead of `default` or `full`.

## How selection works

- Presets are resolved at **install time** by `php artisan starter:install`.
- `starterkit.json` defines the preset-to-feature mapping and the default preset.
- Overrides are available with `--with` and `--without`.
- See [Feature Management](Feature-Management) for commands and safety.

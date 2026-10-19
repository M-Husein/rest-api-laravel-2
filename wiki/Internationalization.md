# Internationalization

Multi-locale support is provided by the `locale-switcher` feature package
(`programmeria/laravel-locale-switcher`).

## Scope

The feature provides:

- a `lang` column for users;
- locale middleware for API requests;
- `PUT /api/v1/me/language` for per-user language preference;
- a language menu and pathname, storage, query, and user strategies in the UI.

Without the feature, the application runs in a single locale. With the feature and the UI,
users can switch languages and the preference is stored per user.

## Locale strategies

The frontend resolves the active strategy per zone:

| Strategy | Detection | Notes |
|----------|-----------|-------|
| `pathname` | Locale in the URL path (`/id`, `/en`) | Best for public SEO |
| `query` | `?lang=id` | Simple, no backend route changes; weaker for SEO |
| `user` | Stored per user in the database | For private apps; not for SEO |
| `storage` | Browser localStorage/cookie | Simplest; resets on logout by design |

- The public site uses the `pathname` strategy (SEO-friendly localized URLs).
- The admin area (`/app`) uses the `user` strategy and is not meant for SEO.

## Single-locale mode

When `locale-switcher` is not installed, the application runs in a single locale and the
`lang` column is not active. Presets:

- `api`, `api-ui` — single locale
- `multilingual`, `multilingual-ui`, `site` — multiple locales

## Presets

The feature is included in the `multilingual`, `multilingual-ui`, and `site` presets. For a
private multilingual system, use `multilingual-ui`.

# Rest API Laravel 2

**Languages:** English | [Bahasa Indonesia](README-id_ID.md)

A Laravel REST API starterkit built around installable feature packages and project presets.

The project started as a REST API. It is now the PHP/Laravel reference implementation of a
language-agnostic starterkit contract. The same preset model is planned for Go, Rust,
Node.js (Express/NestJS), Bun (ElysiaJS), and Python.

> **Project status**
>
> The five-preset model and the `ui` package split are implemented. `starterkit.json`
> exposes `api`, `api-ui`, `multilingual`, `multilingual-ui`, and `site` (default).
> Feature packages are discovered from `packages/*/feature.json`.

## Goals

- Provide a production-ready Laravel REST API baseline.
- Ship optional capabilities as packages instead of branches or forks.
- Let each project start from a preset: API-only, private admin app, multilingual, or a
  public website with SEO.
- Keep the frontend optional so the API can be consumed by any client or framework.
- Reuse the same preset contract across future language ports.

## Tech stack

### Backend

- **PHP** 8.5.12+
- **Laravel Framework** 13
- **PostgreSQL** (default database connection)
- **Laravel Sanctum** — SPA cookie authentication and API tokens
- **Laravel Socialite** — OAuth social login (Google, and more)
- **Spatie Laravel Permission** — roles and permissions
- **Spatie Laravel Translation Loader** — database-backed translations
- **NielsNumbers Laravel Localizer** — locale detection and localized routing
- **dedoc/scramble** — auto-generated OpenAPI documentation
- **RZL Zone Blade Minify** — HTML minification
- **Laravel Tinker**, **Pail**, **Pint**, **Sail**, **PHPUnit 12**, **Mockery** — development tooling

### UI (optional)

- **Refine** (Ant Design, React Router, REST data provider)
- **React** 19, **TypeScript**, **Vite**
- **Ant Design** UI, **i18next**, **Zod**
- Package manager: **Bun**, **npm**, or **pnpm** (the UI source is a workspace)

The UI is only installed and built for UI presets. API-only presets do not require a frontend
runtime or package manager.

## Requirements

- PHP >= 8.5.12 with the `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, and `fileinfo` extensions
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (running)
- For UI presets: [Bun](https://bun.sh/) 1.4+, or Node.js 22+ with npm 10+ or pnpm 9.15+

### Frontend package managers

UI presets support Bun, npm, and pnpm. `composer setup` and `php artisan starter:install`
detect the package manager automatically. Override the detection with
`--package-manager=bun|npm|pnpm` or the `FRONTEND_PACKAGE_MANAGER` environment variable:

```bash
FRONTEND_PACKAGE_MANAGER=npm composer setup
```

```powershell
$env:FRONTEND_PACKAGE_MANAGER="npm"; composer setup
```

Run `php artisan frontend install`, `frontend build`, or `frontend dev` directly; add
`--package-manager=bun|npm|pnpm` to override detection.

All three lockfiles are committed. Regenerate them after changing dependencies:

```bash
bun install
npm install --package-lock-only
pnpm install --lockfile-only
```

## Quick start

> **Publication status**
>
> This repository is the current distribution source. The project may be published to
> Packagist (Composer) and/or npm in the future. Until then, install it from this repository
> using `git clone` or Composer VCS below.

1. **Get the project** (choose one):
   ```bash
   git clone https://github.com/M-Husein/rest-api-laravel-2.git my-app
   cd my-app
   ```
   or install it through Composer using the VCS repository:
   ```bash
   composer create-project programmeria/rest-api-laravel-2 my-app --repository='{"type":"vcs","url":"https://github.com/M-Husein/rest-api-laravel-2.git"}'
   cd my-app
   ```

   On Windows PowerShell, escape the JSON quotes in `--repository`:
   `--repository='{\"type\":\"vcs\",\"url\":\"https://github.com/M-Husein/rest-api-laravel-2.git\"}'`.

2. **Create the environment file and configure it**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set the application values and your database connection.

3. **Generate the application key**:
   ```bash
   php artisan key:generate
   ```

4. **Create the database** matching the name configured in `.env`.

5. **Run migrations and seeders**:
   ```bash
   php artisan migrate --seed
   ```

6. **Create the storage symlink**:
   ```bash
   php artisan storage:link
   ```

7. **Choose a preset**:
   ```bash
   php artisan starter:install --preset=site
   ```
   Run the command without `--preset` for an interactive selection. The default preset is
   `site`.

When creating a project with `composer create-project`, the post-install script prints the
`starter:install` command to run next. No feature is selected automatically.

## Preset contract

Presets are product profiles, not implementation details. The same names and capabilities
are intended to be used by every language port.

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

## Architecture

| No | Layer | Package | Type | Responsibility |
|----|-------|---------|------|----------------|
| 1 | Core | application code | Laravel app | API, auth/admin domain, roles, users, sessions, localizer backend |
| 2 | UI | `programmeria/laravel-ui` / `@programmeria/ui` | Composer + workspace | Blade shells, admin/auth routes, React/Ant Design source, Vite build |
| 3 | Internationalization | `programmeria/laravel-locale-switcher` | Composer + workspace | Locale backend, user preference, language menu and frontend strategies |
| 4 | SEO | `programmeria/laravel-seo` | Composer package | Public SPA shell, meta/Open Graph/JSON-LD, page translations |

### Feature package format

Each feature can expose:

- `composer.json` — service provider, routes, migrations, views, and PHP dependencies.
- `package.json` — workspace metadata and frontend dependencies when applicable.
- `feature.json` — label, description, preset membership, requirements, conflicts, and a
  frontend flag.

Composer decides whether a feature is installed. The workspace only provides the frontend
source that Vite consumes. Frontend runtime dependencies live in
`packages/ui/package.json`; build/test tooling and workspace scripts live in the root
`package.json`.

## Feature management

List available features and presets:

```bash
php artisan starter:features
```

Apply a preset:

```bash
php artisan starter:install --preset=site
php artisan starter:install --preset=site --package-manager=npm
```

Override the selection:

```bash
php artisan starter:install --preset=multilingual-ui --without=seo
php artisan starter:install --with=locale-switcher
```

Preview changes without applying them:

```bash
php artisan starter:install --preset=api --dry-run
```

Skip follow-up steps:

```bash
php artisan starter:install --preset=api-ui --no-migrate --no-build
```

The command:

- adds or removes Composer requirements;
- rewrites `features.json`;
- regenerates the frontend feature registry when the UI is installed;
- runs migrations;
- installs frontend dependencies and builds assets with the detected package manager only
  when the UI is installed.

Removing a feature never drops database tables or user data.

### Legacy preset names

The legacy `minimal`, `default`, and `full` presets were removed; no aliases are provided.
Use `api` instead of `minimal`, and `site` instead of `default` or `full`.

## UI and no-UI presets

**No-UI presets (`api`, `multilingual`)**

- No `/app`, `/login`, `/settings`, or public HTML routes.
- No frontend install and no asset build.
- The backend is a full SPA/API backend; the frontend is your responsibility.

**UI presets (`api-ui`, `multilingual-ui`, `site`)**

- Blade shells, React/Ant Design source, routes, and build tooling are provided by the
  `ui` package.
- Install and build with Bun, npm, or pnpm before serving the UI in production:
  `bun install && bun run build`, `npm install && npm run build`, or
  `pnpm install && pnpm run build`.

## Authentication and registration

Authentication uses Laravel Sanctum: session cookies for the SPA and bearer tokens for
mobile clients. API routes live under `/api/v1`.

Registration is optional. Private deployments (for example, internal company systems) may
remove the route, the controller action, and the matching React page so accounts can only be
provisioned by an administrator.

```php
// Registration is optional. Private deployments (for example, internal
// company systems) may remove this route, the controller action, and the
// matching React page so accounts can only be provisioned by an admin.
Route::get('register', [UiController::class, 'register'])->middleware('guest');
```

```php
/**
 * Registration page (optional).
 *
 * Remove this action, its route, and the frontend page for private or
 * closed deployments where accounts are provisioned manually.
 */
public function register() { /* ... */ }
```

To disable registration:

1. Remove the `/register` route from the `ui` package routes.
2. Remove the `register` action from the UI controller.
3. Remove the React registration page and its route.
4. Keep the API registration endpoint disabled as well if the API is public.

## Internationalization

The `locale-switcher` feature provides:

- a `lang` column for users;
- locale middleware for API requests;
- `PUT /api/v1/me/language` for per-user language preference;
- a language menu and pathname, storage, query, and user strategies in the UI.

Without the feature, the application runs in a single locale. With the feature and the UI,
users can switch languages and the preference is stored per user.

## SEO

The `seo` package provides:

- a server-rendered public SPA shell with first-load meta tags;
- Open Graph and Twitter metadata;
- JSON-LD structured data;
- localized page translations through `GET /api/v1/locales/{lang}/page/{name}`;
- canonical URLs and robots directives for public and private pages.

SEO is first-load metadata only; the application does not use server-side rendering for the
React pages. The package requires the `ui` package because the public shell references the
bundled frontend entry points.

## API

- Base path: `/api/v1`
- Authentication: Laravel Sanctum (SPA cookie flow and bearer tokens for mobile)
- Interactive OpenAPI docs (Scramble): `/docs/api`
- Export the OpenAPI spec:

  ```bash
  php artisan scramble:export
  ```

Main endpoint groups:

- **Auth** — `register`, `login`, `logout`, `me`, password reset and change
- **Social auth** — OAuth redirect, mobile callback, link/unlink providers
- **Users** — CRUD and bulk delete (admin)
- **Articles**, **Contacts** — public content endpoints
- **Sessions / Tokens** — device and token management
- **Translations** — common and per-page locale translations
- **Login histories**, **Clear cache** — admin utilities

## Testing and quality

```bash
composer test
php artisan test
bun run typecheck        # or: npm run typecheck / pnpm run typecheck
bun run build            # or: npm run build / pnpm run build
bun run test:frontend    # or: npm run test:frontend / pnpm run test:frontend
composer validate --no-check-publish
```

Tests run against an in-memory SQLite database (see `phpunit.xml`) and are independent of
the PostgreSQL connection used in development. Frontend checks only apply to UI presets.

## Cross-language roadmap

The preset names are language-independent. Repository and package names may differ per
ecosystem, but the capabilities must match the preset contract.

| No | Target | Suggested repository | Status |
|----|--------|----------------------|--------|
| 1 | PHP / Laravel | `rest-api-laravel-2` | Reference implementation, in progress |
| 2 | Go | `rest-api-go` | Planned |
| 3 | Rust | `rest-api-rust` | Planned |
| 4 | Node.js (Express/NestJS) | `rest-api-node` | Planned |
| 5 | Bun (ElysiaJS) | `rest-api-bun` | Planned |
| 6 | Python | `rest-api-python` | Planned |

Guidelines for future ports:

- Keep the same five preset names: `api`, `api-ui`, `multilingual`, `multilingual-ui`, `site`.
- Do not add language names to preset names (`api-go`, `api-rust`, and so on).
- Define and version the API contract early; the React UI can be reused across backends
  when the contract is stable.
- `site` requires a server-rendered shell and metadata. If a port cannot support it yet,
  document the limitation instead of renaming the preset.

## Documentation and wiki

`README.md` and `README-id_ID.md` are the short entry points. The long-form documentation
lives in [`wiki`](wiki) and is mirrored to the GitHub wiki:

| No | Page | Contents |
|----|------|----------|
| 1 | [Home](wiki/Home.md) | Overview and links |
| 2 | [Getting Started](wiki/Getting-Started.md) | Requirements, installation, first run |
| 3 | [Presets](wiki/Presets.md) | Preset contract and use cases |
| 4 | [Architecture](wiki/Architecture.md) | Core, UI, locale-switcher, SEO boundaries |
| 5 | [Feature Management](wiki/Feature-Management.md) | Install, remove, dry-run, safety |
| 6 | [UI](wiki/UI.md) | Bundled React/Ant Design app and build |
| 7 | [Internationalization](wiki/Internationalization.md) | Locale backend and UI strategies |
| 8 | [SEO](wiki/SEO.md) | Public shell, metadata, page translations |
| 9 | [Language Ports](wiki/Language-Ports.md) | Cross-language contract and roadmap |
| 10 | [Contributing](wiki/Contributing.md) | Development workflow and tests |

An Indonesian translation lives in [`wiki/id-Home.md`](wiki/id-Home.md) and is published under
`/wiki/id-Home`.

To publish updates to the GitHub wiki, copy the contents of `wiki` (including the `id-*`
pages) into a clone of `https://github.com/M-Husein/rest-api-laravel-2.wiki.git` and push.

## Security

- Never commit `.env`, application keys, OAuth secrets, or database credentials.
- Use environment variables for secrets and rotate them after any exposure.
- PHP >= 8.5.12 is required because older PHP versions are affected by PHP2Shell
  (`CVE-2026-109618`, `CVE-2026-109619`).
- Report security issues privately to the maintainers instead of opening a public issue.
- See [SECURITY.md](SECURITY.md) for supported versions and the reporting policy.

## License

MIT License. Copyright (c) 2026 Programmeria. See [LICENSE](LICENSE).

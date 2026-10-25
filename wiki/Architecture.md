# Architecture

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-Architecture)

## Layers

| No | Layer | Package | Type | Responsibility |
|----|-------|---------|------|----------------|
| 1 | Core | application code | Laravel app | API, auth/admin domain, roles, users, sessions, localizer backend |
| 2 | UI | `programmeria/laravel-ui` / `@programmeria/ui` | Composer + workspace | Blade shells, admin/auth routes, React/Ant Design source, Vite build |
| 3 | Internationalization | `programmeria/laravel-locale-switcher` | Composer + workspace | Locale backend, user preference, language menu and frontend strategies |
| 4 | SEO | `programmeria/laravel-seo` | Composer package | Public SPA shell, meta/Open Graph/JSON-LD, page translations |

## Repository layout

```
packages/
  ui/               programmeria/laravel-ui + @programmeria/ui
  locale-switcher/  programmeria/laravel-locale-switcher
  seo/              programmeria/laravel-seo
app/Support/Frontend/  package manager detection and commands
app/Support/Starter/  installer, repository, manifest, JSON IO
starterkit.json       preset-to-feature mapping
features.json         selected features (source of truth for codegen)
scripts/generate-features.mjs  frontend registry codegen
```

## Feature package format

Each feature can expose:

- `composer.json` — service provider, routes, migrations, views, and PHP dependencies.
- `package.json` — workspace metadata and frontend dependencies when applicable.
- `feature.json` — label, description, preset membership, requirements, conflicts, and a
  `frontend` flag.

`feature.json` fields:

| Field | Meaning |
|-------|---------|
| `label`, `description` | Human-readable metadata |
| `presets` | Presets that include this feature |
| `requires` | Features that must also be installed |
| `conflicts` | Features that cannot be installed together |
| `frontend` | Whether the package contributes a module imported by the generated feature registry |

Composer decides whether a feature is installed. The workspace only provides the frontend
source that Vite consumes. Frontend runtime dependencies live in
`packages/ui/package.json`; build/test tooling and workspace scripts live in the root
`package.json`.

## Composer and workspace wiring

- Composer uses a **path repository** (`packages/*`) with symlinks, so local packages are
  installed directly from the repository.
- Bun and npm read the `workspaces` field in `package.json`; pnpm reads
  `pnpm-workspace.yaml`. The Vite alias `/^@programmeria\/([^/]+)$/` resolves to
  `packages/$1/resources/ts/index.ts`, so TypeScript is consumed as source.
- `app/Support/Frontend/PackageManager.php` detects Bun, npm, or pnpm and provides the
  install, dev, build, and test commands used by the installer and Artisan commands.
- `bun.lock`, `package-lock.json`, and `pnpm-lock.yaml` are all committed.
- Feature constraints are wildcard form (`0.1.*`) so they are safe to pass through
  `cmd.exe` on Windows.

## Frontend registry and codegen

- `features.json` lists the selected features and the subset that provides a frontend
  module.
- `scripts/generate-features.mjs` reads `features.json` and writes
  `packages/ui/resources/ts/features.generated.ts`.
- Codegen only runs for UI presets; API-only presets skip it.

## Runtime behavior

- Service providers are registered conditionally based on installed packages
  (`class_exists`), so removing a feature package removes its routes and views.
- Login redirects are conditional: after login, UI behaves as configured by
  `APP.redirectAfterLogin` (`/` when SEO is present, otherwise `/app`).
- Guest redirects point to `/login` only when the `ui` package is installed.

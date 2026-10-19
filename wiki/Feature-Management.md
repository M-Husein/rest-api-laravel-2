# Feature Management

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-Feature-Management)

## Commands

List available features and presets:

```bash
php artisan starter:features
```

Apply a preset:

```bash
php artisan starter:install --preset=site
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

When running non-interactively (for example in scripts) add `--no-interaction` to avoid the
confirmation prompt.

## What the command does

- adds or removes Composer requirements;
- rewrites `features.json`;
- regenerates the frontend feature registry when the UI is installed;
- runs migrations;
- installs frontend dependencies and builds assets only when the UI is installed.

## Safety

- Removing a feature **never drops database tables or user data**.
- `--dry-run` prints the plan without changing anything.
- Requirement and conflict rules are validated before any change is applied.
- Unknown presets or features fail fast with the available options listed.

## How it works

- `FeatureRepository` discovers packages from `packages/*/feature.json` and resolves the
  desired set from a preset plus overrides.
- `FeatureInstaller` runs `composer require` / `composer remove`, rewrites `features.json`,
  regenerates the frontend registry, migrates, and builds.
- Composer requirements use the path repository and the `0.1.*` constraint.

## UI and no-UI presets

**No-UI presets (`api`, `multilingual`)**

- No `/app`, `/login`, `/settings`, or public HTML routes.
- No `bun install` and no asset build.

**UI presets (`api-ui`, `multilingual-ui`, `site`)**

- Blade shells, React/Ant Design source, routes, and build tooling are provided by the
  `ui` package.
- `bun install` and `bun run build` are required before serving the UI in production.

> Always run `bun install`, `bun run dev`, and `bun run build` **from the repository root**,
> never from inside `packages/ui`.

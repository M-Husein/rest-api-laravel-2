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

Choose an RBAC preset:

```bash
php artisan starter:install --preset=site --rbac=advanced
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

## RBAC presets

RBAC is optional and independent from product presets. The default is `simple`.

| Preset | Behavior |
|--------|----------|
| `simple` | Role-only `Admin`/`Member` protection. No granular permissions. |
| `standard` | Roles plus granular permissions. `Admin` gets all permissions; `Member` gets none. |
| `advanced` | Granular permissions, model policies, and ownership checks. `Member` can view only their own login histories. |
| `none` | No role or permission enforcement. Authenticated users pass RBAC checks. |

The selection is stored as `rbac` in `features.json`. Applying a preset seeds roles and
permissions unless `--no-migrate` is used. Changing the preset does not reassign existing
users, and `none` disables enforcement without deleting existing roles or permissions.

## How it works

- `FeatureRepository` discovers packages from `packages/*/feature.json` and resolves the
  desired set from a preset plus overrides.
- `FeatureInstaller` runs `composer require` / `composer remove`, rewrites `features.json`,
  regenerates the frontend registry, migrates, and builds with the detected package manager.
- Composer requirements use the path repository and the `0.1.*` constraint.

## UI and no-UI presets

**No-UI presets (`api`, `multilingual`)**

- No `/app`, `/login`, `/settings`, or public HTML routes.
- No frontend install and no asset build.

**UI presets (`api-ui`, `multilingual-ui`, `site`)**

- Blade shells, React/Ant Design source, routes, and build tooling are provided by the
  `ui` package.
- Install and build with Bun, npm, or pnpm before serving the UI in production.
- Override automatic detection with `--package-manager=bun|npm|pnpm`.

> Always run install, dev, and build commands **from the repository root**, never from
> inside `packages/ui`.

# UI

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-UI)

The bundled UI is provided by the `ui` feature package
(`programmeria/laravel-ui` / `@programmeria/ui`).

## What is included

- Blade shells for the public, admin, and authentication areas.
- The React 19 + Refine + Ant Design application source under
  `packages/ui/resources/ts`.
- Admin/auth routes (`/login`, `/register`, `/settings`, `/app`) and public routes for the
  UI presets.
- Vite build configuration and frontend build/test tooling.

## Installing and building

The UI is required by the `api-ui`, `multilingual-ui`, and `site` presets. For these presets,
run both commands **from the repository root**:

```bash
bun install && bun run build
# or
npm install && npm run build
# or
pnpm install && pnpm run build
```

Override automatic detection with `--package-manager=bun|npm|pnpm`:

```bash
php artisan frontend build --package-manager=npm
```

Never run the commands inside `packages/ui`.

API-only presets (`api`, `multilingual`) skip install, codegen, and build entirely, so no
frontend runtime or package manager is needed.

## How the UI package is wired

- It is a Composer package (path repository) plus a workspace. Bun and npm read the
  `workspaces` field in `package.json`; pnpm reads `pnpm-workspace.yaml`.
- Runtime dependencies live in `packages/ui/package.json`; build and test tooling lives in
  the root `package.json`.
- Vite resolves `@programmeria/<feature>` to `packages/<feature>/resources/ts/index.ts`, so
  feature TypeScript is consumed as source.
- Feature packages talk to the UI runtime through the public contract
  `@programmeria/ui/feature` (`featureApi`). The `@/` alias is UI-internal and blocked for
  other packages by ESLint.
- The feature registry (`features.generated.ts`) is generated from `features.json`.

## Routes

- Private/admin routes live under `/app` and are protected by authentication and roles.
- Authentication routes include login, registration, forgot password, and reset password.
- The admin area is intentionally not indexed by search engines.

## Registration is optional

Registration is enabled by default. Private deployments (for example, internal company
systems) may remove the route, the controller action, and the matching React page so accounts
can only be provisioned by an administrator.

```php
// Registration is optional. Private deployments (for example, internal
// company systems) may remove this route, the controller action, and the
// matching React page so accounts can only be provisioned by an admin.
Route::get('register', [UiController::class, 'register'])->middleware('guest');
```

To disable registration:

1. Remove the `/register` route from the `ui` package routes.
2. Remove the `register` action from the UI controller.
3. Remove the React registration page and its route.
4. Keep the API registration endpoint disabled as well if the API is public.

## Known limitations

- Feature TypeScript targets the React UI runtime. Presets without the UI (`api`,
  `multilingual`) do not install or build any frontend code.

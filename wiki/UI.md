# UI

The bundled UI is provided by the `ui` feature package
(`programmeria/laravel-ui` / `@programmeria/ui`).

## What is included

- Blade shells for the public, admin, and authentication areas.
- The React 19 + Refine + Ant Design application source under
  `packages/ui/resources/ts`.
- Admin/auth routes (`/login`, `/register`, `/settings`, `/app`) and public routes for the
  UI presets.
- Vite build configuration and all frontend dependencies.

## Installing and building

The UI is required by the `api-ui`, `multilingual-ui`, and `site` presets. For these presets:

```bash
bun install
bun run build
```

Run both commands **from the repository root**. Never run them inside `packages/ui`.

API-only presets (`api`, `multilingual`) skip install, codegen, and build entirely, so no
Node.js or Bun installation is needed.

## How the UI package is wired

- It is a Composer package (path repository) plus a Bun workspace.
- All frontend dependencies live in `packages/ui/package.json`; the root `package.json`
  keeps only workspace definitions and scripts.
- Vite resolves `@programmeria/<feature>` to `packages/<feature>/resources/ts/index.ts`, so
  feature TypeScript is consumed as source.
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

- Frontend packages still import some application internals (for example `@/utils/user` and
  a dynamic `@/providers/dataProvider`). Decoupling is a planned follow-up.

# Rest API Laravel 2

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id/Home)

A Laravel REST API starterkit built around **installable feature packages** and **project
presets**.

The project started as a REST API. It is now the PHP/Laravel reference implementation of a
language-agnostic starterkit contract. The same preset model is planned for Go, Rust,
Node.js (Express/NestJS), Bun (ElysiaJS), and Python.

> **Status**
>
> The five-preset model and the `ui` package split are implemented. `starterkit.json`
> exposes `api`, `api-ui`, `multilingual`, `multilingual-ui`, and `site` (default).
> Feature packages are discovered from `packages/*/feature.json`.

## Documentation map

| No | Page | Contents |
|----|------|----------|
| 1 | [Getting Started](Getting-Started) | Requirements, installation, first run |
| 2 | [Presets](Presets) | Preset contract and use cases |
| 3 | [Architecture](Architecture) | Core, UI, locale-switcher, SEO boundaries |
| 4 | [Feature Management](Feature-Management) | Install, remove, dry-run, safety |
| 5 | [UI](UI) | Bundled React/Ant Design app and build |
| 6 | [Internationalization](Internationalization) | Locale backend and UI strategies |
| 7 | [SEO](SEO) | Public shell, metadata, page translations |
| 8 | [Language Ports](Language-Ports) | Cross-language contract and roadmap |
| 9 | [Contributing](Contributing) | Development workflow and tests |

## Goals

- Provide a production-ready Laravel REST API baseline.
- Ship optional capabilities as packages instead of branches or forks.
- Let each project start from a preset: API-only, private admin app, multilingual, or a
  public website with SEO.
- Keep the frontend optional so the API can be consumed by any client or framework.
- Reuse the same preset contract across future language ports.

## Tech stack

**Backend**

- PHP 8.3, Laravel Framework 13, PostgreSQL
- Laravel Sanctum (SPA cookie auth and API tokens), Laravel Socialite
- Spatie Laravel Permission, Spatie Laravel Translation Loader
- NielsNumbers Laravel Localizer, dedoc/scramble, RZL Zone Blade Minify

**UI (optional)**

- Refine (Ant Design, React Router, REST data provider)
- React 19, TypeScript, Vite, Ant Design, i18next, Zod
- Package manager: Bun (the UI source is an npm workspace)

The UI is only installed and built for UI presets. API-only presets do not require Node.js
or Bun.

## Support

- [Report a bug](https://github.com/M-Husein/rest-api-laravel-2/issues)
- [Source code](https://github.com/M-Husein/rest-api-laravel-2)

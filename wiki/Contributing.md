# Contributing

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id/Contributing)

## Development setup

1. Clone the repository and install PHP dependencies:

   ```bash
   composer install
   ```

2. Create `.env`, generate the key, and configure PostgreSQL. See
   [Getting Started](Getting-Started).

3. Install frontend dependencies (UI work only) — always from the repository root:

   ```bash
   bun install
   ```

## Tests and quality checks

```bash
composer test
php artisan test
bunx tsc --noEmit
bun run build
composer validate --no-check-publish
```

- Tests run against an in-memory SQLite database (see `phpunit.xml`) and are independent of
  the PostgreSQL connection used in development.
- Frontend checks only apply to UI presets.

## Workflow

- Create a feature branch from `main` (for example `feat/short-description`).
- Keep commits focused and use conventional commit messages (`feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`).
- Open a pull request and describe the change, the affected presets, and how you verified it.
- The repository currently has no CI; run the checks above locally before opening a PR.

## Conventions

- Code and identifiers are in English.
- Preset and feature names are language-independent (see [Presets](Presets)).
- Do not add comments unless they carry real context.
- Keep frontend dependencies inside `packages/ui/package.json`.

## Documentation

- `README.md` (English) and `README-id_ID.md` (Indonesian) are the entry points.
- The wiki source lives in `wiki` and is mirrored to the GitHub wiki.

## Security

- Never commit `.env`, application keys, OAuth secrets, or database credentials.
- Use environment variables for secrets and rotate them after any exposure.
- Report security issues privately to the maintainers instead of opening a public issue.

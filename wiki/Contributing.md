# Contributing

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-Contributing)

## Development setup

1. Clone the repository and install PHP dependencies:

   ```bash
   composer install
   ```

2. Create `.env`, generate the key, and configure PostgreSQL. See
   [Getting Started](Getting-Started).

3. Install frontend dependencies (UI work only) — always from the repository root, using
   Bun, npm, or pnpm:

   ```bash
   bun install
   # or: npm install
   # or: pnpm install
   ```

## Tests and quality checks

```bash
composer test
php artisan test
bun run typecheck        # or: npm run typecheck / pnpm run typecheck
bun run build            # or: npm run build / pnpm run build
bun run test:frontend    # or: npm run test:frontend / pnpm run test:frontend
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
- CI runs the PHP suite and frontend checks with Bun, npm, and pnpm. Run the checks above
  locally before opening a PR.

## Conventions

- Code and identifiers are in English.
- Preset and feature names are language-independent (see [Presets](Presets)).
- Do not add comments unless they carry real context.
- Keep frontend runtime dependencies in `packages/ui/package.json`; keep build/test tooling
  and workspace scripts in the root `package.json`.
- Commit `bun.lock`, `package-lock.json`, and `pnpm-lock.yaml` together when dependencies
  change.

## Documentation

- `README.md` (English) and `README-id_ID.md` (Indonesian) are the entry points.
- The wiki source lives in `wiki` and is mirrored to the GitHub wiki.

## Security

- Never commit `.env`, application keys, OAuth secrets, or database credentials.
- Use environment variables for secrets and rotate them after any exposure.
- Report security issues privately to the maintainers instead of opening a public issue.

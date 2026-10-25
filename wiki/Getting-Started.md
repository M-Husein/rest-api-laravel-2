# Getting Started

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-Getting-Started)

## Requirements

- PHP >= 8.5.12 with the `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, and `fileinfo` extensions
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (running)
- For UI presets: [Bun](https://bun.sh/) 1.4+, or Node.js 22+ with npm 10+ or pnpm 9.15+

> **Publication status**
>
> This repository is the current distribution source. The project may be published to
> Packagist (Composer) and/or npm in the future. Until then, install it from this repository
> using `git clone` or Composer VCS below.

## Quick start

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

   UI presets detect Bun, npm, or pnpm automatically. Override it with
   `--package-manager=bun|npm|pnpm` or `FRONTEND_PACKAGE_MANAGER`.

When creating a project with `composer create-project`, the post-install script prints the
`starter:install` command to run next. **No feature is selected automatically.**

## After installation

- Review [Presets](Presets) to confirm the profile matches your project.
- Review [Feature Management](Feature-Management) to change the selection later.
- Serve the API with `php artisan serve`.
- For UI presets, install and build with your package manager:
  `bun install && bun run build`, `npm install && npm run build`, or
  `pnpm install && pnpm run build`.

## Troubleshooting

- UI presets require Bun, npm, or pnpm. If none is installed, skip the build with
  `--no-build` and build later.
- API-only presets never require the frontend toolchain.
- Tests run against an in-memory SQLite database and do not need the PostgreSQL connection.

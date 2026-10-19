# Getting Started

## Requirements

- PHP >= 8.3 with the `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, and `fileinfo` extensions
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (running)
- [Bun](https://bun.sh/) or Node.js + npm — only for presets that include the UI

## Quick start

1. **Create the project** (or clone this repository):

   ```bash
   composer create-project programmeria/rest-api-laravel-2 my-app
   cd my-app
   ```

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
`starter:install` command to run next. **No feature is selected automatically.**

## After installation

- Review [Presets](Presets) to confirm the profile matches your project.
- Review [Feature Management](Feature-Management) to change the selection later.
- Serve the API with `php artisan serve`.
- For UI presets, build assets with `bun install` and `bun run build`.

## Troubleshooting

- UI presets require Bun or Node.js. If Bun is not installed, skip the build with
  `--no-build` and build later.
- API-only presets never require the frontend toolchain.
- Tests run against an in-memory SQLite database and do not need the PostgreSQL connection.

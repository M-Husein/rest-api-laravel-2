# Getting Started

**English** · [Bahasa Indonesia](https://github.com/M-Husein/rest-api-laravel-2/wiki/id-Getting-Started)

## Requirements

- PHP >= 8.5.12 with the `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, and `fileinfo` extensions
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (running)
- For UI presets: [Bun](https://bun.sh/) 1.4+, or Node.js 22+ with npm 10+ or pnpm 9.15+

## Pilihan database

PostgreSQL 16+ adalah default dan database yang direkomendasikan untuk pengembangan proyek ini.

1. Instal PostgreSQL 16+ dan jalankan servernya.
2. Buat database yang sesuai dengan `DB_DATABASE` di `.env` (default `rest_api_laravel_2`).
3. Konfiguri `.env`:

   ```dotenv
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=rest_api_laravel_2
   DB_USERNAME=postgres
   DB_PASSWORD=
   ```

4. Jalankan `php artisan migrate --seed` setelah database siap.

MySQL, MariaDB, dan SQLite juga tersedia dalam `config/database.php`, tetapi bukan jalur instalasi resmi yang didokumentasikan dan diverifikasi di sini. Untuk menggunakannya:

- Ubah `DB_CONNECTION` di `.env` menjadi `mysql`, `mariadb`, atau `sqlite`.
- Instal driver PDO yang sesuai dan siapkan database atau file SQLite.
- Untuk SQLite, buat `database/database.sqlite` kosong sebelum menjalankan migrasi.
- Jalankan `php artisan migrate --seed` setelah menyesuaikan `.env`.

Pengujian otomatis menggunakan SQLite in-memory, bukan verifikasi produksi untuk MySQL/MariaDB/SQLite.

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

   UI presets detect Bun, npm, or pnpm automatically. To choose explicitly, use
   `--package-manager=bun|npm|pnpm`; see
   [Frontend package managers](#frontend-package-managers).

When creating a project with `composer create-project`, the post-install script prints the
`starter:install` command to run next. **No feature is selected automatically.**

## After installation

- Review [Presets](Presets) to confirm the profile matches your project.
- Review [Feature Management](Feature-Management) to change the selection later.
- Serve the API with `php artisan serve`.
- For UI presets, install and build with your package manager; see
  [Frontend package managers](#frontend-package-managers).

## Frontend package managers

UI presets support Bun, npm, and pnpm. Detection is automatic. The only explicit override
is `--package-manager=bun|npm|pnpm`:

```bash
php artisan starter:install --preset=site --package-manager=npm
```

For frontend-only commands:

```bash
php artisan frontend install --package-manager=npm
php artisan frontend build --package-manager=npm
php artisan frontend dev --package-manager=npm
```

The flag is always used when provided. When omitted, detection checks `node_modules`
markers, then lockfiles, then falls back to Bun, pnpm, and npm.

`composer setup` and `composer dev` do not accept this flag; they always use automatic
detection. Run the Artisan commands directly when you need to force a package manager.
The old `FRONTEND_PACKAGE_MANAGER` environment variable is no longer read.

## Troubleshooting

- UI presets require Bun, npm, or pnpm. If none is installed, skip the build with
  `--no-build` and build later.
- API-only presets never require the frontend toolchain.
- Tests run against an in-memory SQLite database and do not need the PostgreSQL connection.

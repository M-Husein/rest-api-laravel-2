# Rest API Laravel 2

Rest API using Laravel.

## Tech Stack

### Backend

- **PHP** 8.3
- **Laravel Framework** 13
- **PostgreSQL** (default database connection)
- **Laravel Sanctum** — SPA cookie authentication and API tokens
- **Laravel Socialite** — OAuth social login (Google, and more)
- **Spatie Laravel Permission** — roles and permissions
- **Spatie Laravel Translation Loader** — database-backed translations
- **NielsNumbers Laravel Localizer** — locale detection and localized routing
- **dedoc/scramble** — auto-generated OpenAPI documentation
- **RZL Zone Blade Minify** — HTML minification
- **Laravel Tinker**, **Pail**, **Pint**, **Sail**, **PHPUnit 12**, **Mockery** — development tooling

### Frontend (bundled admin SPA)

- **Refine** (Ant Design, React Router, REST data provider)
- **React** 19, **TypeScript**, **Vite**
- **Ant Design** UI, **i18next**, **Zod**
- Package manager: **Bun** (falls back to npm)

## Requirements

- PHP >= 8.3 with the `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo` extensions
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (running)
- [Bun](https://bun.sh/) or Node.js + npm (only for the frontend)

## Installation

1. **Install PHP dependencies**
   ```bash
   composer install
   ```

2. **Install frontend dependencies** (optional, only for the admin SPA)
   ```bash
   bun install
   ```

3. **Create the environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure the environment** — open `.env` and set the application values and your
   PostgreSQL connection (driver, host, port, database name, username and password).

5. **Generate the application key**
   ```bash
   php artisan key:generate
   ```

6. **Create the database** in PostgreSQL matching the name configured in `.env`.

7. **Run the migrations and seeders**
   ```bash
   php artisan migrate --seed
   ```

8. **Create the storage symlink**
   ```bash
   php artisan storage:link
   ```

## Usage

Start the backend development server:
```bash
php artisan serve
```

Start the frontend (admin SPA) development server:
```bash
bun run dev
```

Build frontend assets for production:
```bash
bun run build
```

## API

- Base path: `/api/v1`
- Authentication: Laravel Sanctum (SPA cookie flow and bearer tokens for mobile)
- Interactive OpenAPI docs (Scramble): `/docs/api`
- Export the OpenAPI spec:
  ```bash
  php artisan scramble:export
  ```

Main endpoint groups:

- **Auth** — `register`, `login`, `logout`, `me`, password reset and change
- **Social auth** — OAuth redirect, mobile callback, link/unlink providers
- **Users** — CRUD and bulk delete (admin)
- **Articles**, **Contacts** — public content endpoints
- **Sessions / Tokens** — device and token management
- **Translations** — common and per-page locale translations
- **Login histories**, **Clear cache** — admin utilities

## Testing

```bash
composer test
```

Tests run against an in-memory SQLite database (see `phpunit.xml`) and are independent of
the PostgreSQL connection used in development.

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

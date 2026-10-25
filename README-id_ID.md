# Rest API Laravel 2

**Bahasa:** [English](README.md) | Bahasa Indonesia

Starterkit REST API Laravel yang dibangun dengan paket fitur yang dapat dipasang dan preset proyek.

Proyek ini dimulai sebagai REST API. Sekarang menjadi implementasi referensi PHP/Laravel untuk
kontrak starterkit yang netral bahasa. Model preset yang sama direncanakan untuk Go, Rust,
Node.js (Express/NestJS), Bun (ElysiaJS), dan Python.

> **Status proyek**
>
> Model lima preset dan pemisahan paket `ui` sudah diimplementasikan. `starterkit.json`
> menyediakan `api`, `api-ui`, `multilingual`, `multilingual-ui`, dan `site` (default).
> Paket fitur ditemukan otomatis dari `packages/*/feature.json`.

## Tujuan

- Menyediakan basis REST API Laravel yang siap produksi.
- Menyediakan kemampuan opsional sebagai paket, bukan branch atau fork.
- Memungkinkan setiap proyek dimulai dari preset: API saja, aplikasi admin privat,
  multibahasa, atau situs publik dengan SEO.
- Menjaga frontend tetap opsional agar API dapat digunakan oleh klien atau framework apa pun.
- Menggunakan kontrak preset yang sama untuk port bahasa di masa depan.

## Tech stack

### Backend

- **PHP** 8.5.12+
- **Laravel Framework** 13
- **PostgreSQL** (koneksi database default)
- **Laravel Sanctum** — autentikasi cookie SPA dan token API
- **Laravel Socialite** — login sosial OAuth (Google, dan lainnya)
- **Spatie Laravel Permission** — role dan permission
- **Spatie Laravel Translation Loader** — terjemahan berbasis database
- **NielsNumbers Laravel Localizer** — deteksi locale dan routing terlokalisasi
- **dedoc/scramble** — dokumentasi OpenAPI otomatis
- **RZL Zone Blade Minify** — minifikasi HTML
- **Laravel Tinker**, **Pail**, **Pint**, **Sail**, **PHPUnit 12**, **Mockery** — tooling pengembangan

### UI (opsional)

- **Refine** (Ant Design, React Router, REST data provider)
- **React** 19, **TypeScript**, **Vite**
- **Ant Design** UI, **i18next**, **Zod**
- Package manager: **Bun**, **npm**, atau **pnpm** (source UI berupa workspace)

UI hanya dipasang dan di-build untuk preset yang memiliki UI. Preset API-only tidak memerlukan
runtime frontend atau package manager.

## Kebutuhan

- PHP >= 8.5.12 dengan ekstensi `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, dan `fileinfo`
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (berjalan)
- Untuk preset UI: [Bun](https://bun.sh/) 1.4+, atau Node.js 22+ dengan npm 10+ atau pnpm 9.15+

### Package manager frontend

Preset UI mendukung Bun, npm, dan pnpm. `composer setup` dan `php artisan starter:install`
mendeteksi package manager secara otomatis. Override dengan
`--package-manager=bun|npm|pnpm` atau environment variable `FRONTEND_PACKAGE_MANAGER`:

```bash
FRONTEND_PACKAGE_MANAGER=npm composer setup
```

```powershell
$env:FRONTEND_PACKAGE_MANAGER="npm"; composer setup
```

Jalankan `php artisan frontend install`, `frontend build`, atau `frontend dev` secara
langsung; tambahkan `--package-manager=bun|npm|pnpm` untuk override deteksi.

Ketiga lockfile dikomit. Regenerasi setelah mengubah dependency:

```bash
bun install
npm install --package-lock-only
pnpm install --lockfile-only
```

## Mulai cepat

> **Status publikasi**
>
> Repositori ini adalah sumber distribusi saat ini. Proyek ini kemungkinan akan
> dipublikasikan ke Packagist (Composer) dan/atau npm di masa mendatang. Sampai saat itu,
> install dari repositori ini menggunakan `git clone` atau Composer VCS di bawah.

1. **Dapatkan proyek** (pilih salah satu):
   ```bash
   git clone https://github.com/M-Husein/rest-api-laravel-2.git my-app
   cd my-app
   ```
   atau install melalui Composer menggunakan repository VCS:
   ```bash
   composer create-project programmeria/rest-api-laravel-2 my-app --repository='{"type":"vcs","url":"https://github.com/M-Husein/rest-api-laravel-2.git"}'
   cd my-app
   ```

   Di Windows PowerShell, escape tanda kutip JSON pada `--repository`:
   `--repository='{\"type\":\"vcs\",\"url\":\"https://github.com/M-Husein/rest-api-laravel-2.git\"}'`.

2. **Buat file environment dan konfigurasi**:
   ```bash
   cp .env.example .env
   ```
   Buka `.env` dan atur nilai aplikasi serta koneksi database Anda.

3. **Generate application key**:
   ```bash
   php artisan key:generate
   ```

4. **Buat database** sesuai nama yang dikonfigurasi di `.env`.

5. **Jalankan migrasi dan seeder**:
   ```bash
   php artisan migrate --seed
   ```

6. **Buat storage symlink**:
   ```bash
   php artisan storage:link
   ```

7. **Pilih preset**:
   ```bash
   php artisan starter:install --preset=site
   ```
   Jalankan perintah tanpa `--preset` untuk pemilihan interaktif. Preset default adalah
   `site`.

Saat membuat proyek dengan `composer create-project`, script post-install akan menampilkan
perintah `starter:install` yang harus dijalankan berikutnya. Tidak ada fitur yang dipilih
secara otomatis.

## Kontrak preset

Preset adalah profil produk, bukan detail implementasi. Nama dan kemampuan yang sama
direncanakan digunakan oleh setiap port bahasa.

| No | Preset | Fitur | UI | Bahasa | Situs publik / SEO | Penggunaan umum |
|----|--------|-------|----|--------|--------------------|-----------------|
| 1 | `api` | — | Tidak | Satu | Tidak | API headless, frontend kustom |
| 2 | `api-ui` | `ui` | Ya | Satu | Tidak | Aplikasi admin/auth privat |
| 3 | `multilingual` | `locale-switcher` | Tidak | Banyak | Tidak | API multibahasa, frontend kustom |
| 4 | `multilingual-ui` | `ui`, `locale-switcher` | Ya | Banyak | Tidak | Sistem perusahaan privat multibahasa |
| 5 | `site` | `ui`, `locale-switcher`, `seo` | Ya | Banyak | Ya | Situs publik dengan SEO |

Preset default adalah `site`.

Catatan:

- `seo` membutuhkan `ui`; shell SEO publik memerlukan lapisan HTML/UI.
- Preset tanpa UI tidak mendaftarkan route HTML `/app`, `/login`, `/settings`, atau lainnya.
  Kemampuan admin dan autentikasi tersedia melalui API.
- Untuk sistem multibahasa privat, gunakan `multilingual-ui`, bukan `multilingual`.

## Detail preset

### 1. `api`

Backend dan API saja. Mencakup autentikasi, logika domain admin, role, user, session, dan
endpoint API publik. Tanpa shell HTML, tanpa build frontend, dan tanpa situs publik.

Gunakan ketika frontend dibangun dengan framework lain atau ketika proyek merupakan service
yang dikonsumsi aplikasi mobile atau klien pihak ketiga.

### 2. `api-ui`

Basis `api` ditambah UI React/Ant Design bawaan. Mencakup dashboard admin, login,
lupa/reset password, dan halaman pengaturan akun.

Tidak menyertakan halaman pemasaran publik. Gunakan untuk aplikasi privat yang membutuhkan
UI siap pakai tetapi tidak boleh diindeks publik.

### 3. `multilingual`

Basis `api` ditambah dukungan locale sisi server: kolom `lang` pada user, middleware locale,
dan endpoint preferensi bahasa per user.

Tidak memiliki UI. Frontend dapat dibangun dengan framework apa pun; klien API menentukan
cara mendeteksi dan menyimpan locale.

### 4. `multilingual-ui`

Basis `multilingual` ditambah UI React/Ant Design bawaan. Ini preset yang direkomendasikan
untuk sistem perusahaan privat multibahasa: autentikasi, dashboard admin, dan pergantian
bahasa tanpa situs publik.

### 5. `site`

Starterkit lengkap: backend, UI, dukungan multibahasa, halaman publik, metadata SEO first-load,
Open Graph, JSON-LD, dan terjemahan halaman terlokalisasi.

Route publik mencakup home, about, articles, contact, login, registrasi, dan settings. Route
privat/admin tetap dilindungi autentikasi dan role.

## Arsitektur

| No | Lapisan | Paket | Jenis | Tanggung jawab |
|----|---------|-------|-------|----------------|
| 1 | Core | kode aplikasi | Laravel app | API, domain auth/admin, role, user, session, backend localizer |
| 2 | UI | `programmeria/laravel-ui` / `@programmeria/ui` | Composer + workspace | Blade shell, route admin/auth, source React/Ant Design, build Vite |
| 3 | Internasionalisasi | `programmeria/laravel-locale-switcher` | Composer + workspace | Backend locale, preferensi user, menu bahasa dan strategi frontend |
| 4 | SEO | `programmeria/laravel-seo` | Composer package | Shell SPA publik, meta/Open Graph/JSON-LD, terjemahan halaman |

### Format paket fitur

Setiap fitur dapat menyediakan:

- `composer.json` — service provider, route, migrasi, view, dan dependensi PHP.
- `package.json` — metadata workspace dan dependensi frontend bila ada.
- `feature.json` — label, deskripsi, keanggotaan preset, requirement, conflict, dan flag frontend.

Composer menentukan apakah suatu fitur terpasang. Workspace hanya menyediakan source frontend
yang dikonsumsi Vite. Dependensi runtime frontend berada di `packages/ui/package.json`;
tooling build/test dan script workspace berada di `package.json` root.

## Manajemen fitur

Daftar fitur dan preset yang tersedia:

```bash
php artisan starter:features
```

Terapkan preset:

```bash
php artisan starter:install --preset=site
php artisan starter:install --preset=site --package-manager=npm
```

Override pilihan:

```bash
php artisan starter:install --preset=multilingual-ui --without=seo
php artisan starter:install --with=locale-switcher
```

Pratinjau perubahan tanpa menerapkannya:

```bash
php artisan starter:install --preset=api --dry-run
```

Lewati langkah lanjutan:

```bash
php artisan starter:install --preset=api-ui --no-migrate --no-build
```

Perintah ini:

- menambah atau menghapus requirement Composer;
- menulis ulang `features.json`;
- meregenerasi registry fitur frontend saat UI terpasang;
- menjalankan migrasi;
- memasang dependensi frontend dan build asset dengan package manager terdeteksi hanya saat
  UI terpasang.

Menghapus fitur tidak pernah menghapus tabel database atau data user.

### Nama preset lama

Preset lama `minimal`, `default`, dan `full` sudah dihapus; tidak ada alias. Gunakan `api`
sebagai pengganti `minimal`, dan `site` sebagai pengganti `default` atau `full`.

## Preset UI dan tanpa UI

**Preset tanpa UI (`api`, `multilingual`)**

- Tidak ada `/app`, `/login`, `/settings`, atau route HTML publik.
- Tidak ada install frontend dan tidak ada build asset.
- Backend adalah backend SPA/API lengkap; frontend menjadi tanggung jawab Anda.

**Preset UI (`api-ui`, `multilingual-ui`, `site`)**

- Blade shell, source React/Ant Design, route, dan build tooling disediakan oleh paket `ui`.
- Install dan build dengan Bun, npm, atau pnpm sebelum menyajikan UI di produksi:
  `bun install && bun run build`, `npm install && npm run build`, atau
  `pnpm install && pnpm run build`.

## Autentikasi dan registrasi

Autentikasi menggunakan Laravel Sanctum: cookie session untuk SPA dan bearer token untuk
klien mobile. Route API berada di bawah `/api/v1`.

Registrasi bersifat opsional. Deployment privat (misalnya sistem internal perusahaan) dapat
menghapus route, aksi controller, dan halaman React terkait agar akun hanya dibuat oleh
administrator.

```php
// Registration is optional. Private deployments (for example, internal
// company systems) may remove this route, the controller action, and the
// matching React page so accounts can only be provisioned by an admin.
Route::get('register', [UiController::class, 'register'])->middleware('guest');
```

```php
/**
 * Registration page (optional).
 *
 * Remove this action, its route, and the frontend page for private or
 * closed deployments where accounts are provisioned manually.
 */
public function register() { /* ... */ }
```

Untuk menonaktifkan registrasi:

1. Hapus route `/register` dari route paket `ui`.
2. Hapus aksi `register` dari controller UI.
3. Hapus halaman registrasi React dan route-nya.
4. Nonaktifkan juga endpoint registrasi API jika API bersifat publik.

## Internasionalisasi

Fitur `locale-switcher` menyediakan:

- kolom `lang` untuk user;
- middleware locale untuk request API;
- `PUT /api/v1/me/language` untuk preferensi bahasa per user;
- menu bahasa dan strategi pathname, storage, query, serta user di UI.

Tanpa fitur ini, aplikasi berjalan dengan satu locale. Dengan fitur dan UI, user dapat
berganti bahasa dan preferensinya disimpan per user.

## SEO

Paket `seo` menyediakan:

- shell SPA publik yang dirender server dengan meta tag first-load;
- metadata Open Graph dan Twitter;
- data terstruktur JSON-LD;
- terjemahan halaman terlokalisasi melalui `GET /api/v1/locales/{lang}/page/{name}`;
- canonical URL dan direktif robots untuk halaman publik dan privat.

SEO hanya untuk metadata first-load; aplikasi tidak menggunakan server-side rendering untuk
halaman React. Paket ini membutuhkan paket `ui` karena shell publik mereferensikan entry
frontend bawaan.

## API

- Base path: `/api/v1`
- Autentikasi: Laravel Sanctum (alur cookie SPA dan bearer token untuk mobile)
- Dokumentasi OpenAPI interaktif (Scramble): `/docs/api`
- Ekspor spesifikasi OpenAPI:

  ```bash
  php artisan scramble:export
  ```

Grup endpoint utama:

- **Auth** — `register`, `login`, `logout`, `me`, reset dan ganti password
- **Social auth** — redirect OAuth, callback mobile, link/unlink provider
- **Users** — CRUD dan bulk delete (admin)
- **Articles**, **Contacts** — endpoint konten publik
- **Sessions / Tokens** — manajemen device dan token
- **Translations** — terjemahan umum dan per halaman
- **Login histories**, **Clear cache** — utilitas admin

## Testing dan kualitas

```bash
composer test
php artisan test
bun run typecheck        # atau: npm run typecheck / pnpm run typecheck
bun run build            # atau: npm run build / pnpm run build
bun run test:frontend    # atau: npm run test:frontend / pnpm run test:frontend
composer validate --no-check-publish
```

Tes berjalan dengan database SQLite in-memory (lihat `phpunit.xml`) dan tidak bergantung pada
koneksi PostgreSQL yang digunakan saat pengembangan. Pemeriksaan frontend hanya berlaku untuk
preset yang memiliki UI.

## Roadmap lintas bahasa

Nama preset tidak bergantung pada bahasa. Nama repository dan paket boleh berbeda per
ekosistem, tetapi kemampuannya harus sesuai kontrak preset.

| No | Target | Repository yang disarankan | Status |
|----|--------|----------------------------|--------|
| 1 | PHP / Laravel | `rest-api-laravel-2` | Implementasi referensi, sedang dikerjakan |
| 2 | Go | `rest-api-go` | Direncanakan |
| 3 | Rust | `rest-api-rust` | Direncanakan |
| 4 | Node.js (Express/NestJS) | `rest-api-node` | Direncanakan |
| 5 | Bun (ElysiaJS) | `rest-api-bun` | Direncanakan |
| 6 | Python | `rest-api-python` | Direncanakan |

Panduan untuk port berikutnya:

- Pertahankan lima nama preset yang sama: `api`, `api-ui`, `multilingual`, `multilingual-ui`, `site`.
- Jangan menambahkan nama bahasa ke nama preset (`api-go`, `api-rust`, dan sebagainya).
- Definisikan dan versikan kontrak API sejak awal; UI React dapat digunakan ulang di berbagai
  backend jika kontraknya stabil.
- `site` membutuhkan shell yang dirender server dan metadata. Jika suatu port belum mampu
  mendukungnya, dokumentasikan keterbatasannya, jangan mengganti nama preset.

## Dokumentasi dan wiki

`README.md` dan `README-id_ID.md` adalah pintu masuk singkat. Dokumentasi lengkap berada di
[`wiki`](wiki) dan dicerminkan ke GitHub wiki:

| No | Halaman | Isi |
|----|---------|-----|
| 1 | [Home](wiki/Home.md) | Ringkasan dan tautan |
| 2 | [Getting Started](wiki/Getting-Started.md) | Kebutuhan, instalasi, menjalankan pertama kali |
| 3 | [Presets](wiki/Presets.md) | Kontrak preset dan penggunaan |
| 4 | [Architecture](wiki/Architecture.md) | Batas core, UI, locale-switcher, SEO |
| 5 | [Feature Management](wiki/Feature-Management.md) | Install, remove, dry-run, keamanan |
| 6 | [UI](wiki/UI.md) | Aplikasi React/Ant Design bawaan dan build |
| 7 | [Internationalization](wiki/Internationalization.md) | Backend locale dan strategi UI |
| 8 | [SEO](wiki/SEO.md) | Shell publik, metadata, terjemahan halaman |
| 9 | [Language Ports](wiki/Language-Ports.md) | Kontrak lintas bahasa dan roadmap |
| 10 | [Contributing](wiki/Contributing.md) | Alur pengembangan dan tes |

Terjemahan Bahasa Indonesia berada di [`wiki/id-Home.md`](wiki/id-Home.md) dan dipublikasikan
di `/wiki/id-Home`.

Untuk mempublikasikan pembaruan ke GitHub wiki, salin isi `wiki` (termasuk halaman `id-*`)
ke clone dari `https://github.com/M-Husein/rest-api-laravel-2.wiki.git` lalu push.

## Keamanan

- Jangan pernah commit `.env`, application key, secret OAuth, atau kredensial database.
- Gunakan environment variable untuk secret dan rotasi setelah terjadi kebocoran.
- PHP >= 8.5.12 diperlukan karena versi PHP yang lebih lama terdampak PHP2Shell
  (`CVE-2026-109618`, `CVE-2026-109619`).
- Laporkan masalah keamanan secara privat ke maintainer, bukan melalui issue publik.
- Lihat [SECURITY-id_ID.md](SECURITY-id_ID.md) untuk versi yang didukung dan kebijakan pelaporan.

## Lisensi

Lisensi MIT. Copyright (c) 2026 Programmeria. Lihat [LICENSE](LICENSE).

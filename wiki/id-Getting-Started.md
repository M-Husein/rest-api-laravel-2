# Memulai

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Getting-Started) · **Bahasa Indonesia**

## Prasyarat

- PHP >= 8.5.12 dengan ekstensi `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, dan `fileinfo`
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (berjalan)
- Untuk preset UI: [Bun](https://bun.sh/) 1.4+, atau Node.js 22+ dengan npm 10+ atau pnpm 9.15+

> **Status publikasi**
>
> Repositori ini adalah sumber distribusi saat ini. Proyek ini kemungkinan akan
> dipublikasikan ke Packagist (Composer) dan/atau npm di masa mendatang. Sampai saat itu,
> install dari repositori ini menggunakan `git clone` atau Composer VCS di bawah.

## Mulai cepat

1. **Dapatkan proyek** (pilih salah satu):

   ```bash
   git clone https://github.com/M-Husein/rest-api-laravel-2.git my-app
   cd my-app
   ```

   atau install melalui Composer menggunakan repositori VCS:

   ```bash
   composer create-project programmeria/rest-api-laravel-2 my-app --repository='{"type":"vcs","url":"https://github.com/M-Husein/rest-api-laravel-2.git"}'
   cd my-app
   ```

   Di Windows PowerShell, escape tanda kutip JSON pada `--repository`:
   `--repository='{\"type\":\"vcs\",\"url\":\"https://github.com/M-Husein/rest-api-laravel-2.git\"}'`.

2. **Buat file environment dan konfigurasikan**:

   ```bash
   cp .env.example .env
   ```

   Buka `.env` dan atur nilai aplikasi serta koneksi database.

3. **Generate application key**:

   ```bash
   php artisan key:generate
   ```

4. **Buat database** sesuai nama yang dikonfigurasi di `.env`.

5. **Jalankan migrasi dan seeder**:

   ```bash
   php artisan migrate --seed
   ```

6. **Buat symlink storage**:

   ```bash
   php artisan storage:link
   ```

7. **Pilih preset**:

   ```bash
   php artisan starter:install --preset=site
   ```

   Jalankan perintah tanpa `--preset` untuk memilih secara interaktif. Preset default adalah
   `site`.

   Preset UI mendeteksi Bun, npm, atau pnpm secara otomatis. Override dengan
   `--package-manager=bun|npm|pnpm` atau `FRONTEND_PACKAGE_MANAGER`.

Saat membuat proyek dengan `composer create-project`, skrip post-install mencetak perintah
`starter:install` yang harus dijalankan berikutnya. **Tidak ada fitur yang dipilih secara
otomatis.**

## Setelah instalasi

- Tinjau [Preset](id-Presets) untuk memastikan profil sesuai dengan proyek Anda.
- Tinjau [Manajemen Fitur](id-Feature-Management) untuk mengubah pilihan nanti.
- Jalankan API dengan `php artisan serve`.
- Untuk preset UI, install dan build dengan package manager Anda:
  `bun install && bun run build`, `npm install && npm run build`, atau
  `pnpm install && pnpm run build`.

## Pemecahan masalah

- Preset UI memerlukan Bun, npm, atau pnpm. Jika tidak ada yang terpasang, lewati build
  dengan `--no-build` dan build nanti.
- Preset API saja tidak pernah memerlukan toolchain frontend.
- Pengujian berjalan dengan database SQLite in-memory dan tidak memerlukan koneksi
  PostgreSQL.

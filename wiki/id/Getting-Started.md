# Memulai

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Getting-Started) · **Bahasa Indonesia**

## Prasyarat

- PHP >= 8.3 dengan ekstensi `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `tokenizer`, `xml`,
  `ctype`, `json`, `bcmath`, dan `fileinfo`
- [Composer](https://getcomposer.org/) 2
- PostgreSQL 16+ (berjalan)
- [Bun](https://bun.sh/) atau Node.js + npm — hanya untuk preset yang menyertakan UI

## Mulai cepat

1. **Buat proyek** (atau clone repositori ini):

   ```bash
   composer create-project programmeria/rest-api-laravel-2 my-app
   cd my-app
   ```

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

Saat membuat proyek dengan `composer create-project`, skrip post-install mencetak perintah
`starter:install` yang harus dijalankan berikutnya. **Tidak ada fitur yang dipilih secara
otomatis.**

## Setelah instalasi

- Tinjau [Preset](Presets) untuk memastikan profil sesuai dengan proyek Anda.
- Tinjau [Manajemen Fitur](Feature-Management) untuk mengubah pilihan nanti.
- Jalankan API dengan `php artisan serve`.
- Untuk preset UI, build aset dengan `bun install` dan `bun run build`.

## Pemecahan masalah

- Preset UI memerlukan Bun atau Node.js. Jika Bun belum terpasang, lewati build dengan
  `--no-build` dan build nanti.
- Preset API saja tidak pernah memerlukan toolchain frontend.
- Pengujian berjalan dengan database SQLite in-memory dan tidak memerlukan koneksi
  PostgreSQL.

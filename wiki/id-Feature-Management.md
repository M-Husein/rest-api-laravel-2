# Manajemen Fitur

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Feature-Management) · **Bahasa Indonesia**

## Perintah

Daftar fitur dan preset yang tersedia:

```bash
php artisan starter:features
```

Terapkan preset:

```bash
php artisan starter:install --preset=site
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

Saat menjalankan secara non-interaktif (misalnya dalam skrip), tambahkan `--no-interaction`
untuk menghindari prompt konfirmasi.

## Yang dilakukan perintah

- menambah atau menghapus requirement Composer;
- menulis ulang `features.json`;
- meregenerasi registry fitur frontend ketika UI terpasang;
- menjalankan migrasi;
- memasang dependensi frontend dan build aset hanya ketika UI terpasang.

## Keamanan

- Menghapus fitur **tidak pernah menghapus tabel database atau data pengguna**.
- `--dry-run` mencetak rencana tanpa mengubah apa pun.
- Aturan requirement dan conflict divalidasi sebelum perubahan diterapkan.
- Preset atau fitur yang tidak dikenal langsung gagal dengan daftar opsi yang tersedia.

## Cara kerjanya

- `FeatureRepository` menemukan paket dari `packages/*/feature.json` dan menyelesaikan
  kumpulan yang diinginkan dari preset ditambah override.
- `FeatureInstaller` menjalankan `composer require` / `composer remove`, menulis ulang
  `features.json`, meregenerasi registry frontend, migrasi, dan build.
- Requirement Composer menggunakan path repository dan constraint `0.1.*`.

## Preset UI dan tanpa UI

**Preset tanpa UI (`api`, `multilingual`)**

- Tidak ada route `/app`, `/login`, `/settings`, atau route HTML publik.
- Tidak ada `bun install` dan tidak ada build aset.

**Preset UI (`api-ui`, `multilingual-ui`, `site`)**

- Shell Blade, source React/Ant Design, route, dan tooling build disediakan oleh paket
  `ui`.
- `bun install` dan `bun run build` diperlukan sebelum menyajikan UI di produksi.

> Selalu jalankan `bun install`, `bun run dev`, dan `bun run build` **dari root repositori**,
> jangan pernah dari dalam `packages/ui`.

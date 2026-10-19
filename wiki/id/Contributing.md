# Kontribusi

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Contributing) · **Bahasa Indonesia**

## Setup pengembangan

1. Clone repositori dan pasang dependensi PHP:

   ```bash
   composer install
   ```

2. Buat `.env`, generate key, dan konfigurasikan PostgreSQL. Lihat
   [Memulai](Getting-Started).

3. Pasang dependensi frontend (hanya untuk pekerjaan UI) — selalu dari root repositori:

   ```bash
   bun install
   ```

## Pengujian dan pemeriksaan kualitas

```bash
composer test
php artisan test
bunx tsc --noEmit
bun run build
composer validate --no-check-publish
```

- Pengujian berjalan dengan database SQLite in-memory (lihat `phpunit.xml`) dan tidak
  bergantung pada koneksi PostgreSQL yang digunakan saat pengembangan.
- Pemeriksaan frontend hanya berlaku untuk preset UI.

## Alur kerja

- Buat branch fitur dari `main` (misalnya `feat/short-description`).
- Jaga commit tetap fokus dan gunakan pesan conventional commit (`feat:`, `fix:`, `chore:`,
  `refactor:`, `docs:`).
- Buka pull request dan jelaskan perubahan, preset yang terpengaruh, dan cara verifikasinya.
- Repositori saat ini belum memiliki CI; jalankan pemeriksaan di atas secara lokal sebelum
  membuka PR.

## Konvensi

- Kode dan identifier menggunakan bahasa Inggris.
- Nama preset dan fitur tidak terikat bahasa (lihat [Preset](Presets)).
- Jangan menambahkan komentar kecuali membawa konteks yang benar-benar diperlukan.
- Letakkan dependensi frontend di dalam `packages/ui/package.json`.

## Dokumentasi

- `README.md` (Inggris) dan `README-id_ID.md` (Indonesia) adalah titik masuk.
- Source wiki berada di `wiki` dan dicerminkan ke wiki GitHub.

## Keamanan

- Jangan pernah commit `.env`, application key, secret OAuth, atau kredensial database.
- Gunakan environment variable untuk secret dan rotasi setelah terjadi kebocoran.
- Laporkan masalah keamanan secara privat kepada maintainer, bukan melalui issue publik.

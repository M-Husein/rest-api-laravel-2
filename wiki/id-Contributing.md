# Kontribusi

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Contributing) · **Bahasa Indonesia**

## Setup pengembangan

1. Clone repositori dan pasang dependensi PHP:

   ```bash
   composer install
   ```

2. Buat `.env`, generate key, dan konfigurasikan PostgreSQL. Lihat
   [Memulai](id-Getting-Started).

3. Pasang dependensi frontend (hanya untuk pekerjaan UI) — selalu dari root repositori,
   menggunakan Bun, npm, atau pnpm:

   ```bash
   bun install
   # atau: npm install
   # atau: pnpm install
   ```

## Pengujian dan pemeriksaan kualitas

```bash
composer test
php artisan test
bun run typecheck        # atau: npm run typecheck / pnpm run typecheck
bun run build            # atau: npm run build / pnpm run build
bun run test:frontend    # atau: npm run test:frontend / pnpm run test:frontend
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
- CI menjalankan suite PHP dan pemeriksaan frontend dengan Bun, npm, dan pnpm. Jalankan
  pemeriksaan di atas secara lokal sebelum membuka PR.

## Konvensi

- Kode dan identifier menggunakan bahasa Inggris.
- Nama preset dan fitur tidak terikat bahasa (lihat [Preset](id-Presets)).
- Jangan menambahkan komentar kecuali membawa konteks yang benar-benar diperlukan.
- Letakkan dependensi runtime frontend di `packages/ui/package.json`; letakkan tooling
  build/test dan skrip workspace di `package.json` root.
- Commit `bun.lock`, `package-lock.json`, dan `pnpm-lock.yaml` bersamaan saat dependensi
  berubah.

## Dokumentasi

- `README.md` (Inggris) dan `README-id_ID.md` (Indonesia) adalah titik masuk.
- Source wiki berada di `wiki` dan dicerminkan ke wiki GitHub.

## Keamanan

- Jangan pernah commit `.env`, application key, secret OAuth, atau kredensial database.
- Gunakan environment variable untuk secret dan rotasi setelah terjadi kebocoran.
- Laporkan masalah keamanan secara privat kepada maintainer, bukan melalui issue publik.

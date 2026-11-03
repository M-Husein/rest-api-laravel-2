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

Pilih preset RBAC:

```bash
php artisan starter:install --preset=site --rbac=advanced
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

## Preset RBAC

RBAC bersifat opsional dan terpisah dari preset produk. Default-nya adalah `simple`.

| Preset | Perilaku |
|--------|----------|
| `simple` | Proteksi berbasis role `Admin`/`Member` saja. Tanpa permission granular. |
| `standard` | Role plus permission granular. `Admin` mendapat semua permission; `Member` tidak mendapat permission. |
| `advanced` | Permission granular, policy model, dan pemeriksaan kepemilikan. `Member` hanya dapat melihat login history miliknya sendiri. |
| `none` | Tidak ada penegakan role atau permission. User terautentikasi lolos pemeriksaan RBAC. |

Untuk `advanced`, pilih mode evaluasi frontend record-level dengan `--rbac-ui`:

```bash
php artisan starter:install --preset=site --rbac=advanced --rbac-ui=server
php artisan starter:install --preset=site --rbac=advanced --rbac-ui=client
```

| Mode UI | Perilaku |
|---------|----------|
| `server` (default, direkomendasikan) | Pemeriksaan record-level UI memanggil `/api/v1/me/access/check` dan cocok dengan policy backend secara tepat. |
| `client` | Pemeriksaan record-level UI menggunakan permission dan data record lokal. Lebih cepat, tetapi hanya perkiraan; backend tetap menegaskan otorisasi. |

Pilihan disimpan sebagai `rbac` dan, untuk `advanced`, `rbac_ui` di `features.json`. Saat preset diterapkan, role dan
permission di-seed kecuali memakai `--no-migrate`. Mengubah preset tidak mengubah role user
yang sudah ada, dan `none` menonaktifkan penegakan tanpa menghapus role atau permission lama.

Kontrol akses frontend hanya diaktifkan di aplikasi admin. Untuk `none`, tidak ada `accessControlProvider` yang dipasang dan `CanAccess`/`useCan` mengizinkan semua user terautentikasi.


## Cara kerjanya

- `FeatureRepository` menemukan paket dari `packages/*/feature.json` dan menyelesaikan
  kumpulan yang diinginkan dari preset ditambah override.
- `FeatureInstaller` menjalankan `composer require` / `composer remove`, menulis ulang
  `features.json`, meregenerasi registry frontend, migrasi, dan build dengan package manager
  yang terdeteksi.
- Requirement Composer menggunakan path repository dan constraint `0.1.*`.

## Preset UI dan tanpa UI

**Preset tanpa UI (`api`, `multilingual`)**

- Tidak ada route `/app`, `/login`, `/settings`, atau route HTML publik.
- Tidak ada install frontend dan tidak ada build aset.

**Preset UI (`api-ui`, `multilingual-ui`, `site`)**

- Shell Blade, source React/Ant Design, route, dan tooling build disediakan oleh paket
  `ui`.
- Install dan build dengan Bun, npm, atau pnpm sebelum menyajikan UI di produksi.
- Override deteksi otomatis dengan `--package-manager=bun|npm|pnpm`.

> Selalu jalankan perintah install, dev, dan build **dari root repositori**, jangan pernah
> dari dalam `packages/ui`.

# Rest API Laravel 2

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Home) · **Bahasa Indonesia**

Starterkit REST API Laravel yang dibangun dengan **paket fitur yang dapat dipasang** dan
**preset proyek**.

Proyek ini dimulai sebagai REST API. Kini proyek ini menjadi implementasi referensi
PHP/Laravel untuk kontrak starterkit yang tidak terikat bahasa. Model preset yang sama
direncanakan untuk Go, Rust, Node.js (Express/NestJS), Bun (ElysiaJS), dan Python.

> **Status**
>
> Model lima preset dan pemisahan paket `ui` sudah diimplementasikan. `starterkit.json`
> menyediakan `api`, `api-ui`, `multilingual`, `multilingual-ui`, dan `site` (default).
> Paket fitur ditemukan dari `packages/*/feature.json`.

## Peta dokumentasi

| No | Halaman | Isi |
|----|---------|-----|
| 1 | [Memulai](id-Getting-Started) | Prasyarat, instalasi, menjalankan pertama kali |
| 2 | [Preset](id-Presets) | Kontrak preset dan kasus penggunaan |
| 3 | [Arsitektur](id-Architecture) | Batas core, UI, locale-switcher, dan SEO |
| 4 | [Manajemen Fitur](id-Feature-Management) | Pasang, hapus, dry-run, keamanan |
| 5 | [UI](id-UI) | Aplikasi React/Ant Design bawaan dan build |
| 6 | [Internasionalisasi](id-Internationalization) | Backend locale dan strategi UI |
| 7 | [SEO](id-SEO) | Shell publik, metadata, terjemahan halaman |
| 8 | [Port Bahasa](id-Language-Ports) | Kontrak antar-bahasa dan roadmap |
| 9 | [Kontribusi](id-Contributing) | Alur kerja pengembangan dan pengujian |

## Tujuan

- Menyediakan baseline REST API Laravel yang siap produksi.
- Mengirimkan kemampuan opsional sebagai paket, bukan branch atau fork.
- Memungkinkan setiap proyek dimulai dari preset: API saja, aplikasi admin privat,
  multibahasa, atau situs publik dengan SEO.
- Menjaga frontend tetap opsional agar API dapat digunakan oleh klien atau framework apa pun.
- Menggunakan kontrak preset yang sama di seluruh port bahasa mendatang.

## Tech stack

**Backend**

- PHP 8.5.12+, Laravel Framework 13, PostgreSQL
- Laravel Sanctum (autentikasi cookie SPA dan token API), Laravel Socialite
- Spatie Laravel Permission, Spatie Laravel Translation Loader
- NielsNumbers Laravel Localizer, dedoc/scramble, RZL Zone Blade Minify

**UI (opsional)**

- Refine (Ant Design, React Router, REST data provider)
- React 19, TypeScript, Vite, Ant Design, i18next, Zod
- Manajer paket: Bun (source UI berupa npm workspace)

UI hanya dipasang dan di-build untuk preset UI. Preset API saja tidak memerlukan Node.js
atau Bun.

## Dukungan

- [Laporkan bug](https://github.com/M-Husein/rest-api-laravel-2/issues)
- [Source code](https://github.com/M-Husein/rest-api-laravel-2)

# UI

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/UI) · **Bahasa Indonesia**

UI bawaan disediakan oleh paket fitur `ui`
(`programmeria/laravel-ui` / `@programmeria/ui`).

## Yang disertakan

- Shell Blade untuk area publik, admin, dan autentikasi.
- Source aplikasi React 19 + Refine + Ant Design di
  `packages/ui/resources/ts`.
- Route admin/auth (`/login`, `/register`, `/settings`, `/app`) dan route publik untuk
  preset UI.
- Konfigurasi build Vite dan seluruh dependensi frontend.

## Memasang dan build

UI diperlukan oleh preset `api-ui`, `multilingual-ui`, dan `site`. Untuk preset tersebut:

```bash
bun install
bun run build
```

Jalankan kedua perintah **dari root repositori**. Jangan pernah menjalankannya di dalam
`packages/ui`.

Preset API saja (`api`, `multilingual`) melewati instalasi, codegen, dan build sepenuhnya,
sehingga tidak memerlukan Node.js atau Bun.

## Cara paket UI terhubung

- Paket ini adalah paket Composer (path repository) sekaligus Bun workspace.
- Semua dependensi frontend berada di `packages/ui/package.json`; `package.json` root hanya
  menyimpan definisi workspace dan skrip.
- Vite me-resolve `@programmeria/<feature>` ke `packages/<feature>/resources/ts/index.ts`,
  sehingga TypeScript fitur dikonsumsi sebagai source.
- Paket fitur berkomunikasi dengan runtime UI melalui kontrak publik
  `@programmeria/ui/feature` (`featureApi`). Alias `@/` bersifat internal UI dan diblokir
  untuk paket lain oleh ESLint.
- Registry fitur (`features.generated.ts`) dihasilkan dari `features.json`.

## Route

- Route privat/admin berada di bawah `/app` dan dilindungi oleh autentikasi serta role.
- Route autentikasi mencakup login, registrasi, lupa password, dan reset password.
- Area admin sengaja tidak diindeks oleh mesin pencari.

## Registrasi bersifat opsional

Registrasi diaktifkan secara default. Deployment privat (misalnya sistem internal perusahaan)
dapat menghapus route, aksi controller, dan halaman React terkait sehingga akun hanya dapat
dibuat oleh administrator.

```php
// Registrasi bersifat opsional. Deployment privat (misalnya sistem internal
// perusahaan) dapat menghapus route ini, aksi controller, dan halaman React
// terkait sehingga akun hanya dapat dibuat oleh admin.
Route::get('register', [UiController::class, 'register'])->middleware('guest');
```

Untuk menonaktifkan registrasi:

1. Hapus route `/register` dari route paket `ui`.
2. Hapus aksi `register` dari controller UI.
3. Hapus halaman registrasi React dan route-nya.
4. Nonaktifkan juga endpoint registrasi API jika API bersifat publik.

## Keterbatasan yang diketahui

- TypeScript fitur menargetkan runtime UI React. Preset tanpa UI (`api`, `multilingual`)
  tidak memasang atau mem-build kode frontend.

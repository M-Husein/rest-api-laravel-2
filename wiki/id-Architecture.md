# Arsitektur

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Architecture) · **Bahasa Indonesia**

## Lapisan

| No | Lapisan | Paket | Tipe | Tanggung jawab |
|----|---------|-------|------|----------------|
| 1 | Core | kode aplikasi | Aplikasi Laravel | API, domain auth/admin, role, pengguna, sesi, backend localizer |
| 2 | UI | `programmeria/laravel-ui` / `@programmeria/ui` | Composer + npm workspace | Shell Blade, route admin/auth, source React/Ant Design, build Vite |
| 3 | Internasionalisasi | `programmeria/laravel-locale-switcher` | Composer + npm workspace | Backend locale, preferensi pengguna, menu bahasa, dan strategi frontend |
| 4 | SEO | `programmeria/laravel-seo` | Paket Composer | Shell SPA publik, meta/Open Graph/JSON-LD, terjemahan halaman |

## Tata letak repositori

```
packages/
  ui/               programmeria/laravel-ui + @programmeria/ui
  locale-switcher/  programmeria/laravel-locale-switcher
  seo/              programmeria/laravel-seo
app/Support/Starter/  installer, repository, manifest, JSON IO
starterkit.json       pemetaan preset ke fitur
features.json         fitur terpilih (sumber kebenaran untuk codegen)
scripts/generate-features.mjs  codegen registry frontend
```

## Format paket fitur

Setiap fitur dapat menyediakan:

- `composer.json` — service provider, route, migrasi, view, dan dependensi PHP.
- `package.json` — metadata npm workspace dan dependensi frontend bila berlaku.
- `feature.json` — label, deskripsi, keanggotaan preset, requirement, conflict, dan flag
  `frontend`.

Field `feature.json`:

| Field | Arti |
|-------|------|
| `label`, `description` | Metadata yang dapat dibaca manusia |
| `presets` | Preset yang menyertakan fitur ini |
| `requires` | Fitur yang juga harus dipasang |
| `conflicts` | Fitur yang tidak boleh dipasang bersamaan |
| `frontend` | Apakah paket menyumbang modul yang diimpor oleh registry fitur hasil generate |

Composer menentukan apakah suatu fitur dipasang. npm workspace hanya menyediakan source
frontend yang dikonsumsi Vite. Semua dependensi frontend berada di
`packages/ui/package.json`; `package.json` root hanya menyimpan definisi workspace dan
skrip.

## Wiring Composer dan npm

- Composer menggunakan **path repository** (`packages/*`) dengan symlink, sehingga paket
  lokal dipasang langsung dari repositori.
- Bun menggunakan **workspaces**; alias Vite `/^@programmeria\/([^/]+)$/` diarahkan ke
  `packages/$1/resources/ts/index.ts`, sehingga TypeScript dikonsumsi sebagai source.
- Constraint fitur berbentuk wildcard (`0.1.*`) agar aman diteruskan melalui `cmd.exe` di
  Windows.

## Registry frontend dan codegen

- `features.json` mencantumkan fitur terpilih dan subset yang menyediakan modul frontend.
- `scripts/generate-features.mjs` membaca `features.json` dan menulis
  `packages/ui/resources/ts/features.generated.ts`.
- Codegen hanya berjalan untuk preset UI; preset API saja melewatinya.

## Perilaku runtime

- Service provider didaftarkan secara kondisional berdasarkan paket yang terpasang
  (`class_exists`), sehingga menghapus paket fitur menghapus route dan view-nya.
- Redirect login bersifat kondisional: setelah login, UI berperilaku sesuai
  `APP.redirectAfterLogin` (`/` bila SEO tersedia, jika tidak `/app`).
- Redirect guest menuju `/login` hanya ketika paket `ui` terpasang.

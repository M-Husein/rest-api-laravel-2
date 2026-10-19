# Internasionalisasi

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Internationalization) · **Bahasa Indonesia**

Dukungan multi-locale disediakan oleh paket fitur `locale-switcher`
(`programmeria/laravel-locale-switcher`).

## Cakupan

Fitur ini menyediakan:

- kolom `lang` untuk pengguna;
- middleware locale untuk request API;
- `PUT /api/v1/me/language` untuk preferensi bahasa per pengguna;
- menu bahasa dan strategi pathname, storage, query, serta user di UI.

Tanpa fitur ini, aplikasi berjalan dalam satu locale. Dengan fitur ini dan UI, pengguna dapat
mengganti bahasa dan preferensinya disimpan per pengguna.

## Strategi locale

Frontend menentukan strategi aktif per zona:

| Strategi | Deteksi | Catatan |
|----------|---------|---------|
| `pathname` | Locale di path URL (`/id`, `/en`) | Terbaik untuk SEO publik |
| `query` | `?lang=id` | Sederhana, tanpa perubahan route backend; kurang baik untuk SEO |
| `user` | Disimpan per pengguna di database | Untuk aplikasi privat; bukan untuk SEO |
| `storage` | localStorage/cookie browser | Paling sederhana; sengaja di-reset saat logout |

- Situs publik menggunakan strategi `pathname` (URL terlokalisasi yang ramah SEO).
- Area admin (`/app`) menggunakan strategi `user` dan tidak ditujukan untuk SEO.

## Mode satu locale

Ketika `locale-switcher` tidak terpasang, aplikasi berjalan dalam satu locale dan kolom `lang`
tidak aktif. Preset:

- `api`, `api-ui` — satu locale
- `multilingual`, `multilingual-ui`, `site` — banyak locale

## Preset

Fitur ini disertakan dalam preset `multilingual`, `multilingual-ui`, dan `site`. Untuk sistem
multibahasa privat, gunakan `multilingual-ui`.

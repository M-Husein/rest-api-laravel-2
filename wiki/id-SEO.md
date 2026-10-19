# SEO

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/SEO) · **Bahasa Indonesia**

SEO situs publik disediakan oleh paket fitur `seo` (`programmeria/laravel-seo`).

## Yang disediakan

- shell SPA publik yang dirender server dengan meta tag first-load;
- metadata Open Graph dan Twitter;
- data terstruktur JSON-LD;
- terjemahan halaman terlokalisasi melalui `GET /api/v1/locales/{lang}/page/{name}`;
- URL kanonik dan direktif robots untuk halaman publik dan privat.

SEO hanya berupa **metadata first-load**; aplikasi tidak menggunakan server-side rendering
untuk halaman React. Paket ini memerlukan paket `ui` karena shell publik mereferensikan
entry point frontend bawaan.

## Halaman publik vs privat

- Route publik (beranda, tentang, artikel, kontak) menerima meta tag dan dapat diindeks.
- Halaman privat/admin ditandai `noindex` dan tidak pernah ditujukan untuk mesin pencari.

## Preset

SEO hanya disertakan dalam preset `site`. Paket ini memerlukan `ui`; memasang `seo` tanpa
`ui` akan ditolak oleh installer.

## Hubungan dengan i18n

URL publik terlokalisasi menggunakan strategi locale `pathname` dari fitur
`locale-switcher`. Karena itu preset `site` menyertakan `ui`, `locale-switcher`, dan `seo`.

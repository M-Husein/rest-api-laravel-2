# Internasionalisasi

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Internationalization) | **Bahasa Indonesia**

> Status: kontrak desain v1 (2026-10-24). Sudah diimplementasikan untuk backend PHP
> dan frontend; regression test mencakup kontrak ini.

Dukungan multi-locale disediakan oleh paket fitur opsional `locale-switcher`
(`programmeria/laravel-locale-switcher`). Runtime terjemahan selalu tersedia; fitur ini
menambahkan menu bahasa, preferensi per pengguna, dan strategi lokalisasi.

## Cakupan

- `api`, `api-ui`: satu locale.
- `multilingual`, `multilingual-ui`, `site`: banyak locale, menu bahasa aktif.
- Situs publik: URL terlokalisasi untuk SEO.
- Area admin (`/app`): locale per pengguna, tidak dilokalkan lewat URL.
- API: respons sadar-locale melalui sinyal request yang eksplisit.

## Istilah

- **Locale default**: `config('app.fallback_locale')`, saat ini `en`.
- **Locale didukung**: `config('localizer.supported_locales')`, saat ini `en` dan `id`.
- **Zona publik**: route terlokalisasi yang didaftarkan lewat `Route::localize()`, di luar
  `/app`.
- **Zona admin**: `/app` dan `/app/*`.
- **Zona API**: `/api/*`.
- **Sinyal locale eksplisit**: locale valid di path URL, `?lang=`, atau
  `Accept-Language`.

Format locale adalah key bahasa yang dikonfigurasi (`en`, `id`). Varian regional seperti
`en-US` belum didukung sampai ditambahkan ke registry locale.

## Keputusan inti

1. **URL publik menang.** Locale publik hanya ditentukan oleh path URL. Header browser
   dan bahasa tersimpan milik pengguna yang login tidak boleh menimpanya.
2. **Preferensi pengguna admin menang.** Locale admin berasal dari `users.lang`. URL dan
   query parameter tidak melokalkan halaman admin.
3. **Sinyal eksplisit API menang.** Untuk request API, `?lang` mengalahkan
   `Accept-Language`, yang mengalahkan `users.lang` pengguna yang login, yang mengalahkan
   locale default.
4. **Tidak ada persistensi tersembunyi di situs publik.** Pergantian bahasa publik hanya
   mengubah URL. Persistensi locale di session dan cookie tetap nonaktif.
5. **URL publik kanonik menyembunyikan locale default.** `/en/...` dialihkan ke URL tanpa
   prefix; locale non-default selalu memakai prefix.

## Kontrak URL publik

| Halaman | `en` (default) | `id` |
|---------|----------------|------|
| Beranda | `/` | `/id` |
| Tentang | `/about` | `/id/about` |
| Artikel | `/articles` | `/id/articles` |
| Kontak | `/contact-us` | `/id/contact-us` |
| Login | `/login` | `/id/login` |

Aturan:

- Locale default disembunyikan: `/` dan `/articles`, bukan `/en` dan `/en/articles`.
- `/en` dan `/en/*` dialihkan ke URL tanpa prefix. Redirect permanen (301) lebih
  disarankan.
- Locale non-default wajib memakai prefix: `/id`, `/id/articles`.
- Segmen pertama yang tidak didukung tidak dianggap locale; `/xx/articles` menghasilkan
  404, bukan fallback diam-diam.
- `?lang=` bukan sinyal locale publik dan tidak boleh dihasilkan oleh link publik.
- Query string dan fragment dipertahankan saat berganti locale.
- Pergantian bahasa melakukan navigasi ke URL terlokalisasi. Reload penuh boleh; tidak
  ada preferensi pengguna yang ditulis.
- Pengguna yang login di situs publik tetap mengikuti URL. Pengguna dengan bahasa
  tersimpan `en` dapat membuka `/id` dan melihat bahasa Indonesia.
- Redirect auth berada di luar kontrak ini. Login dan register saat ini mengarah ke `/`;
  mengubahnya ke beranda terlokalisasi adalah keputusan terpisah.

## Kontrak admin

- Route admin berada di bawah `/app` dan tidak memiliki prefix locale.
- Locale adalah `users.lang` jika didukung; jika tidak, locale default.
- Path URL dan `?lang=` tidak mengubah locale admin.
- Pergantian bahasa memperbarui UI segera, memperbarui user di memori, dan mengirim
  `PUT /api/v1/me/language` dengan `{ "lang": "id" }`.
- Database adalah satu-satunya persistensi admin. `localStorage` bukan sumber locale.
- Jika request preferensi gagal, UI harus kembali ke locale sebelumnya dan menampilkan
  error; tidak boleh diam-diam menganggap berhasil.
- Pada login berikutnya, `users.lang` yang tersimpan dipakai lagi.
- Halaman admin bersifat privat dan tidak boleh menghasilkan metadata SEO publik.

## Kontrak API

Respons API yang sadar-locale memakai urutan prioritas:

1. `?lang=` yang valid
2. `Accept-Language` yang valid
3. `users.lang` pengguna yang login dan valid
4. Locale default

Aturan:

- Sinyal request eksplisit selalu mengalahkan preferensi pengguna tersimpan.
- Nilai tidak valid dilewati; resolusi berlanjut ke sumber berikutnya.
- SPA publik mengirim `Accept-Language` sesuai locale URL publik. Ini menjaga konten API
  selaras dengan `/id/...` meskipun bahasa tersimpan pengguna berbeda.
- SPA admin mengirim `Accept-Language` sesuai `users.lang`.
- `PUT /api/v1/me/language` memperbarui `users.lang` dan mengembalikan user terbaru.
- `lang` harus salah satu locale yang didukung; nilai tidak valid menghasilkan `422`.
- Pesan error API dan payload terjemahan mengikuti locale request yang ter-resolve.
- `?lang=` di halaman publik diabaikan; hanya bermakna untuk konsumen API.

## Matriks prioritas

| Sinyal | Halaman publik | Halaman admin | API |
|--------|----------------|---------------|-----|
| Prefix locale di URL | 1 | diabaikan | diabaikan |
| `?lang=` | diabaikan | diabaikan | 1 |
| `Accept-Language` | diabaikan | diabaikan | 2 |
| `users.lang` | diabaikan | 1 | 3 |
| Locale default | 2 | 2 | 4 |

## Perilaku pergantian bahasa

| Zona | Perubahan UI | Efek HTTP | Efek URL | Persistensi |
|------|--------------|-----------|----------|-------------|
| Publik | Navigasi ke halaman terlokalisasi | Tidak ada | `/id/...` atau tanpa prefix | Tidak ada |
| Admin | Perbarui i18n dan locale komponen | `PUT me/language` | Tidak berubah | `users.lang` |
| Klien API | Dikelola klien | Kirim `?lang` atau `Accept-Language` | Tidak berlaku | Opsional lewat `me/language` |

Zona publik dan admin sengaja independen. Pergantian di situs publik tidak menulis
`users.lang`; pergantian di admin tidak mengubah URL publik.

## Kontrak strategi frontend

Interface `LocaleStrategy` tetap menjadi titik integrasi:

| Strategi | `getCurrent` | `apply` | `localizeHref` | `getRouterBasename` |
|----------|--------------|---------|----------------|---------------------|
| `pathname` | Path URL | Navigasi ke path terlokalisasi | Tambahkan prefix path | `''` untuk default, `/${locale}` untuk lainnya |
| `user` | User di memori, dengan fallback saat startup | Perbarui cache user, PUT preferensi, ubah i18n | Identity | `''` |
| `query` | `?lang=` | Perbarui query dan navigasi | Tambahkan `?lang=` | `''` |
| `storage` | Storage browser | Simpan dan ubah i18n | Identity | `''` |

Aturan:

- `zoneStrategy()` memilih `APP.strategy`; jika tidak ada, fallback ke deteksi path
  `/app`.
- Preset publik dan admin memakai `pathname` dan `user`. `query` dan `storage` tetap
  tersedia untuk integrasi kustom tetapi tidak diaktifkan oleh preset tersebut.
- `pathname.getCurrent()` hanya membaca path. Tidak boleh membaca `localStorage` atau
  user yang login.
- `pathname.getRouterBasename()` mengembalikan `''` untuk locale default dan
  `/${locale}` untuk locale non-default.
- `pathname.localizeHref()` harus menambahkan prefix pathname. Tidak boleh menambahkan
  `?lang=`, tidak boleh memberi prefix ganda, dan harus mempertahankan query string serta
  fragment.
- `changeUrlLang()` harus menghapus prefix saat beralih ke locale default, menambahkan
  prefix untuk locale non-default, dan mempertahankan query string serta fragment.
- `user.getCurrent()` membaca user di memori, bukan `localStorage`. Ia fallback ke
  `window.__APP__.user` yang di-inject server sebelum runtime user UI terdaftar.
- `user.apply()` memperbarui user di memori, memanggil `PUT me/language`, memperbarui
  `document.documentElement.lang`, dan mengubah i18n.
- `i18nBackend` harus mengirim bahasa yang sedang diminta, bukan bahasa awal yang sudah
  basi.
- Runtime i18n inti memiliki `featureApi.getRequestHeaders()` dan mengirim
  `i18n.language` sebagai `Accept-Language`; strategy locale tidak memiliki header HTTP.

## Kontrak backend

- Route publik terlokalisasi didaftarkan dengan `Route::localize()` dan memakai middleware
  `SetLocale` dari paket.
- Konfigurasi publik: `hide_default_locale=true`, `redirect_enabled=true`,
  `persist_locale.session=false`, `persist_locale.cookie=false`, `detectors=[]`.
- Detector kosong disengaja: tidak ada auto-deteksi browser di situs publik.
- Request API memakai `SetLang`. Urutannya harus `?lang` > `Accept-Language` > default,
  dengan user login sebagai fallback hanya jika tidak ada sinyal eksplisit.
- `SetUserLocale` tidak boleh menimpa locale URL publik atau sinyal API eksplisit. Ia
  boleh menerapkan preferensi user untuk request admin (dan request API tanpa sinyal
  eksplisit).
- `LanguagePreferenceController` memvalidasi `lang` terhadap locale yang didukung dan
  memperbarui user yang login.
- Route `/app` dan `/api` tidak boleh dibungkus `Route::localize()`.

## Kontrak SEO

- URL publik kanonik memakai locale default tanpa prefix.
- Setiap halaman publik mengeluarkan link `hreflang` untuk semua locale yang didukung
  plus `x-default` yang mengarah ke URL default.
- URL `?lang=` tidak pernah kanonik dan tidak boleh diindeks.
- Halaman admin bersifat privat dan dikecualikan dari SEO publik.
- Metadata server-rendered, terjemahan halaman, dan `html lang` mengikuti locale publik
  yang ter-resolve.
- `locale_directions` tetap kosong sampai locale RTL ditambahkan; saat ditambahkan, atur
  `dir` sesuai.

Contoh untuk `/id/articles`:

- Kanonik: `/id/articles`
- Alternatif `id`: `/id/articles`
- Alternatif `en`: `/articles`
- `x-default`: `/articles`

## Kasus tepi

- `/en` dan `/en/articles` dialihkan ke `/` dan `/articles`.
- `/xx` dan `/xx/articles` menghasilkan 404 kecuali `xx` ditambahkan ke registry locale.
- `?lang=xx` yang tidak valid di API dilewati; sumber valid berikutnya dipakai.
- User dengan `users.lang` yang tidak didukung fallback ke default; nilainya tidak
  ditulis ulang otomatis.
- Menghapus locale dari config membuat URL lamanya 404 dan preferensi user terkait
  fallback ke default.
- Pergantian locale mempertahankan `?search=...` dan `#fragment`.
- Prefix ganda seperti `/id/id/articles` tidak pernah dihasilkan dan menghasilkan 404.
- Trailing slash bukan bagian dari URL kanonik kecuali untuk path root.

## Status implementasi

Sudah diimplementasikan:

- `LocaleResolver` memusatkan parsing `?lang` dan `Accept-Language` yang valid.
- `SetLang` memprioritaskan `?lang`, lalu `Accept-Language`, lalu default.
- `SetUserLocale` melewati locale URL publik dan sinyal API eksplisit.
- Guard token API menerapkan fallback user lewat middleware setelah autentikasi.
- URL publik `/en` dikanonikalisasi ke URL tanpa prefix.
- `pathnameStrategy.localizeHref()` memberi prefix path dan mempertahankan query/fragment.
- `changeUrlLang()` mempertahankan query/fragment dan menghindari prefix ganda.
- Locale admin membaca user di memori, bukan `localStorage`.
- Pergantian bahasa admin mengembalikan locale sebelumnya dan menampilkan error bila
  request preferensi gagal.
- `i18nBackend` mengirim bahasa yang diminta di `Accept-Language`.
- Link hreflang memakai URL lokal kanonik.
- Regression test: `tests/Feature/LocaleContractTest.php` dan
  `tests/frontend/locale.test.ts`.

## Acceptance test

Backend:

- `GET /` menghasilkan `en`; `GET /id` menghasilkan `id`.
- `GET /en` redirect ke `/`; `GET /en/articles` redirect ke `/articles`.
- `GET /xx` menghasilkan 404.
- User login dengan `lang=en` tetap mendapat `id` di `/id`.
- `?lang=id` di halaman publik tidak mengubah locale publik.
- `PUT /api/v1/me/language` menerima `id`, menolak `xx`, dan mengembalikan user terbaru.
- API `?lang=id` dengan `Accept-Language: en` menghasilkan `id`.
- API `Accept-Language: id` tanpa `?lang` menghasilkan `id`.
- API tanpa sinyal eksplisit tetapi `users.lang=id` menghasilkan `id`.
- API tanpa sinyal apa pun menghasilkan `en`.

Frontend:

- `localizeHref('/articles', 'id')` menghasilkan `/id/articles`.
- `localizeHref('/id/articles', 'en')` menghasilkan `/articles`.
- `localizeHref('/articles?page=2#top', 'id')` mempertahankan query dan fragment.
- `localizeHref('/id/articles', 'id')` tidak memberi prefix ganda.
- Pergantian bahasa publik mengubah URL dan tidak memanggil `PUT me/language`.
- Pergantian bahasa admin memanggil `PUT me/language`, memperbarui UI, dan bertahan
  setelah reload.
- Locale awal admin berasal dari user, bukan `localStorage`.

SEO:

- `/` dan `/id` mengeluarkan canonical dan set `hreflang` yang benar.
- `/en` bukan kanonik.
- Halaman admin tidak mengeluarkan canonical atau `hreflang` publik.

## Smoke test manual

Jalankan sebelum merilis perubahan locale. Gunakan preset `site` (atau `multilingual-ui`
jika tidak ada situs publik), aset hasil build, dan user admin dengan `users.lang` = `id`.

Publik:

- [ ] `/` menghasilkan `lang="en"`; `/id` menghasilkan `lang="id"`.
- [ ] `/en` dan `/en/articles` redirect ke `/` dan `/articles`.
- [ ] `/xx` dan `/xx/articles` menghasilkan 404.
- [ ] `/id/articles` menampilkan konten dan tautan Indonesia; beralih ke Inggris
      menghapus prefix.
- [ ] Pergantian di `/id/articles?page=2#top` mempertahankan query dan fragment serta
      tidak mengirim `PUT`.
- [ ] `/reset-password`, `/api/*`, `/app`, `/up`, dan `/403` tidak diberi prefix.
- [ ] Login, register, dan forgot-password berfungsi di `/id/...`.
- [ ] Lihat source: `/` dan `/id` memiliki canonical/hreflang yang benar; admin tidak
      memiliki tag SEO publik.

Admin:

- [ ] `/app` dimulai dengan `users.lang`; mengubah `localStorage` tidak berpengaruh.
- [ ] Pergantian langsung memperbarui UI dan memanggil `PUT /api/v1/me/language`.
- [ ] Locale baru bertahan setelah reload dan tersimpan di database.
- [ ] `PUT` yang gagal mengembalikan locale sebelumnya dan menampilkan error.
- [ ] `/app?lang=en` tetap memakai `users.lang`.

API:

- [ ] Request token Sanctum tanpa `?lang` atau `Accept-Language` memakai `users.lang`.
- [ ] `?lang` menang atas `Accept-Language` dan preferensi user.
- [ ] `Accept-Language` menang atas preferensi user.
- [ ] Nilai `?lang` dan `Accept-Language` yang invalid fallback ke preferensi user atau
      locale default.
- [ ] Pesan error memakai locale request yang berhasil di-resolve.

## Non-goals

- Auto-deteksi browser di situs publik.
- Persistensi locale di session atau cookie.
- Locale regional seperti `en-US` atau `pt-BR`.
- Slug URL terjemahan.
- Dukungan RTL sampai locale RTL ditambahkan.
- Lokalisasi admin server-rendered.
- Porting kontrak ini ke bahasa lain sebelum perilaku PHP diimplementasikan dan diuji.

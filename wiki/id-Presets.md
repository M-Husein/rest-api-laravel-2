# Preset

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Presets) · **Bahasa Indonesia**

Preset adalah profil produk, bukan detail implementasi. Nama dan kemampuan yang sama
dimaksudkan untuk digunakan oleh setiap port bahasa.

## Kontrak preset

| No | Preset | Fitur | UI | Locale | Situs publik / SEO | Kasus penggunaan umum |
|----|--------|-------|----|--------|--------------------|-----------------------|
| 1 | `api` | — | Tidak | Tunggal | Tidak | API headless, frontend kustom |
| 2 | `api-ui` | `ui` | Ya | Tunggal | Tidak | Aplikasi admin/auth privat |
| 3 | `multilingual` | `locale-switcher` | Tidak | Banyak | Tidak | API multibahasa, frontend kustom |
| 4 | `multilingual-ui` | `ui`, `locale-switcher` | Ya | Banyak | Tidak | Sistem perusahaan multibahasa privat |
| 5 | `site` | `ui`, `locale-switcher`, `seo` | Ya | Banyak | Ya | Situs publik dengan SEO |

Preset default adalah `site`.

Catatan:

- `seo` memerlukan `ui`; shell SEO publik membutuhkan lapisan HTML/UI.
- Preset tanpa UI tidak mendaftarkan `/app`, `/login`, `/settings`, atau route HTML lainnya.
  Kemampuan admin dan autentikasi tersedia melalui API.
- Untuk sistem multibahasa privat, gunakan `multilingual-ui`, bukan `multilingual`.

## Detail preset

### 1. `api`

Hanya backend dan API. Mencakup autentikasi, logika domain admin, role, pengguna, sesi, dan
endpoint API publik. Tanpa shell HTML, tanpa build frontend, dan tanpa situs publik.

Gunakan ketika frontend dibangun dengan framework lain atau ketika proyek merupakan layanan
yang digunakan oleh aplikasi mobile atau klien pihak ketiga.

### 2. `api-ui`

Baseline `api` ditambah UI React/Ant Design bawaan. Mencakup dashboard admin, login,
lupa/reset password, dan halaman pengaturan akun.

Preset ini tidak menyertakan halaman marketing publik. Gunakan untuk aplikasi privat yang
membutuhkan UI siap pakai tetapi tidak boleh diindeks publik.

### 3. `multilingual`

Baseline `api` ditambah dukungan locale sisi server: kolom `lang` pengguna, middleware
locale, dan endpoint preferensi bahasa per pengguna.

Preset ini tidak memiliki UI. Frontend dapat dibangun dengan framework apa pun; klien API
yang menentukan cara mendeteksi dan menyimpan locale.

### 4. `multilingual-ui`

Baseline `multilingual` ditambah UI React/Ant Design bawaan. Ini adalah preset yang
direkomendasikan untuk sistem perusahaan multibahasa privat: autentikasi, dashboard admin,
dan pergantian bahasa tanpa situs publik.

### 5. `site`

Starterkit lengkap: backend, UI, dukungan multibahasa, halaman publik, metadata SEO
first-load, Open Graph, JSON-LD, dan terjemahan halaman yang terlokalisasi.

Route publik mencakup halaman beranda, tentang, artikel, kontak, login, registrasi, dan
pengaturan. Route privat/admin tetap dilindungi oleh autentikasi dan role.

## Nama preset lama

Preset lama `minimal`, `default`, dan `full` telah dihapus; tidak ada alias yang disediakan.
Gunakan `api` sebagai pengganti `minimal`, dan `site` sebagai pengganti `default` atau `full`.

## Cara pemilihan

- Preset diselesaikan pada **waktu instalasi** oleh `php artisan starter:install`.
- `starterkit.json` mendefinisikan pemetaan preset ke fitur dan preset default.
- Override tersedia dengan `--with` dan `--without`.
- Lihat [Manajemen Fitur](id-Feature-Management) untuk perintah dan keamanan.

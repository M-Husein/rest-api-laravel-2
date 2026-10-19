# Port Bahasa

[English](https://github.com/M-Husein/rest-api-laravel-2/wiki/Language-Ports) · **Bahasa Indonesia**

Nama preset tidak terikat bahasa. Nama repositori dan paket dapat berbeda per ekosistem,
tetapi kemampuannya harus sesuai dengan kontrak preset.

## Roadmap

| No | Target | Repositori yang disarankan | Status |
|----|--------|----------------------------|--------|
| 1 | PHP / Laravel | `rest-api-laravel-2` | Implementasi referensi, dalam proses |
| 2 | Go | `rest-api-go` | Direncanakan |
| 3 | Rust | `rest-api-rust` | Direncanakan |
| 4 | Node.js (Express/NestJS) | `rest-api-node` | Direncanakan |
| 5 | Bun (ElysiaJS) | `rest-api-bun` | Direncanakan |
| 6 | Python | `rest-api-python` | Direncanakan |

## Aturan untuk port

- Pertahankan lima nama preset yang sama: `api`, `api-ui`, `multilingual`,
  `multilingual-ui`, `site`.
- Jangan menambahkan nama bahasa ke nama preset (`api-go`, `api-rust`, dan sebagainya).
- Definisikan dan versikan kontrak API lebih awal; UI React dapat digunakan ulang di seluruh
  backend ketika kontraknya stabil.
- `site` memerlukan shell yang dirender server dan metadata. Jika suatu port belum dapat
  mendukungnya, dokumentasikan keterbatasannya alih-alih mengganti nama preset.

## Penamaan paket

Referensi PHP/Laravel menggunakan Composer `programmeria/laravel-<feature>` dan npm
`@programmeria/<feature>`. Ekosistem lain dapat menggunakan konvensi mereka sendiri, tetapi
kemampuan fitur dan keanggotaan preset harus tetap sama.

## Frontend bersama

Karena UI adalah paket terpisah yang berkomunikasi dengan API stabil, suatu port dapat
menggunakan ulang UI React/Ant Design yang sama. Jaga batas fitur dan kontrak API tetap
selaras.

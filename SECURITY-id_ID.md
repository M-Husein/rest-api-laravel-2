# Kebijakan Keamanan

**Bahasa:** [English](SECURITY.md) | Bahasa Indonesia

## Versi yang didukung

| Versi   | Didukung |
|---------|----------|
| 0.3.x   | Ya       |
| < 0.3.0 | Tidak    |

Proyek ini memerlukan **PHP >= 8.5.12**. Versi PHP yang lebih lama terdampak PHP2Shell
(`CVE-2026-109618`, `CVE-2026-109619`) dan tidak didukung.

## Melaporkan kerentanan

Jangan buka issue publik yang berisi detail kerentanan.

Proyek ini belum menggunakan GitHub Security Advisories atau alamat email keamanan khusus.
Laporkan kerentanan secara privat kepada maintainer melalui metode kontak yang tersedia di
profil GitHub maintainer:

- https://github.com/M-Husein

Jika tidak dapat menghubungi maintainer secara privat, buka issue publik minimal untuk
meminta kanal privat. Jangan sertakan langkah reproduksi, endpoint terdampak, kredensial,
atau detail sensitif lainnya di issue tersebut.

Sertakan:

- Versi atau commit yang terdampak.
- Versi PHP dan detail environment yang relevan.
- Langkah reproduksi.
- Dampak keamanan dan saran perbaikan jika ada.

## Pengungkapan

Mohon beri waktu untuk investigasi dan perbaikan sebelum pengungkapan publik. Maintainer
akan mengoordinasikan perbaikan dan pengungkapan dengan Anda.

## Cakupan

Kebijakan ini mencakup repository ini dan paket bawaan di dalamnya. Laporkan kerentanan
pada dependensi pihak ketiga ke proyek upstream, kecuali masalah tersebut disebabkan oleh
cara proyek ini mengonfigurasi atau menggunakan dependensi tersebut.

## Dasar keamanan

- Jangan pernah commit `.env`, application key, secret OAuth, kredensial database, atau token.
- Gunakan environment variable untuk secret dan rotasi setelah terjadi kebocoran.
- Gunakan PHP 8.5.12 atau versi yang lebih baru.
- Jaga Composer dan dependensi frontend tetap mutakhir.

## Tidak ada bug bounty

Proyek ini belum menyediakan program bug bounty.

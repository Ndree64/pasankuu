# TECH_STACK.md — Pasanku

Dokumen ini menetapkan seluruh teknologi, pustaka, dan lingkungan pengembangan/produksi yang digunakan untuk membangun aplikasi web **PASANKU** dengan pendekatan **Modern Monolith (Laravel + Inertia.js + React.js)**.

---

## 1. Ringkasan Tumpukan Teknologi

| Lapisan | Teknologi | Versi Disarankan | Fungsi Utama |
| --- | --- | --- | --- |
| **Framework Backend** | Laravel | 11.x / 12.x | Routing, Controllers, Autentikasi, RBAC, Validasi Form Request, Service Layer, Transaksi DB |
| **Bahasa Backend** | PHP | 8.2+ / 8.3+ | Logika server, Service Classes, Eloquent Models, Policies |
| **Adapter SPA (Bridge)** | Inertia.js | `inertia-laravel` 2.x & `@inertiajs/react` 2.x | Menghubungkan Controller Laravel langsung ke halaman React tanpa REST API terpisah |
| **UI Library Frontend** | React.js | 18.x / 19.x (JSX) | Komponen antarmuka responsif, latihan interaktif, builder admin, panel validator, dan pratinjau |
| **Bahasa Frontend** | JavaScript (JSX) | ES2022+ | Ramah pemula tanpa overhead TypeScript *(opsional dapat ditingkatkan ke TypeScript bila diinginkan)* |
| **Styling** | Tailwind CSS | 4.x (`@tailwindcss/vite`) | Design tokens (`@theme`), layout responsif mobile-first, efek tombol taktil 3D |
| **Ikon UI** | Lucide React | Terbaru | Ikon konsisten (gembok, centang, piala, silang, pensil, jam) sesuai `DESIGN.md` |
| **Helper Route Frontend** | Ziggy (`tightenco/ziggy`) | 2.x | Memanggil named routes Laravel (`route('learner.lessons.show', id)`) langsung dari React |
| **Asset Bundler** | Vite | 5.x / 6.x | Kompilasi cepat React JSX (`@vitejs/plugin-react`) dan Tailwind CSS v4 |
| **Database Relasional** | MySQL atau PostgreSQL | MySQL 8.0+ / PostgreSQL 15+ | Penyimpanan 25 tabel relasional, JSON, foreign key, dan unique constraint |
| **ORM & Migrasi** | Eloquent ORM | Bawaan Laravel | Model entitas, relasi, migrasi skema, seeder, dan `DB::transaction()` |
| **Autentikasi** | Laravel Auth (Session-based) | Bawaan Laravel | Login, registrasi, logout, hashing Bcrypt/Argon2, cookie HTTP-only, proteksi CSRF |
| **Penyimpanan Berkas** | Laravel Filesystem Storage | Bawaan Laravel | Penyimpanan aset pendukung (opsional lokal / cloud S3-compatible) |
| **Testing** | Pest atau PHPUnit | Pest 3.x / PHPUnit 11.x | Unit test logika bisnis & Feature test termasuk `assertInertia()` |
| **Version Control** | Git & GitHub | - | Pengelolaan kode sumber, branch fitur, dan kolaborasi |
| **Deployment** | Shared Hosting / VPS / Laravel Cloud | Nginx/Apache + PHP-FPM | Hosting aplikasi produksi, HTTPS/SSL, dan backup database |

---

## 2. Alasan Pemilihan Stack (Modern Monolith)

1. **Pengalaman SPA Mulus Tanpa Kerumitan REST API:** Inertia.js menjembatani Laravel dan React sehingga perpindahan halaman, pengisian soal, dan pencarian kamus terasa instan seperti aplikasi SPA tanpa perlu mengurus JWT, CORS, atau sinkronisasi dua repositori terpisah.
2. **Kendali Penuh atas UI `DESIGN.md`:** Seluruh interaksi spesifik—seperti jalur zig-zag *Learning Path*, soal mencocokkan pasangan (*tap* kiri ke kanan), pengurutan aktivitas di *Lesson Builder*, dan *Mode Pratinjau* *stateless*—sangat rapi dan natural dibangun dengan *component state* React (`useState`).
3. **Backend Terstruktur & Aman:** Laravel menangani autentikasi sesi, *Middleware*, *Policy*, validasi input (`FormRequest`), Eloquent ORM, dan transaksi database secara rapi di server tanpa perlu menulis aturan RLS database secara manual.
4. **Ramah Pemula dengan Varian JSX:** Menggunakan React JavaScript (`.jsx`) alih-alih TypeScript menjaga kurva belajar tetap terjangkau bagi pemula sembari memanfaatkan ekosistem React dan *starter kit* resmi Laravel.

---

## 3. Paket & Dependensi Utama

### 3.1 Dependensi PHP (`composer.json`)
- `laravel/framework` — Inti aplikasi Laravel.
- `inertiajs/inertia-laravel` — Adapter server-side Inertia.js.
- `tightenco/ziggy` — Helper named routes Laravel di sisi JavaScript/React.
- `pestphp/pest` dan `pestphp/pest-plugin-laravel` *(dev)* — Pengujian otomatis.

### 3.2 Dependensi Frontend (`package.json`)
- `react` dan `react-dom` — Library UI React.
- `@inertiajs/react` — Adapter client-side Inertia (`Link`, `router`, `useForm`, `usePage`, `Head`).
- `lucide-react` — Koleksi ikon ringan untuk status dan navigasi.
- `tailwindcss` (v4) dan `@tailwindcss/vite` — Sistem desain dan utilitas CSS.
- `vite`, `laravel-vite-plugin`, dan `@vitejs/plugin-react` — Bundling aset pengembangan dan produksi.

---

## 4. Lingkungan Pengembangan Lokal

| Kebutuhan | Opsi yang Direkomendasikan |
| --- | --- |
| Runtime PHP & Web Server | Laravel Herd, Laragon (Windows), XAMPP, atau Docker (Laravel Sail) |
| Manajer Paket PHP | Composer 2.x |
| Runtime Build Frontend | Node.js 20 LTS+ dan NPM |
| Database Lokal | MySQL 8.0+ atau PostgreSQL 15+ |
| Editor Kode | VS Code (ekstensi: Laravel Official, Intelephense, ES7+ React Snippets, Tailwind CSS IntelliSense) |

---

## 5. Konfigurasi Environment (`.env`)

Variabel kunci yang wajib diatur pada lingkungan lokal dan produksi:

```env
APP_NAME="Pasanku"
APP_ENV=local # ubah ke production saat rilis
APP_KEY=base64:...
APP_DEBUG=true # WAJIB false di produksi
APP_URL=http://localhost:8000

DB_CONNECTION=mysql # atau pgsql
DB_HOST=127.0.0.1
DB_PORT=3306 # atau 5432 untuk pgsql
DB_DATABASE=pasanku
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
```

> **Aturan Keamanan:** File `.env` wajib terdaftar di `.gitignore` dan tidak boleh diunggah ke GitHub.

---

## 6. Strategi Deployment Produksi

Langkah standar saat mendeploy ke **VPS (Nginx + PHP-FPM)**, **Shared Hosting**, atau **Laravel Cloud**:
1. Tarik kode terbaru dari branch `main` di GitHub.
2. Instal dependensi PHP produksi: `composer install --no-dev --optimize-autoloader`.
3. Instal dependensi & kompilasi bundle React + Tailwind CSS v4: `npm ci && npm run build`.
4. Jalankan migrasi database: `php artisan migrate --force`.
5. Jalankan seeder awal (hanya sekali saat inisialisasi): `php artisan db:seed`.
6. Tautkan folder storage publik: `php artisan storage:link`.
7. Optimalkan cache aplikasi: `php artisan optimize`.
8. Pastikan hak akses folder `storage/` dan `bootstrap/cache/` dapat ditulis oleh web server, serta aktifkan sertifikat SSL (HTTPS).
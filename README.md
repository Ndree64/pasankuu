<p align="center">
  <img src="public/images/pasanku_logo_full.png" alt="Logo PASANKU" width="260" />
</p>

# PASANKU

**PASANKU** adalah aplikasi web pembelajaran **Bahasa Pasan** (Ratahan, Minahasa Tenggara) berbasis *microlearning*, evaluasi unit, sistem rekomendasi remedial adaptif berbasis aturan, gamifikasi (XP, level, lencana, papan skor), serta alur validasi konten oleh penutur/ahli bahasa.

> *"Bahasa kita, warisan kita."*

---

## Fitur Utama & Peran Pengguna

Aplikasi ini dibangun sebagai **Modern Monolith** dengan 3 peran (`admin`, `validator`, `learner`) dan **Mode Pratinjau (`/preview`)** *stateless*:

- **Learner (`/learner`):**
  - Jalur belajar zig-zag 5 Unit dan 25 Lesson berurutan (*Learning Path*).
  - Pembelajaran fokus (*FocusLayout*) berisi materi singkat, kosakata, contoh kalimat, serta **4 jenis soal terstruktur** (`mc_pasan_to_id`, `mc_id_to_pasan`, `matching` dengan penilaian parsial, `fill_blank`).
  - **Quiz Unit (15 sampai 20 soal)** dengan ambang kelulusan `75` dan pembukaan otomatis unit berikutnya.
  - **Rekomendasi Remedial Adaptif:** apabila gagal quiz (`< 75`), sistem mengelompokkan kesalahan berdasarkan `primary_lesson_id`, mengurutkan (`error_count DESC`, `order_number ASC`), dan membuat maksimal 3 tugas remedial terpisah sebelum quiz dapat diulang.
  - **Gamifikasi & Fitur Pendukung:** `+10 XP` lesson reguler, `+5 XP` remedial, `+25 XP` quiz unit (anti-duplikasi), 5 tier Level, 5 Lencana (`Badge`), Kamus Bahasa Pasan *real-time* (`/learner/kamus`), Papan Skor (`/learner/papan-skor`), dan Profil (`/learner/profil`).
- **Validator (`/validator`):**
  - Memeriksa antrean pengajuan lesson dan quiz (`pending_review`), memeriksa materi, kosakata, soal, serta kunci jawaban.
  - Menyetujui konten (`approved`) atau meminta revisi (`changes_requested`) dengan catatan wajib. Validator tidak dapat menerbitkan konten secara langsung.
  - Mengakses riwayat validasi (`/validator/riwayat`) dan kamus referensi (`/validator/kamus`).
- **Admin (`/admin`):**
  - Mengelola 5 Unit, 25 Lesson (*Lesson Builder* dengan urutan aktivitas fleksibel dan penguncian otomatis saat `pending_review`), serta Quiz Unit (15 sampai 20 soal + pemetaan `primary_lesson_id`).
  - Mengajukan konten ke Validator, menerbitkan konten berstatus `approved`, serta menaikkan `content_version` otomatis saat konten `published` diubah.
  - Mengelola akun Validator (`/admin/validators`) termasuk aktivasi dan penonaktifan (`is_active`).
- **Mode Pratinjau (`/preview`):**
  - Khusus `admin` dan `validator` untuk menguji lesson dan quiz secara *stateless* (filter `Semua Status` vs `Hanya Terbit`) tanpa menulis data ke tabel progres, percobaan, remedial, atau XP.

---

## Tumpukan Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Backend | Laravel 13 (`laravel/framework ^13.17`), PHP 8.3+ |
| Bridge SPA | Inertia.js (`inertiajs/inertia-laravel ^3.8`, `@inertiajs/react ^3.11`) |
| Frontend UI | React 19 (`.jsx`), Lucide React, Ziggy (`tightenco/ziggy ^2.7`) |
| Styling & Build | Tailwind CSS v4 (`@tailwindcss/vite`), Vite 8 (`@vitejs/plugin-react`) |
| Database | MySQL 8.0+ / Laragon (SQLite `:memory:` untuk test suite) |
| Pengujian | Pest 4 (`pestphp/pest ^4.7`, `pestphp/pest-plugin-laravel ^4.1`) |

---

## Panduan Menjalankan Lokal (Laragon + MySQL)

### 1. Prasyarat
- **PHP** 8.2+ / 8.3+ (ekstensi `pdo_mysql`, `pdo_sqlite`, `gd`, `mbstring`, `openssl`)
- **Composer** 2.x
- **Node.js** 20 LTS+ & **NPM**
- **MySQL** 8.0+ (via Laragon atau sejenisnya)

### 2. Instalasi Langkah demi Langkah

```powershell
git clone https://github.com/Ndree64/pasankuu.git pasanku
cd pasanku

composer install
npm install

copy .env.example .env
php artisan key:generate
```

Buat database MySQL bernama `pasanku`, pastikan pengaturan database di `.env` sudah sesuai (contoh default Laragon):

```env
APP_NAME="Pasanku"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pasanku
DB_USERNAME=root
DB_PASSWORD=
SESSION_DRIVER=database
```

Lalu jalankan migrasi, seeder awal, dan kompilasi aset frontend:

```powershell
php artisan migrate --seed
npm run build
```

Jalankan server pengembangan lokal:

```powershell
php artisan serve
# dan di terminal terpisah jika ingin hot-reload frontend:
npm run dev
```

Akses aplikasi di `http://127.0.0.1:8000`.

---

## Akun Awal Seeder

Seeder `InitialAdminSeeder`, `InitialCurriculumSeeder`, dan `BadgeSeeder` membuat akun serta kerangka awal kurikulum (5 Unit `published`, 25 shell Lesson `draft`, 5 shell Quiz `draft` tanpa materi kosakata awal, dan 5 Badge):

| Peran | Login (Username / Email) | Kata Sandi | Rute Awal |
| --- | --- | --- | --- |
| **Admin** | `admin` *(username)* | `password123` | `/admin` |
| **Validator** | `validator` *(username)* | `password123` | `/validator` |
| **Learner** | Daftar mandiri lewat `/register` *(email)* | *(pilihan pengguna)* | `/learner` |

---

## Pengujian Otomatis

Seluruh Unit Test dan Feature Test berjalan di atas database SQLite `:memory:` (dikonfigurasi di [phpunit.xml](phpunit.xml)):

```powershell
php artisan test
```

Cakupan pengujian meliputi:
- Unit Test (`tests/Unit/`): `ScoringServiceTest`, `RecommendationServiceTest`, `GamificationServiceTest`.
- Feature Test (`tests/Feature/`): `FoundationSmokeTest`, `AuthAndRbacTest`, `AdminContentManagementTest`, `ContentValidationAndPreviewTest`, `LessonLearningAndSecurityTest`, `QuizAndRemedialTest`, `GamificationAndLearnerPagesTest`.

---

## Aturan Keamanan Inti

1. **Kunci Jawaban Terisolasi di Server:** Tabel `lesson_question_answer_keys` dan `quiz_question_answer_keys` tidak pernah dimuat atau dikirim ke *props* Inertia sisi Learner; seluruh pemeriksaan jawaban dijalankan di `ScoringService`.
2. **Transaksi Atomik:** Penyelesaian lesson, quiz, pembukaan unit, pencatatan remedial, pemberian XP, dan pemicu lencana dibungkus dalam `DB::transaction()`.
3. **RBAC Berlapis:** Seluruh rute dilindungi middleware `EnsureUserHasRole` (termasuk cek `profiles.is_active`), `Policy`, serta `FormRequest`.

---

## Daftar Dokumentasi Proyek

| Dokumen | Deskripsi |
| --- | --- |
| [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) | Dokumentasi teknis lengkap & pohon struktur file proyek secara rinci |
| [docs/PRD.md](docs/PRD.md) | Spesifikasi kebutuhan produk dan aturan domain |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur modern monolith, lapisan service, RBAC, dan transaksi DB |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | ERD, spesifikasi 26 tabel domain, dan kontrak JSON soal |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Daftar rute web Inertia, payload form, props, dan kontrak service |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Daftar pustaka, versi, dan konfigurasi environment |
| [docs/USER_FLOW.md](docs/USER_FLOW.md) | Diagram alur pengguna untuk Learner, Validator, Admin, dan Pratinjau |
| [docs/DESIGN.md](docs/DESIGN.md) | Token visual `@theme`, tipografi, efek taktil 3D, dan tata letak responsif |
| [docs/TASK.md](docs/TASK.md) | Peta jalan pengembangan bertahap (Tahap 1 hingga Tahap 10) |
| [docs/ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) | Kriteria penerimaan (*Definition of Done*) per modul |
| [AGENTS.md](AGENTS.md) | Aturan kerja dan pedoman pengembangan untuk agent di repositori ini |

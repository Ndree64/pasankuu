# Dokumentasi Teknis & Struktur File Lengkap — PASANKU

Dokumen ini merupakan referensi menyeluruh mengenai arsitektur implementasi, lapisan kode, skema database, layanan bisnis, pengujian, serta peta struktur setiap berkas pada repositori **PASANKU** (Laravel 13 + Inertia.js + React 19 JSX + Tailwind CSS v4 + MySQL).

---

## 1. Ringkasan Arsitektur Implementasi

PASANKU menggunakan pola **Modern Monolith** di mana Laravel menangani routing web, autentikasi sesi, RBAC, validasi input, logika bisnis, serta transaksi database, sementara React (JSX) merender seluruh antarmuka melalui adapter Inertia.js tanpa API REST terpisah.

```text
Browser (React 19 + Inertia Client + Tailwind CSS v4)
   │  HTTP + CSRF + Session Cookie (via routes/web.php & Ziggy route())
   ▼
Middleware (HandleInertiaRequests, EnsureUserHasRole)
   │
   ▼
Thin Controllers & FormRequests (app/Http/Controllers/ & Requests/)
   │  Memvalidasi input + memanggil Service Layer
   ▼
Business Logic Services (app/Services/ dalam DB::transaction())
   │
   ▼
Eloquent Models & PHP Enums (app/Models/ & app/Enums/)
   │
   ▼
MySQL 8.0+ (Produksi/Laragon) / SQLite :memory: (Pest Tests)
```

---

## 2. Struktur File Lengkap & Deskripsi Peran

Berikut adalah pohon lengkap seluruh file yang dilacak di repositori beserta fungsinya masing-masing.

### 2.1 Root Proyek

```text
pasanku/
├── .editorconfig           # Konsistensi indentasi dan line-ending editor
├── .env.example            # Template konfigurasi environment (default MySQL Laragon & session DB)
├── .gitattributes          # Aturan line-ending Git lintas OS
├── .gitignore              # Mengecualikan .env, vendor/, node_modules/, public/build/, logs
├── .npmrc                  # Konfigurasi NPM proyek
├── AGENTS.md               # Aturan wajib agent (alur kerja, skill ponytail & antislop, 12 aturan domain)
├── README.md               # Pengantar proyek, fitur, panduan instalasi Laragon, dan akun demo
├── artisan                 # Entry point CLI Artisan Laravel
├── composer.json           # Dependensi PHP (Laravel 13, Inertia Laravel 3, Ziggy 2, Pest 4)
├── composer.lock           # Pengunci versi paket PHP
├── package.json            # Dependensi Frontend (React 19, Inertia React, Lucide, Tailwind v4, Vite 8)
├── package-lock.json       # Pengunci versi paket NPM
├── phpunit.xml             # Konfigurasi runner tes (SQLite :memory:, array session/cache, bcrypt 4)
└── vite.config.js          # Konfigurasi Vite + laravel-vite-plugin + @vitejs/plugin-react + Tailwind v4
```

### 2.2 Direktori `app/`

#### A. `app/Enums/` (8 Backed String Enums)

```text
app/Enums/
├── ActivityType.php        # Jenis aktivitas dalam lesson: 'material', 'exercise'
├── AttemptStatus.php       # Status percobaan lesson & quiz: 'in_progress', 'passed', 'failed'
├── ContentStatus.php       # Siklus hidup konten: 'draft', 'pending_review', 'changes_requested', 'approved', 'published'
├── QuestionType.php        # 4 tipe soal terstruktur: 'mc_pasan_to_id', 'mc_id_to_pasan', 'matching', 'fill_blank'
├── RemedialStatus.php      # Status tugas remedial: 'pending', 'in_progress', 'completed'
├── ReviewStatus.php        # Status keputusan validasi: 'pending', 'approved', 'changes_requested'
├── UserRole.php            # Peran RBAC: 'admin', 'validator', 'learner'
└── XpActivityType.php      # Sumber transaksi XP: 'lesson', 'remedial', 'quiz'
```

#### B. `app/Http/` (Controllers, Middleware, Requests)

```text
app/Http/
├── Controllers/
│   ├── Controller.php                          # Base controller Laravel
│   ├── WelcomeController.php                   # Halaman publik Landing (/)
│   ├── PreviewController.php                   # Mode Pratinjau stateless (/preview, /preview/lessons/{lesson}, /preview/quizzes/{unit})
│   ├── Auth/
│   │   ├── LoginController.php                 # Form login, rate-limiting, cek is_active, redirect per peran
│   │   ├── LogoutController.php                # Logout, invalidasi sesi, regenerasi CSRF token
│   │   └── RegisterController.php              # Registrasi publik (selalu role=learner + buka Unit 1 di unit_unlocks)
│   ├── Admin/
│   │   ├── DashboardController.php             # Ringkasan pipeline 4+1 status konten, tindakan prioritas, statistik
│   │   ├── UnitController.php                  # Daftar 5 Unit & 25 Lesson, tambah lesson draf baru
│   │   ├── LessonBuilderController.php         # CRUD identitas lesson, aktivitas, materi, kosakata, contoh, 4 tipe soal, reorder, submit/cancel/publish
│   │   ├── QuizController.php                  # Pengelolaan soal Quiz Unit (15-20 soal + primary_lesson_id), ajukan & terbitkan
│   │   └── ValidatorManagementController.php   # Daftar Validator, buat akun Validator baru, toggle is_active
│   ├── Validator/
│   │   ├── ReviewQueueController.php           # Antrean review + ringkasan hitungan status + filter tab
│   │   ├── ReviewDetailController.php          # Paket pemeriksaan detail (materi, kosakata, soal & answer_key), approve/request-changes
│   │   ├── ReviewHistoryController.php         # Riwayat keputusan validasi oleh Validator
│   │   └── ReferenceDictionaryController.php   # Kamus referensi lengkap (termasuk draft & pending_review)
│   └── Learner/
│       ├── LearningPathController.php          # Jalur belajar 5 Unit, status node, dan kartu remedial aktif
│       ├── LessonController.php                # Pemutar Lesson reguler/remedial (proyeksi kolom tanpa answerKey)
│       ├── QuizController.php                  # Pemutar Quiz Unit dengan gate kelulusan 5 lesson & remedial
│       ├── DictionaryController.php            # Kamus real-time khusus kosakata berstatus approved
│       ├── LeaderboardController.php           # Podium top 3 dan peringkat XP seluruh Learner
│       └── ProfileController.php               # Profil, tier level, lencana, riwayat quiz, dan riwayat XP
├── Middleware/
│   ├── EnsureUserHasRole.php                   # Middleware 'role': cek auth, cek profiles.is_active, blokir 403 lintas peran
│   └── HandleInertiaRequests.php               # Shared props global (auth.user + total_xp + flash messages/results)
└── Requests/
    └── Auth/
        ├── LoginRequest.php                    # Validasi email, password, remember
        └── RegisterRequest.php                 # Validasi full_name, email unik, password confirmed min 8
```

#### C. `app/Models/` (26 Eloquent Models UUID)

```text
app/Models/
├── User.php                        # Autentikasi Laravel (UUID PK, relasi 1-to-1 ke Profile)
├── Profile.php                     # Identitas aplikasi, role (UserRole), is_active, relasi progres/XP/badge
├── Unit.php                        # 5 Unit kurikulum (order_number 1-5)
├── Lesson.php                      # Lesson per unit beserta content_version dan ContentStatus
├── LessonActivity.php              # Urutan aktivitas ('material' atau 'exercise') dalam Lesson
├── LessonMaterial.php              # Konten materi singkat, penjelasan, dan estimasi durasi
├── Vocabulary.php                  # Kosakata Bahasa Pasan, arti Indonesia, kategori, status validasi
├── MaterialVocabulary.php          # Pivot terurut antara LessonMaterial dan Vocabulary
├── MaterialExample.php             # Contoh kalimat Bahasa Pasan beserta terjemahan pada materi
├── LessonQuestion.php              # Soal latihan lesson (QuestionType + question_data JSON, tanpa kunci)
├── LessonQuestionAnswerKey.php     # Kunci jawaban soal lesson terpisah (PK question_id, hanya untuk server/admin/validator)
├── UnitQuiz.php                    # Entitas Quiz per unit (passing_score default 75.00, content_version)
├── QuizQuestion.php                # Soal quiz dengan relasi wajib primary_lesson_id
├── QuizQuestionAnswerKey.php       # Kunci jawaban soal quiz terpisah (PK question_id)
├── ContentReview.php               # Log pengajuan dan keputusan validasi Lesson atau UnitQuiz
├── UnitUnlock.php                  # Catatan unit yang terbuka bagi Learner (unique user_id + unit_id)
├── LearnerLessonProgress.php       # Status kelulusan reguler per lesson & versi konten terbaik
├── LessonActivityProgress.php      # Pelacakan selesai per aktivitas (terpisah 'regular' vs 'remedial')
├── LessonAttempt.php               # Riwayat percobaan lesson ('regular' atau 'remedial', skor, status)
├── LessonResponse.php              # Jawaban Learner per soal latihan beserta is_correct & earned_points
├── QuizAttempt.php                 # Riwayat percobaan Quiz Unit
├── QuizResponse.php                # Jawaban Learner per soal quiz
├── RemedialAssignment.php          # Rekomendasi remedial hasil Quiz gagal (maks 3 per percobaan gagal)
├── XpTransaction.php               # Buku besar XP anti-duplikasi (unique user_id, activity_type, reference_id)
├── Badge.php                       # Master definisi 5 lencana pencapaian
└── UserBadge.php                   # Lencana yang diraih Learner (unique user_id + badge_id)
```

#### D. `app/Policies/`, `app/Providers/`, dan `app/Services/`

```text
app/
├── Policies/
│   ├── LessonPolicy.php                # Otorisasi kelola Lesson (Admin) & pratinjau (Admin/Validator)
│   ├── QuizPolicy.php                  # Otorisasi kelola Quiz (Admin) & pratinjau (Admin/Validator)
│   ├── ReviewPolicy.php                # Otorisasi review konten (Validator aktif)
│   └── ValidatorPolicy.php             # Otorisasi kelola akun Validator (Admin)
├── Providers/
│   └── AppServiceProvider.php          # Service provider aplikasi
└── Services/
    ├── AccessControlService.php        # Aturan pembukaan unit, urutan lesson berurutan, dan izin mulai Quiz Unit
    ├── ContentValidationService.php    # Siklus status konten, lock pending_review, bump content_version, validasi 15-20 soal quiz
    ├── GamificationService.php         # Award XP sekali pakai (+10/+5/+25), kalkulasi 5 tier Level, pemberian Badge idempoten
    ├── LearningService.php             # Start/resume attempt reguler & remedial, simpan progres aktivitas, finishAttempt atomik
    ├── QuizService.php                 # Start/resume quiz, validasi seluruh soal terjawab, submit atomik + buka unit baru / panggil remedial
    ├── RecommendationService.php       # Pengelompokan error quiz per primary_lesson_id, urut error_count DESC lalu order_number ASC, maks 3
    └── ScoringService.php              # Penilaian murni 4 tipe soal (termasuk skor parsial matching) & kalkulasi persentase
```

### 2.3 Direktori `bootstrap/`, `config/`, `routes/`, dan `database/`

```text
bootstrap/
├── app.php                 # Registrasi web middleware HandleInertiaRequests & alias middleware 'role'
├── providers.php           # Daftar service provider
└── cache/.gitignore        # Direktori cache manifest paket Laravel

config/
├── app.php                 # Nama aplikasi, timezone, locale
├── auth.php                # Guard session & provider Eloquent User
├── cache.php               # Konfigurasi store cache
├── database.php            # Koneksi MySQL, PostgreSQL, SQLite
├── filesystems.php         # Konfigurasi disk penyimpanan lokal/cloud
├── logging.php             # Kanal log aplikasi
├── mail.php                # Konfigurasi mailer
├── queue.php               # Konfigurasi antrean job
└── services.php            # Konfigurasi layanan eksternal

routes/
├── web.php                 # Seluruh rute aplikasi (Publik, Auth, Learner, Validator, Admin, Preview) + middleware RBAC
└── console.php             # Definisi perintah console Artisan

database/
├── .gitignore
├── factories/
│   └── UserFactory.php     # Factory User UUID (email, password, remember_token)
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php                        # Tabel users (UUID PK), password_reset_tokens, sessions (UUID FK)
│   ├── 0001_01_01_000001_create_cache_table.php                        # Tabel cache & cache_locks
│   ├── 0001_01_01_000002_create_jobs_table.php                         # Tabel jobs, job_batches, failed_jobs
│   ├── 2026_01_01_000001_create_profiles_table.php                     # Tabel profiles (peran RBAC & is_active)
│   ├── 2026_01_01_000002_create_curriculum_tables.php                  # Tabel units, lessons, lesson_activities, lesson_materials, vocabularies, material_vocabularies, material_examples
│   ├── 2026_01_01_000003_create_questions_and_quizzes_tables.php       # Tabel lesson_questions, lesson_question_answer_keys, unit_quizzes, quiz_questions, quiz_question_answer_keys, content_reviews
│   ├── 2026_01_01_000004_create_learning_and_gamification_tables.php   # Tabel unit_unlocks, learner_lesson_progress, quiz_attempts, quiz_responses, remedial_assignments, lesson_activity_progress, lesson_attempts, lesson_responses, xp_transactions, badges, user_badges
│   └── 2026_01_02_000001_add_username_to_users_table.php               # Tambah kolom username unik & ubah email nullable pada tabel users
└── seeders/
    ├── DatabaseSeeder.php              # Pemanggil utama InitialAdminSeeder, InitialCurriculumSeeder, BadgeSeeder
    ├── InitialAdminSeeder.php          # Membuat akun admin (username: admin) & validator (username: validator)
    ├── InitialCurriculumSeeder.php     # Membuat 5 Unit (published), 25 shell Lesson (draft), 5 shell UnitQuiz (draft)
    └── BadgeSeeder.php                 # Mengisi 5 lencana pencapaian (first_lesson s.d. curriculum_master)
```

### 2.4 Direktori `public/` dan `resources/`

```text
public/
├── .htaccess                           # Aturan rewrite Apache
├── favicon.ico                         # Ikon tab browser bawaan
├── index.php                           # Front controller HTTP Laravel
├── robots.txt                          # Konfigurasi crawler
└── images/
    ├── pasanku_app_icon.png            # Ikon aplikasi 306x311 (transparan di sudut luar)
    ├── pasanku_logo_cream.png          # Logo + maskot 630x593 berlatar #FFF9F0 (Landing/Auth)
    └── pasanku_logo_full.png           # Logo + maskot 630x593 berlatar putih #FFFFFF

resources/
├── css/
│   └── app.css                         # Token @theme Tailwind v4, utilitas .tactile-*, slideUpFeedback, prefers-reduced-motion, base cursor & focus ring
├── views/
│   ├── app.blade.php                   # Root HTML tunggal Inertia (@routes, @viteReactRefresh, @vite, @inertiaHead, @inertia)
│   └── welcome.blade.php               # Sisa template bawaan instalasi Laravel
└── js/
    ├── app.js                          # Sisa entrypoint bawaan instalasi Laravel
    ├── app.jsx                         # Entrypoint React + Inertia createInertiaApp
    ├── Layouts/
    │   ├── GuestLayout.jsx             # Layout halaman publik & autentikasi
    │   ├── AppLayout.jsx               # Layout utama responsif per peran (Mobile 4-tab bottom nav, Tablet sidebar, Desktop sidebar + rightRail, banner preview)
    │   └── FocusLayout.jsx             # Kanvas fokus maks 960px tanpa nav global untuk Lesson & Quiz
    ├── Components/
    │   ├── UI/
    │   │   ├── EmptyState.jsx          # Komponen state data kosong dengan ikon maskot
    │   │   ├── ErrorState.jsx          # Komponen state galat berbingkai brand
    │   │   ├── PageSkeleton.jsx        # Komponen skeleton loading berbasis surface-soft
    │   │   ├── ProgressBar.jsx         # Progress bar aksesibel (aria-valuenow)
    │   │   ├── QuestionSummary.jsx     # Ringkasan terformat 4 tipe soal & kunci jawaban (Admin/Validator)
    │   │   ├── StatusBadge.jsx         # Lencana status (selalu ikon + teks, tidak warna saja)
    │   │   ├── TactileButton.jsx       # Tombol 3D taktil (brand, accent, success, neutral) dengan dukungan href/button
    │   │   └── WovenDivider.jsx        # Motif pemisah 3 belah ketupat tenun Pasan
    │   ├── Admin/
    │   │   └── QuestionEditor.jsx      # Form builder bersama untuk 4 tipe soal + kunci jawaban (LessonBuilder & Quizzes)
    │   └── Questions/
    │       ├── FillBlank.jsx           # Komponen interaktif soal melengkapi kalimat rumpang
    │       ├── MatchingPairs.jsx       # Komponen interaktif mencocokkan pasangan kiri-kanan dengan penomoran pasangan
    │       └── MultipleChoice.jsx      # Komponen interaktif pilihan ganda (dipakai mc_pasan_to_id & mc_id_to_pasan)
    └── Pages/
        ├── Welcome.jsx                 # Landing page terpusat dengan maskot, tagline, CTA adaptif, dan 3 kartu nilai
        ├── Auth/
        │   ├── Login.jsx               # Halaman masuk 2 kolom desktop / 1 kolom mobile
        │   └── Register.jsx            # Halaman daftar Learner mandiri
        ├── Admin/
        │   ├── Dashboard.jsx           # Pipeline status konten, tindakan prioritas, ringkasan aktivitas
        │   ├── Units.jsx               # Daftar 5 Unit & 25 Lesson, tambah draf, ajukan validasi, terbitkan
        │   ├── LessonBuilder.jsx       # Editor materi, kosakata, contoh, 4 tipe soal, dan pengurutan aktivitas
        │   ├── Quizzes.jsx             # Pengelola Quiz Unit 15-20 soal dengan pemetaan primary_lesson_id
        │   └── Validators.jsx          # Manajemen akun Validator (tambah & toggle aktif/nonaktif)
        ├── Validator/
        │   ├── ReviewQueue.jsx         # Antrean konten menunggu validasi beserta filter status
        │   ├── ReviewDetail.jsx        # Pemeriksaan paket materi & kunci jawaban + tombol Setujui / Minta Revisi
        │   ├── ReviewHistory.jsx       # Riwayat keputusan validasi
        │   └── ReferenceDictionary.jsx # Kamus referensi seluruh kosakata lintas status
        ├── Preview/
        │   ├── PreviewPath.jsx         # Jalur pratinjau stateless dengan filter Semua Status vs Hanya Terbit
        │   ├── PreviewLesson.jsx       # Simulasi pengerjaan Lesson tanpa simpan DB
        │   └── PreviewQuiz.jsx         # Simulasi Quiz Unit + simulasi rekomendasi remedial di memori
        └── Learner/
            ├── LearningPath.jsx        # Jalur belajar zig-zag 5 Unit, node status, kartu remedial, rail kanan XP/Level
            ├── LessonPlayer.jsx        # Pemutar Lesson (mode reguler & remedial) + umpan balik & hasil
            ├── QuizPlayer.jsx          # Pemutar Quiz Unit 15-20 soal + hasil & rekomendasi remedial
            ├── Dictionary.jsx          # Kamus real-time (debounced Inertia visit) khusus kosakata approved
            ├── Leaderboard.jsx         # Podium 3 teratas dan peringkat Total XP
            └── Profile.jsx             # Profil, level XP, lencana, riwayat quiz, riwayat XP, dan logout
```

### 2.5 Direktori `docs/`, `storage/`, dan `tests/`

```text
docs/
├── ACCEPTANCE_CRITERIA.md      # Definition of Done per modul
├── API_DOCUMENTATION.md        # Kontrak rute, Inertia props, payload 4 tipe soal, dan method Service
├── ARCHITECTURE.md             # Arsitektur modern monolith, RBAC, dan transaksi DB
├── DATABASE_SCHEMA.md          # ERD & spesifikasi kolom seluruh tabel
├── DESIGN.md                   # Token warna, tipografi, ukuran kontrol, dan pola komponen
├── PRD.md                      # Kebutuhan produk & struktur kurikulum
├── PROJECT_DOCUMENTATION.md    # Dokumen ini (peta teknis & struktur file lengkap)
├── TASK.md                     # Checklist progres pengembangan Tahap 1 s.d. Tahap 10
├── TECH_STACK.md               # Daftar versi teknologi & panduan deployment
└── USER_FLOW.md                # Diagram alur pengguna lintas peran

storage/                        # Direktori runtime Laravel (app/, framework/{cache,sessions,testing,views}, logs/)

tests/
├── Pest.php                    # Konfigurasi Pest (RefreshDatabase untuk tests/Feature)
├── TestCase.php                # Base TestCase PHPUnit
├── Unit/
│   ├── ExampleTest.php                         # Smoke test unit bawaan
│   ├── GamificationServiceTest.php             # Uji anti-duplikasi XP, tier level, dan badge idempoten
│   ├── RecommendationServiceTest.php           # Uji pengelompokan error, tie-breaker order_number, batas maks 3
│   └── ScoringServiceTest.php                  # Uji penilaian 4 tipe soal termasuk skor parsial matching
└── Feature/
    ├── AdminContentManagementTest.php          # Uji CRUD builder, reorder, bump content_version, validasi 15-20 soal quiz, akun validator
    ├── AuthAndRbacTest.php                     # Uji halaman auth, registrasi learner+Unit 1, anti-eskalasi role, blokir 403, is_active
    ├── ContentValidationAndPreviewTest.php     # Uji siklus draft->pending_review->changes_requested->approved->published & preview stateless
    ├── ExampleTest.php                         # Uji HTTP GET /
    ├── FoundationSmokeTest.php                 # Uji migrasi & seeder awal
    ├── GamificationAndLearnerPagesTest.php     # Uji kamus approved-only, leaderboard, dan profil Inertia props
    ├── LessonLearningAndSecurityTest.php       # Uji kelulusan >=75, ulangi latihan, XP sekali pakai, dan audit anti-bocor answer_key
    └── QuizAndRemedialTest.php                 # Uji gate 5 lesson, quiz gagal->3 remedial, pemblokiran ulang quiz, dan buka unit baru
```

---

## 3. Ringkasan Kontrak Transaksi & Keamanan

| Operasi | Method Service | Jaminan Atomik & Aturan |
| --- | --- | --- |
| Registrasi Learner | `Auth\RegisterController::store` | `DB::transaction()`: buat `users`, `profiles` (`role=learner`), dan buka Unit 1 di `unit_unlocks`. |
| Penyelesaian Lesson | `LearningService::finishAttempt` | `DB::transaction()`: cek semua materi wajib & soal terjawab, hitung skor, update `learner_lesson_progress` atau `remedial_assignments`, catat XP (`+10` / `+5`), cek badge. |
| Pengiriman Quiz Unit | `QuizService::submitAttempt` | `DB::transaction()`: validasi semua soal terjawab, nilai skor; jika `>= 75` buka Unit berikutnya + `+25 XP`; jika `< 75` panggil `RecommendationService`. |
| Pengeditan Konten Terbit | `ContentValidationService::bumpVersionIfPublished` | `DB::transaction()`: naikkan `content_version` (+1) dan kembalikan status ke `draft`. |
| Mode Pratinjau | `PreviewController::evaluateLesson` / `evaluateQuiz` | Evaluasi murni di memori melalui `ScoringService` tanpa menulis ke tabel progres/attempt/remedial/XP. |

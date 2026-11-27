# TASK.md — Development Roadmap Pasanku

Roadmap pengembangan aplikasi **PASANKU** menggunakan pendekatan **Incremental Development** pada stack **Laravel + Inertia.js + React.js (JSX) + Tailwind CSS v4 + MySQL/PostgreSQL**. Setiap tahap wajib diuji sebelum melanjutkan ke tahap berikutnya.

---

## Tahap 1: Foundation, Design System, & Database Migrations
- [x] Inisialisasi proyek Laravel + Inertia.js + React (JSX) + Ziggy + Tailwind CSS v4 (`@tailwindcss/vite`) + `lucide-react`.
- [ ] Konfigurasi koneksi database MySQL/PostgreSQL di `.env` dan inisialisasi repositori GitHub. *(Catatan: `.env.example` sudah disetel ke MySQL Laragon dan repo Git lokal sudah diinisialisasi; `.env` lokal serta remote GitHub menunggu pengisian manual user.)*
- [x] Salin aset maskot (`pasanku_logo_cream.png`, `pasanku_logo_full.png`, `pasanku_app_icon.png`) ke `public/images/`.
- [x] Implementasi `resources/css/app.css` sesuai `DESIGN.md`: blok `@theme`, warna terang hangat, efek tombol taktil 3D (`tactile-*`), animasi `slideUpFeedback`, dan `prefers-reduced-motion`.
- [x] Buat komponen UI dasar di `resources/js/Components/UI/`: `<TactileButton />`, `<WovenDivider />`, `<ProgressBar />`, `<PageSkeleton />`, `<EmptyState />`, `<ErrorState />`.
- [x] Buat 3 layout dasar di `resources/js/Layouts/`: `GuestLayout.jsx`, `AppLayout.jsx` (Mobile 4-tab bottom nav, Tablet sidebar, Desktop sidebar + rail), dan `FocusLayout.jsx`.
- [x] Buat seluruh Laravel Migrations untuk 25 tabel sesuai `DATABASE_SCHEMA.md` (termasuk `ENUM` 4 tipe soal, *foreign keys*, dan *unique constraints*).
- [x] Buat Enum PHP (`UserRole`, `ContentStatus`, `ActivityType`, `QuestionType` untuk 4 jenis soal) dan seluruh Eloquent Models beserta relasinya.
- [x] Buat Seeder awal: `InitialAdminSeeder`, `InitialCurriculumSeeder` (5 Unit dasar), dan `BadgeSeeder`.

---

## Tahap 2: Autentikasi, Profil, & RBAC
- [x] Konfigurasi `HandleInertiaRequests` untuk membagikan shared props (`auth.user`, `role`, `total_xp`, `flash`).
- [x] Implementasi middleware `EnsureUserHasRole` (termasuk pemeriksaan `profiles.is_active == true`) dan `Policies`.
- [x] Bangun halaman `Welcome.jsx` (`/`), `Auth/Login.jsx` (`/login`), dan `Auth/Register.jsx` (`/register`) sesuai `DESIGN.md`.
- [x] Implementasi `RegisterController`: penetapan `role = 'learner'` di sisi server dan otomatis membuka Unit 1 di `unit_unlocks`.
- [x] Implementasi `LoginController` (dengan *rate limiting* & redirect berdasarkan peran) serta `LogoutController`.
- [x] Tulis Feature Tests (Pest/PHPUnit + `assertInertia`) untuk registrasi, login lintas peran, pencegahan eskalasi peran, dan blokir akses `403`.

---

## Tahap 3: Manajemen Konten & Akun Validator (Panel Admin)
- [x] Bangun `Admin/Dashboard.jsx` (`/admin`): pipeline 4 status konten, aksi cepat, tindakan prioritas, dan ringkasan progres Learner.
- [x] Bangun `Admin/Units.jsx` (`/admin/units`): daftar 5 unit, 25 lesson, tambah lesson draf, tombol ajukan validasi, dan tombol terbitkan (khusus `approved`).
- [x] Bangun `Admin/LessonBuilder.jsx` (`/admin/lessons/{lesson}`):
  - Tab `Edit Materi & Soal` (identitas lesson, materi, kosakata, contoh kalimat, serta form 4 jenis soal: `mc_pasan_to_id`, `mc_id_to_pasan`, `matching`, `fill_blank` + kunci jawaban).
  - Tab `Urutan Aktivitas` (tambah `material`/`exercise` dan tombol `Naik`/`Turun` lewat `PATCH /reorder`).
  - Penguncian form ketika status `pending_review`.
- [x] Implementasi `ContentValidationService::bumpVersionIfPublished()` agar edit konten terbit menaikkan `content_version` dan kembali ke `draft`.
- [x] Bangun `Admin/Quizzes.jsx` (`/admin/quizzes`): pemilih unit, validasi rentang **15–20 soal**, pemetaan wajib `primary_lesson_id`, 4 jenis soal + kunci jawaban.
- [x] Bangun `Admin/Validators.jsx` (`/admin/validators`): daftar Validator, tambah akun Validator, dan toggle aktif/nonaktif.

---

## Tahap 4: Validasi Konten (Panel Validator) & Mode Pratinjau
- [x] Bangun `Validator/ReviewQueue.jsx` (`/validator`): kartu ringkasan status dan filter tab antrean pengajuan.
- [x] Bangun `Validator/ReviewDetail.jsx` (`/validator/reviews/{type}/{id}`):
  - Info pembatasan peran (tidak bisa terbit langsung).
  - Tab `Materi & Kosakata` dan tab `Soal & Kunci Jawaban`.
  - Form `Catatan Validasi`, aksi `Setujui Konten` (`approved`), dan `Minta Revisi` (`changes_requested` dengan catatan wajib).
- [x] Bangun `Validator/ReviewHistory.jsx` (`/validator/riwayat`) dan `Validator/ReferenceDictionary.jsx` (`/validator/kamus`).
- [x] Bangun Mode Pratinjau (`/preview`, `/preview/lessons/{lesson}`, `/preview/quizzes/{unit}`):
  - Banner sticky amber `Mode Pratinjau: progres tidak disimpan` dan filter `Semua Status` vs `Hanya Terbit`.
  - Evaluasi *stateless* melalui `PreviewController` tanpa menulis ke tabel progres/percobaan/XP.
- [x] Tulis Feature Tests alur penuh `draft -> pending_review -> changes_requested -> approved -> published` dan isolasi Mode Pratinjau.

---

## Tahap 5: Modul Pembelajaran Lesson & 4 Komponen Soal Interaktif (Learner)
- [x] Implementasi `AccessControlService` (cek `unit_unlocks`, urutan lesson berurutan, dan validasi `content_version`).
- [x] Implementasi `ScoringService` untuk 4 jenis soal (`mc_pasan_to_id`, `mc_id_to_pasan`, `matching` dengan penilaian parsial, dan `fill_blank`) serta Unit Tests-nya.
- [x] Bangun komponen soal React di `resources/js/Components/Questions/`:
  - `MultipleChoice.jsx` (digunakan untuk `mc_pasan_to_id` dan `mc_id_to_pasan`).
  - `MatchingPairs.jsx` (tap kiri ke kanan dengan penomoran pasangan di state React).
  - `FillBlank.jsx` (melengkapi kalimat/ungkapan rumpang).
- [x] Bangun `Learner/LearningPath.jsx` (`/learner`): jalur zig-zag 5 unit, banner unit Crimson, 5 status node, dan rail kanan desktop.
- [x] Bangun `Learner/LessonPlayer.jsx` (`/learner/lessons/{lesson}`) dalam `FocusLayout`:
  - Penyajian materi singkat (`Sebelumnya`, `Tandai Selesai & Lanjut`).
  - Penyajian soal latihan + pengiriman jawaban ke server + umpan balik & pembahasan.
  - Panel hasil akhir (`slideUpFeedback`): skor `/ 100`, badge Lulus/Belum Lulus ($\ge 75$), tombol ulangi latihan tanpa batas.
- [x] Verifikasi keamanan: pastikan `answer_key` tidak pernah muncul pada props Inertia halaman Learner.

---

## Tahap 6: Modul Quiz Unit & Pembukaan Unit Berikutnya
- [x] Implementasi `QuizService`: validasi akses (5 lesson lulus & tidak ada remedial aktif), validasi seluruh 15–20 soal wajib terjawab, penilaian atomik via `DB::transaction()`.
- [x] Bangun `Learner/QuizPlayer.jsx` (`/learner/quizzes/{unit}`) dalam `FocusLayout` dengan indikator nomor soal dan konfirmasi sebelum submit.
- [x] Implementasi pembukaan unit berikutnya otomatis di `unit_unlocks` saat skor Quiz $\ge 75$ (dan pastikan unit terbuka tidak pernah terkunci kembali).
- [x] Tampilkan halaman hasil Quiz Unit beserta skor, status kelulusan, dan pembahasan soal.

---

## Tahap 7: Sistem Rekomendasi Adaptif & Remedial
- [x] Implementasi `RecommendationService`: kelompokkan jawaban quiz salah berdasarkan `primary_lesson_id`, urutkan (`error_count DESC`, `lesson.order_number ASC`), simpan maksimal 3 `remedial_assignments`.
- [x] Tulis Unit Tests untuk skenario seri (*tie-breaker*), kesalahan pada 1–2 lesson, dan kesalahan pada 4–5 lesson (dibatasi 3).
- [x] Tampilkan kartu Remedial (`--color-accent-tint`, border `--color-accent-border`) tepat di bawah node Quiz Unit gagal pada `Learner/LearningPath.jsx`.
- [x] Integrasikan mode remedial (`?mode=remedial&assignment={id}`) pada `LessonPlayer.jsx` dan `LearningService`: progres & percobaan tersimpan terpisah tanpa mengubah status lulus lesson reguler.
- [x] Pastikan server memblokir pengulangan Quiz Unit hingga seluruh remedial pada percobaan gagal terbaru berstatus `completed`.

---

## Tahap 8: Gamifikasi (XP, Level, Badge) & Fitur Pendukung Learner
- [x] Implementasi `GamificationService`: pemberian `+10 XP` (lesson reguler), `+5 XP` (remedial lesson), `+25 XP` (quiz unit) dengan pencegahan duplikasi (`UNIQUE(user_id, activity_type, reference_id)`).
- [x] Implementasi perhitungan Level berbasis akumulasi XP dan pemicu pemberian `user_badges`.
- [x] Bangun `Learner/Dictionary.jsx` (`/learner/kamus`): pencarian real-time (debounced Inertia visit) dan filter chip unit (`Semua`, `Unit 1`, `Unit 2`, `Unit 3`, `Unit 4-5`).
- [x] Bangun `Learner/Leaderboard.jsx` (`/learner/papan-skor`): podium 3 teratas dan daftar peringkat dengan sorotan `--color-surface-highlight`.
- [x] Bangun `Learner/Profile.jsx` (`/learner/profil`): kartu Level & progres XP, daftar Lencana, riwayat Quiz Unit, riwayat transaksi XP, dan tombol Keluar.

---

## Tahap 9: Integrasi, Pengujian Menyeluruh, & Audit UI
- [ ] Isi data awal konten tervalidasi untuk uji coba (minimal 1–5 unit sesuai kesiapan materi Bahasa Pasan). *(Catatan: sengaja dikosongkan dulu sesuai permintaan user agar struktur 5 unit & 25 lesson diisi lewat panel Admin.)*
- [x] Jalankan seluruh rangkaian automated test (`php artisan test`) untuk Unit Test dan Feature Test.
- [ ] Lakukan pengujian manual seluruh skenario di `ACCEPTANCE_CRITERIA.md` (termasuk audit Network/DOM untuk memastikan kunci jawaban tidak bocor). *(Catatan: audit otomatis `assertInertia` & HTML sudah lulus; klik manual di browser belum dilakukan.)*
- [ ] Audit tampilan responsif pada 3 rentang layar (Mobile $< 768\text{px}$, Tablet $768\text{--}1023\text{px}$, Desktop $\ge 1024\text{px}$) dan kontras WCAG AA. *(Catatan: token desain & kelas responsif sudah sesuai `DESIGN.md`; inspeksi visual langsung di browser belum dilakukan.)*

---

## Tahap 10: Deployment Produksi
- [ ] Siapkan server produksi (Shared Hosting / VPS Nginx+PHP-FPM / Laravel Cloud), database produksi, domain, dan SSL (HTTPS).
- [ ] Konfigurasi `.env` produksi (`APP_ENV=production`, `APP_DEBUG=false`).
- [ ] Jalankan build & deploy: `composer install --no-dev --optimize-autoloader`, `npm ci && npm run build`, `php artisan migrate --force`, `php artisan db:seed`, `php artisan storage:link`, dan `php artisan optimize`.
- [ ] Uji *smoke test* akhir di lingkungan produksi untuk ketiga peran (Admin, Validator, Learner) dan jadwalkan backup database berkala.
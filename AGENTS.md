# AGENTS.md — Pasanku

Aturan wajib untuk setiap agent yang bekerja di repo ini. **Baca seluruh file ini sebelum menulis kode, lalu ikuti urutan kerja di bagian 2.** Bahasa komunikasi dengan user: Bahasa Indonesia. Kode, nama class, dan nama kolom tetap Bahasa Inggris sesuai `docs/`.

## 1. Konteks Proyek

**PASANKU** adalah aplikasi web belajar Bahasa Pasan dengan tiga peran: `admin`, `validator`, `learner`, ditambah Mode Pratinjau `/preview` untuk admin dan validator. Aplikasi ini monolit modern **Laravel + Inertia.js + React.js (JSX) + Tailwind CSS v4 + MySQL (Laragon)**, diuji dengan Pest (`assertInertia`).

### Sumber kebenaran (baca yang relevan sebelum bekerja)

| Kebutuhan | Dokumen |
| --- | --- |
| Urutan kerja dan tahap | `docs/TASK.md` |
| Fitur dan aturan produk | `docs/PRD.md` |
| Struktur kode, service, RBAC, transaksi | `docs/ARCHITECTURE.md` |
| Tabel, kolom, constraint | `docs/DATABASE_SCHEMA.md` |
| Kontrak rute, Inertia props, payload soal | `docs/API_DOCUMENTATION.md` |
| Library dan versi | `docs/TECH_STACK.md` |
| Alur pengguna | `docs/USER_FLOW.md` |
| Tampilan, token, komponen | `docs/DESIGN.md` |
| Kriteria selesai | `docs/ACCEPTANCE_CRITERIA.md` |

Jika dokumen saling bertentangan atau sebuah dokumen tidak ada, **berhenti dan tanyakan ke user**. Jangan menebak.

## 2. Alur Kerja Wajib (urut, jangan dilompati)

1. **Orientasi.** Baca file ini, lalu tahap terkait di roadmap, lalu dokumen sumber kebenaran yang menyentuh tugas. Baca kode yang sudah ada sebelum mengubahnya.
2. **Nyatakan asumsi.** Tulis asumsi secara eksplisit. Jika ada beberapa tafsir, sajikan semuanya dan jangan memilih diam-diam. Jika ada yang tidak jelas, tanya.
3. **Desain.** Untuk fitur baru atau perubahan perilaku, gunakan skill `brainstorming`. Tugas yang sepenuhnya jelas dan kecil (typo, ganti warna) boleh langsung dikerjakan.
4. **Rencana.** Untuk pekerjaan multi-langkah, gunakan skill `writing-plans`. Setiap langkah harus punya cara verifikasi:
   ```
   1. [Langkah] → verifikasi: [pemeriksaan]
   2. [Langkah] → verifikasi: [pemeriksaan]
   ```
5. **Eksekusi.** Pakai `executing-plans` (satu sesi) atau `subagent-driven-development` (tugas independen). Gunakan skill yang cocok dari tabel bagian 3.
6. **Verifikasi.** Gunakan skill `verification-before-completion`. Jalankan perintah tes dan baca hasilnya sebelum menyatakan selesai. Jangan klaim berhasil tanpa bukti.
7. **Review.** Untuk fitur besar, gunakan `requesting-code-review` sebelum menutup tahap.
8. **Laporan.** Centang tugas di roadmap hanya setelah tes lulus. Laporkan singkat: apa yang berubah, apa yang diverifikasi, apa yang belum.

Roadmap dikerjakan **berurutan per tahap**. Jangan mulai tahap N+1 sebelum tahap N lulus tes.

## 3. Pilih Skill yang Cocok

| Situasi | Skill |
| --- | --- |
| Fitur baru, desain, perubahan perilaku | `brainstorming` → `writing-plans` |
| Menulis, mengubah, atau me-review kode apa pun | `ponytail` (level `full`): perubahan terkecil yang menyelesaikan tugas |
| Menulis fitur atau memperbaiki bug | `test-driven-development` (tes dulu, baru kode) |
| Bug, tes gagal, perilaku aneh | `systematic-debugging` (cari akar masalah sebelum memperbaiki) |
| Dua tugas atau lebih yang independen | `dispatching-parallel-agents` |
| Pekerjaan perlu isolasi di git | `using-git-worktrees` (setelah repo git ada) |
| Antarmuka (React JSX, Layout, CSS) | `antislop` + `antislop-ui`, `antislop-layoutmobile`, `antislop-human` |
| Teks antarmuka, pesan, copy | `antislop-copywriting` |
| Komentar kode | `antislop-code` |
| Menerima masukan review | `receiving-code-review` |
| Sebelum klaim selesai atau commit | `verification-before-completion` |
| Membuat atau mengubah skill | `writing-skills` |

Jika tidak ada skill yang cocok, kerjakan langsung dengan aturan di file ini. Jangan memuat skill yang tidak relevan.

## 4. Aturan Perilaku Koding

**Muat skill `ponytail` setiap kali akan menulis atau mengubah kode, bersama skill lain yang relevan.** Aturan di bawah adalah penerapannya di repo ini. Ponytail tidak boleh memotong aturan bagian 5, validasi di batas kepercayaan, keamanan, dan aksesibilitas.

- **Sederhana dulu.** Tulis kode seminimal mungkin yang menyelesaikan masalah. Tanpa fitur, abstraksi, atau konfigurasi yang tidak diminta. Jika 200 baris bisa jadi 50, tulis ulang.
- **Perubahan bedah.** Sentuh hanya yang perlu. Jangan merapikan kode, komentar, atau format di sekitarnya. Cocokkan gaya yang sudah ada. Bersihkan hanya sisa yang dibuat perubahan Anda sendiri. Jika menemukan kode mati yang tidak terkait, laporkan dan jangan hapus.
- **Setiap baris yang diubah harus bisa ditelusuri ke permintaan user.**
- **Pakai yang sudah ada.** Urutan: komponen/service/helper di repo, lalu fitur bawaan Laravel/Inertia/React, lalu dependensi terpasang. Jangan menambah dependensi untuk beberapa baris kode.
- **Jalan pintas dicatat.** Jika sengaja memilih solusi dengan batas yang diketahui, tulis komentar `shortcut: <batas>, <kapan ditingkatkan>`.
- **Akhiri laporan** dengan satu atau dua baris: apa yang dilewati atau tidak dicek, dan risiko yang perlu user ketahui.
- **Target terukur.** "Tambah validasi" berarti tulis tes input tidak valid lalu buat lulus. "Perbaiki bug" berarti tulis tes yang mereproduksi lalu buat lulus.

## 5. Aturan Domain (Tidak Boleh Dilanggar)

Pelanggaran aturan di bawah ini adalah bug, meskipun tes lain lulus.

1. **Kunci jawaban tidak pernah ke browser.** Data `lesson_question_answer_keys` dan `quiz_question_answer_keys` dilarang masuk ke *props* Inertia sisi Learner (`data-page`), HTML, atau payload jaringan. Controller Learner dilarang *eager-load* relasi `answerKey` dan wajib memakai proyeksi kolom eksplisit; kunci hanya di-query di dalam `ScoringService` saat submit.
2. **Logika bisnis di `app/Services/`.** Controller tetap tipis (*thin controllers*): validasi input via `FormRequest`, periksa `Policy`, panggil service, lalu kembalikan `Inertia::render(...)` atau `redirect()->back()`.
3. **Penilaian, kelulusan, XP, pembukaan unit, dan remedial dihitung di server** dalam `DB::transaction()`. Tidak boleh ada status lulus tanpa XP, atau XP tanpa status lulus.
4. **Ambang lulus 75** untuk lesson dan quiz. Lesson lulus hanya jika semua materi selesai, semua soal terjawab, dan nilai ≥ 75. Sistem mendukung **4 jenis soal terstruktur**: `mc_pasan_to_id`, `mc_id_to_pasan`, `matching` (penilaian parsial), dan `fill_blank`.
5. **XP tidak ganda.** Dijaga unique constraint pada `xp_transactions`. Nilai: lesson +10, remedial +5, quiz +25.
6. **Alur konten:** `draft → pending_review → approved/changes_requested → published`. `pending_review` terkunci dari edit. Validator tidak boleh menerbitkan. Admin hanya menerbitkan konten `approved`. Mengedit konten `published` menaikkan `content_version` dan mengembalikan status ke `draft`.
7. **RBAC di server** lewat middleware `EnsureUserHasRole` (termasuk cek `is_active`) dan Policy. Akses lintas peran menghasilkan `403`. Menyembunyikan tombol di UI tidak dihitung sebagai proteksi.
8. **Registrasi publik selalu `role = learner`** dan membuka Unit 1. Input peran dari form diabaikan. Admin awal hanya dari seeder.
9. **`/preview` stateless.** Tidak boleh INSERT atau UPDATE ke `lesson_attempts`, `quiz_attempts`, `learner_lesson_progress`, `remedial_assignments`, `xp_transactions`.
10. **Quiz:** 15–20 soal, tiap soal tepat satu `primary_lesson_id`. Remedial maksimal 3 lesson, urut `error_count DESC` lalu `order_number ASC`. Quiz ulang diblokir selama remedial terbaru belum selesai. Unit yang sudah terbuka tidak pernah terkunci lagi.
11. **Konten belum `published` tidak tampil ke Learner.**
12. `.env` tidak boleh masuk git.

## 6. Standar Kode dan UI

- PHP 8.2+, Laravel, Inertia.js, React.js (JSX), Ziggy, Lucide React, dan MySQL 8.0+ (Laragon) sesuai `docs/TECH_STACK.md`. Pakai Enum PHP (`UserRole`, `ContentStatus`, `ActivityType`, `QuestionType` untuk 4 jenis soal, `AttemptStatus`) dan jangan memakai string mentah.
- Primary key UUID dan skema persis seperti `docs/DATABASE_SCHEMA.md`. Perubahan skema harus lewat migration baru, dan dokumen skema diperbarui bersamaan.
- Struktur direktori mengikuti `docs/ARCHITECTURE.md` bagian 3. Jangan membuat folder baru tanpa alasan.
- Tes dengan Pest/PHPUnit (`assertInertia`): `tests/Unit` untuk service (Scoring, Recommendation, Gamification), `tests/Feature` untuk RBAC, Auth, validasi konten, learning, quiz, preview.
- UI: hanya token `@theme` di `resources/css/app.css`. Teks di atas `--color-accent` selalu `--color-ink`. Status tidak hanya mengandalkan warna. Target sentuh ≥ 44px. Dukung `prefers-reduced-motion`. Tiga layout React: `GuestLayout`, `AppLayout`, `FocusLayout`. Sediakan komponen state `<PageSkeleton />`, `<EmptyState />`, `<ErrorState />`.
- Instal dependensi baru hanya jika tercantum di `docs/TECH_STACK.md`, atau setelah user setuju.

## 7. Definition of Done

Sebuah tugas selesai jika **semua** berikut benar:

- [ ] Kriteria yang relevan di `docs/ACCEPTANCE_CRITERIA.md` terpenuhi.
- [ ] Tes baru ditulis dan seluruh tes lulus (`php artisan test` atau `./vendor/bin/pest`), dan hasilnya dibaca.
- [ ] Tidak ada pelanggaran aturan di bagian 5.
- [ ] Tidak ada perubahan di luar lingkup permintaan.
- [ ] Checklist di `docs/TASK.md` diperbarui dan dokumen yang terdampak disesuaikan.

## 8. Kapan Harus Berhenti dan Bertanya

- Dokumen bertentangan atau berkas rujukan tidak ada.
- Permintaan menyentuh aturan di bagian 5.
- Perubahan skema, dependensi baru, atau tindakan yang tidak bisa dibatalkan (hapus data, deploy, `migrate:fresh`).
- Ada lebih dari satu tafsir yang masuk akal dan hasilnya berbeda.

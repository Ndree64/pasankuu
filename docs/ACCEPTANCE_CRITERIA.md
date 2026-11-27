# ACCEPTANCE_CRITERIA.md — Pasanku

Dokumen ini menetapkan **Definition of Done (DoD)** dan kriteria penerimaan pengujian untuk memastikan aplikasi **PASANKU** berbasis **Laravel + Inertia.js + React.js** memenuhi seluruh kebutuhan fungsional, keamanan, keandalan data, dan antarmuka.

---

## 1. Kriteria Penerimaan per Modul

### 1.1 Autentikasi & Hak Akses (RBAC)
- [ ] Pengguna baru dapat mendaftar melalui `/register` dan otomatis mendapat peran `learner` serta akses awal ke Unit 1.
- [ ] Upaya memanipulasi input peran pada form registrasi diabaikan oleh server.
- [ ] Login mengarahkan `admin` ke `/admin`, `validator` ke `/validator`, dan `learner` ke `/learner`.
- [ ] Akun Validator yang dinonaktifkan (`is_active = false`) tidak dapat login atau mengakses panel Validator.
- [ ] Admin dapat membuat, mengaktifkan, dan menonaktifkan akun Validator melalui `/admin/validators`.
- [ ] Akun Admin awal hanya tersedia melalui seeder/skrip inisialisasi, tidak melalui registrasi publik.
- [ ] Percobaan akses lintas peran (misalnya Learner membuka `/admin`, `/validator`, atau `/preview`) ditolak dengan status HTTP `403 Forbidden`.

### 1.2 Manajemen Konten (Admin)
- [ ] Admin dapat mengelola 5 Unit dan 25 Lesson pada `/admin/units`.
- [ ] Admin dapat menambahkan aktivitas `material` dan `exercise` serta mengubah urutan (`Naik`/`Turun`) secara fleksibel pada Builder Lesson (`/admin/lessons/{lesson}`).
- [ ] Admin dapat mengelola kosakata Bahasa Pasan, arti, kategori, contoh kalimat, dan terjemahan.
- [ ] Admin dapat membuat **4 jenis soal terstruktur** (`mc_pasan_to_id`, `mc_id_to_pasan`, `matching`, `fill_blank`) beserta kunci jawaban dan bobot nilainya.
- [ ] Manajemen Quiz Unit (`/admin/quizzes`) memvalidasi jumlah soal dalam rentang **15–20 soal** serta mewajibkan setiap soal memiliki tepat satu `primary_lesson_id`.
- [ ] Mengubah konten yang sudah `published` otomatis menaikkan `content_version` dan mengembalikan status ke `draft`.

### 1.3 Validasi Konten (Validator)
- [ ] Validator dapat melihat antrean konten `pending_review` dan membuka paket detail Lesson/Quiz di `/validator/reviews/{type}/{id}`.
- [ ] Konten berstatus `pending_review` tidak dapat diedit oleh Admin selama sedang diperiksa.
- [ ] Validator dapat menyetujui konten (`approved`) atau meminta revisi (`changes_requested`) disertai catatan wajib pada `review_note`.
- [ ] Validator tidak memiliki tombol maupun izin server untuk menerbitkan konten secara langsung.
- [ ] Admin hanya dapat menerbitkan konten yang berstatus `approved`.
- [ ] Konten belum terbit (`draft`, `pending_review`, `changes_requested`, `approved`) tidak tampil sebagai materi aktif bagi Learner.
- [ ] Seluruh riwayat validasi tercatat di `content_reviews` dan tampil pada `/validator/riwayat`.

### 1.4 Pembelajaran Lesson & Progres (Learner)
- [ ] Learning Path `/learner` menampilkan jalur zig-zag 5 unit dengan status node akurat (`Selesai`, `Aktif`, `Terkunci`, `Belum Terbit`, `Quiz Unit`).
- [ ] Aktivitas dalam lesson tampil berurutan sesuai `order_number` pada `FocusLayout` tanpa navigasi global.
- [ ] Materi singkat dapat ditandai selesai saat Learner menekan `Tandai Selesai & Lanjut`.
- [ ] **Keempat jenis soal latihan** (`mc_pasan_to_id`, `mc_id_to_pasan`, `matching`, `fill_blank`) dapat dikerjakan secara interaktif di React, dikirim ke server melalui Inertia, dinilai di server, dan menampilkan umpan balik serta pembahasan.
- [ ] Soal mencocokkan pasangan mendukung penilaian parsial per pasangan benar.
- [ ] Kunci jawaban tidak pernah muncul di HTML, DOM, Network payload, maupun objek `props` Inertia (`data-page`) pada sisi Learner.
- [ ] Lesson dinyatakan lulus hanya jika: semua materi wajib selesai, semua soal terjawab, dan nilai akhir $\ge 75$.
- [ ] Jika nilai $< 75$, status menjadi `failed`, riwayat percobaan tetap tersimpan, dan Learner dapat mengulang latihan tanpa batas.

### 1.5 Quiz Unit, Rekomendasi Adaptif, & Remedial
- [ ] Quiz Unit hanya dapat dimulai jika kelima lesson dalam unit telah lulus pada `content_version` aktif.
- [ ] Quiz menampilkan 15–20 soal yang mencakup kelima lesson dan mencegah submit jika masih ada soal wajib yang kosong.
- [ ] Jika nilai Quiz $\ge 75$: status menjadi `passed` dan Unit berikutnya otomatis tercatat terbuka di `unit_unlocks`.
- [ ] Jika nilai Quiz $< 75$: sistem mengelompokkan jawaban salah berdasarkan `primary_lesson_id`, mengurutkan (`error_count DESC`, `order_number ASC`), dan menyimpan maksimal 3 `remedial_assignments`.
- [ ] Kartu remedial tampil di bawah node Quiz Unit yang gagal pada `/learner`.
- [ ] Pengulangan Quiz Unit diblokir oleh server selama masih ada tugas remedial dari percobaan gagal terbaru yang belum `completed`.
- [ ] Pengerjaan remedial mencatat `lesson_activity_progress` dan `lesson_attempts` secara terpisah (`remedial`) tanpa mengubah status lulus lesson reguler.
- [ ] Setelah seluruh remedial lulus ($\ge 75$), akses mengulang Quiz Unit terbuka kembali.
- [ ] Unit yang sudah pernah terbuka tidak pernah terkunci kembali.

### 1.6 Gamifikasi, Kamus, Papan Skor, & Profil
- [ ] Lulus lesson reguler pertama kali memberikan `+10 XP`, remedial lesson pertama kali `+5 XP`, dan Quiz Unit pertama kali `+25 XP`.
- [ ] Aktivitas gagal atau pengulangan aktivitas yang sudah mendapat XP menghasilkan `+0 XP` (dijamin oleh unique constraint di `xp_transactions`).
- [ ] Halaman `/learner/kamus` mendukung pencarian real-time (debounced Inertia visit) dan filter unit serta hanya menampilkan kosakata tervalidasi bagi Learner.
- [ ] Halaman `/learner/papan-skor` menampilkan podium top 3 dan peringkat seluruh Learner berdasarkan Total XP dengan sorotan baris aktif.
- [ ] Halaman `/learner/profil` menampilkan Total XP, Level, Lencana (`Badge`), riwayat Quiz Unit, dan riwayat transaksi XP.

### 1.7 Mode Pratinjau (`/preview`)
- [ ] Hanya dapat diakses oleh `admin` dan `validator`.
- [ ] Menampilkan banner sticky `Mode Pratinjau: progres tidak disimpan` serta filter `Semua Status` vs `Hanya Terbit`.
- [ ] Menjalankan lesson dan quiz melalui `/preview` tidak membuat atau mengubah baris apa pun di `lesson_attempts`, `quiz_attempts`, `learner_lesson_progress`, `remedial_assignments`, maupun `xp_transactions`.

---

## 2. Kriteria Penanganan Kesalahan (Error Handling)

- [ ] **Kegagalan Login:** Menampilkan pesan kesalahan aman tanpa mengungkap detail akun.
- [ ] **Jawaban Belum Lengkap:** Sistem memblokir submit evaluasi di klien & server serta menandai soal yang belum diisi.
- [ ] **Kegagalan Transaksi Database:** `DB::transaction()` melakukan *rollback* penuh sehingga tidak ada status kelulusan tanpa XP atau XP tanpa status lulus.
- [ ] **State Antarmuka:** Tersedia `<PageSkeleton />` saat memuat data, `<EmptyState />` saat data kosong, dan `<ErrorState />` saat terjadi kegagalan sistem.

---

## 3. Kriteria Kualitas UI/UX & Responsivitas (`DESIGN.md`)

- [ ] Seluruh warna mengikuti token `@theme` di `resources/css/app.css` dengan kontras teks memenuhi WCAG AA (teks di atas `--color-accent` selalu `--color-ink`, bukan putih).
- [ ] Status tidak pernah hanya mengandalkan warna (selalu disertai label atau ikon).
- [ ] Target sentuh tombol/kontrol minimal `44px x 44px` dengan efek tekan taktil `translateY(4px)` dan dukungan `prefers-reduced-motion`.
- [ ] Responsif pada 3 rentang layar: Mobile ($< 768\text{px}$ dengan 4-tab bottom nav), Tablet ($768\text{--}1023\text{px}$ dengan sidebar `224px`), dan Desktop ($\ge 1024\text{px}$ dengan sidebar `248px` + rail kanan pada `xl`).
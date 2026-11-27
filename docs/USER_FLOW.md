# USER_FLOW.md — Pasanku

Dokumen ini memetakan seluruh alur perjalanan pengguna (*User Journeys*) untuk **Learner**, **Admin**, dan **Validator** di aplikasi **PASANKU** berbasis **Laravel + Inertia.js + React.js**.

---

## 1. Alur Autentikasi & Registrasi Mandiri (Learner)

```mermaid
flowchart TD
    A[Pengguna membuka / atau /register] --> B[Mengisi nama lengkap, email, password via React useForm]
    B --> C{Validasi Laravel FormRequest?}
    C -->|Tidak valid| B
    C -->|Valid| D[Laravel Auth membuat akun & hash password]
    D --> E[Membuat profil otomatis dengan role = learner]
    E --> F[Membuka akses Unit 1 pada unit_unlocks]
    F --> G[Regenerasi session & redirect Inertia ke /learner]
```

**Catatan Alur Login (`/login`):**
- Setelah kredensial diverifikasi dan `profiles.is_active == true`, sistem mengarahkan pengguna berdasarkan peran:
  - `learner` -> `/learner`
  - `validator` -> `/validator`
  - `admin` -> `/admin`
- Jika gagal, tampilkan pesan error generik tanpa membocorkan apakah email terdaftar atau tidak.

---

## 2. Alur Pembuatan & Validasi Konten (Admin & Validator)

```mermaid
flowchart TD
    A[Admin membuka /admin/units atau /admin/quizzes] --> B[Admin menyusun Lesson / Quiz berstatus Draft]
    B --> C[Admin mengatur urutan materi & latihan / 15-20 soal quiz]
    C --> D[Admin menguji tampilan via /preview]
    D --> E[Admin mengajukan konten untuk validasi]
    E --> F[Status berubah ke Pending Review & edit terkunci]
    F --> G[Validator membuka antrean /validator]
    G --> H[Validator memeriksa Materi, Kosakata, Soal, & Kunci Jawaban]
    H --> I{Konten akurat & sesuai?}
    I -->|Perlu Perbaikan| J[Status: Changes Requested + Catatan Validasi]
    J --> K[Admin memperbaiki konten]
    K --> E
    I -->|Sesuai| L[Status: Approved]
    L --> M[Admin menekan tombol Terbitkan]
    M --> N[Status: Published — tersedia untuk Learner]
```

**Alur Perubahan Konten Terbit:**
1. Admin memilih mengedit konten berstatus `published`.
2. Sistem otomatis menaikkan `content_version` (+1) dan mengembalikan status menjadi `draft`.
3. Konten wajib diajukan kembali ke Validator sebelum versi baru diterbitkan.
4. Unit yang sudah terbuka bagi Learner tetap terbuka.

---

## 3. Alur Pembelajaran Lesson (Learner)

```mermaid
flowchart TD
    A[Learner membuka Learning Path /learner] --> B[Memilih node Lesson aktif]
    B --> C[Masuk FocusLayout /learner/lessons/id]
    C --> D[Controller memuat urutan lesson_activities & attempt aktif ke React props]
    D --> E{Jenis aktivitas saat ini?}
    E -->|Material| F[React menampilkan halaman materi singkat, kosakata, & contoh]
    F --> G[Learner klik 'Tandai Selesai & Lanjut' -> Inertia POST]
    G --> H[Server simpan lesson_activity_progress]
    E -->|Exercise| I[React menampilkan komponen soal interaktif]
    I --> J[Learner kirim jawaban via Inertia POST -> server cek kunci & kembalikan umpan balik]
    J --> K[Server simpan lesson_responses & progres aktivitas]
    H --> L{Masih ada aktivitas berikutnya?}
    K --> L
    L -->|Ya| E
    L -->|Tidak| M[Server menghitung nilai akhir lesson]
    M --> N{Semua materi selesai, semua soal dijawab, & nilai >= 75?}
    N -->|Tidak| O[Tampil panel Belum Lulus + pembahasan -> tombol Ulangi Latihan]
    O --> C
    N -->|Ya| P[Tampil panel Lulus +10 XP jika pertama kali]
    P --> Q[Buka Lesson berikutnya atau Quiz Unit -> kembali ke /learner]
```

**Catatan Percobaan Ulang Lesson Gagal:**
- Sistem membuat `lesson_attempts` baru tanpa menghapus riwayat lama.
- Materi yang sudah ditandai selesai pada konteks reguler tetap tercatat selesai sehingga Learner cukup mengulang latihan (namun tetap dapat membuka ulang materi jika ingin).

---

## 4. Alur Quiz Unit, Rekomendasi Adaptif, & Remedial (Learner)

```mermaid
flowchart TD
    A[Seluruh 5 Lesson dalam Unit lulus] --> B[Node Piala Quiz Unit aktif di /learner]
    B --> C[Learner memulai /learner/quizzes/unit]
    C --> D[Mengerjakan 15-20 soal terstruktur di React]
    D --> E[Submit seluruh jawaban via Inertia POST -> Server menghitung skor]
    E --> F{Nilai Quiz >= 75?}
    F -->|Ya - Lulus| G[Simpan status Passed, beri +25 XP pertama kali, buka Unit berikutnya]
    G --> H[Tampil hasil Lulus & pembahasan -> kembali ke /learner]
    F -->|Tidak - Gagal| I[Server ambil semua jawaban salah]
    I --> J[Kelompokkan berdasarkan primary_lesson_id]
    J --> K[Urutkan: error_count DESC, order_number ASC -> ambil maks 3 lesson]
    K --> L[Simpan remedial_assignments & blokir pengulangan Quiz]
    L --> M[Kartu Remedial tampil di bawah node Quiz Unit pada /learner]
    M --> N[Learner membuka lesson remedial -> progres dicatat terpisah]
    N --> O[Selesaikan semua materi & latihan remedial dengan nilai >= 75]
    O --> P{Semua remedial pada percobaan gagal terbaru selesai?}
    P -->|Belum| M
    P -->|Sudah| Q[Beri +5 XP pertama kali per lesson remedial & buka kembali Quiz Unit]
    Q --> C
```

---

## 5. Alur Fitur Pendukung Learner

### 5.1 Kamus (`/learner/kamus`)
1. Learner membuka tab `Kamus`.
2. Mengetik kata Bahasa Pasan atau Bahasa Indonesia di kolom pencarian (*debounce* React memicu `router.get` dengan `preserveState: true, replace: true`) dan/atau memilih chip filter unit (`Semua`, `Unit 1`, `Unit 2`, `Unit 3`, `Unit 4-5`).
3. Sistem menampilkan kartu kosakata tervalidasi beserta arti, kategori, contoh kalimat, dan catatan bahasa.

### 5.2 Papan Skor (`/learner/papan-skor`)
1. Learner membuka tab `Papan Skor`.
2. Sistem menampilkan podium 3 teratas dan daftar peringkat berdasarkan akumulasi Total XP.
3. Baris Learner yang sedang login disorot dengan latar `--color-surface-highlight`.

### 5.3 Profil (`/learner/profil`)
1. Learner membuka tab `Profil`.
2. Melihat identitas, kartu Level & progres XP, daftar Lencana (`Badge`), riwayat percobaan Quiz Unit, dan riwayat transaksi XP.
3. Dapat menekan tombol `Keluar` (`router.post('/logout')`) untuk mengakhiri sesi.

---

## 6. Alur Mode Pratinjau (`/preview`) — Admin & Validator

1. Admin atau Validator mengklik menu `Pratinjau` dari sidebar atau top bar mobile.
2. Sistem menampilkan Learning Path dengan banner sticky amber `Mode Pratinjau: progres tidak disimpan`.
3. Pengguna dapat memilih filter `Semua Status` (termasuk `draft` & `pending_review`) atau `Hanya Terbit`.
4. Pengguna bebas membuka unit, lesson, atau quiz mana saja tanpa batasan kunci urutan dan menguji soal serta penilaian secara *stateless* (state langkah di React & pengecekan skor tanpa menulis ke tabel progres atau XP).
5. Klik `Keluar Pratinjau` untuk kembali ke dashboard peran masing-masing.
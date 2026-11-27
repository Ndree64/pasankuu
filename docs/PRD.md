# Product Requirements Document (PRD) — PASANKU

**Nama Produk:** PASANKU — Aplikasi Pembelajaran Bahasa Pasan Interaktif Berbasis Web Menggunakan Gamifikasi dan Sistem Rekomendasi Adaptif  
**Versi:** 0.9  
**Status:** Siap Implementasi  
**Platform:** Web Application (Mobile-First Responsive — Laravel + Inertia.js + React.js)  
**Target Pengguna:** Admin, Validator, dan Learner  
**Tagline:** *"Bahasa kita, warisan kita."*

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Bahasa daerah merupakan bagian dari identitas dan warisan budaya yang perlu dipelajari serta dilestarikan. **PASANKU** dirancang sebagai media pembelajaran Bahasa Pasan (Ratahan, Minahasa Tenggara) berbasis web yang mudah diakses, interaktif, dan terstruktur bagi pemula.

Aplikasi menerapkan pendekatan **microlearning** (materi disajikan dalam bagian kecil dan bertahap yang diselingi latihan interaktif), **evaluasi per unit**, **sistem rekomendasi adaptif berbasis aturan**, **gamifikasi (XP, level, lencana, papan skor)**, serta **alur validasi konten** oleh penutur/ahli bahasa (*Validator*) sebelum materi diterbitkan.

### 1.2 Tujuan Produk
1. Menyediakan media pembelajaran Bahasa Pasan berbasis web yang mudah digunakan oleh pemula.
2. Menyajikan pembelajaran melalui materi singkat dan latihan interaktif secara bertahap.
3. Membantu pengguna mempelajari kosakata, ungkapan, dan percakapan sederhana Bahasa Pasan.
4. Menyediakan evaluasi untuk mengukur pemahaman pengguna pada setiap unit pembelajaran.
5. Menerapkan sistem rekomendasi adaptif berdasarkan kesalahan jawaban quiz unit.
6. Meningkatkan motivasi belajar melalui gamifikasi (XP, progres, level, lencana, dan papan skor).
7. Menjaga keakuratan Bahasa Pasan melalui mekanisme validasi konten oleh Validator.

### 1.3 Pendekatan Pembelajaran
- **Microlearning:** Materi dipecah menjadi halaman singkat yang berfokus pada satu konsep atau kelompok kosakata.
- **Progressive Learning:** Materi dan latihan disusun bergantian secara bertahap sesuai urutan aktivitas.
- **Interactive Learning:** Latihan langsung dengan **4 variasi bentuk soal terstruktur** yang responsif dan mulus berbasis React.
- **Adaptive Learning:** Analisis kesalahan quiz unit untuk merekomendasikan maksimal 3 lesson remedial.

---

## 2. Pengguna dan Hak Akses (RBAC)

### 2.1 Admin
- Mengelola unit, lesson, materi, urutan aktivitas, kosakata, contoh kalimat, soal latihan, dan quiz unit.
- Mengatur kunci jawaban, bobot soal, dan pemetaan soal quiz ke lesson sumber utama (`primary_lesson_id`).
- Mengirim konten ke Validator, memperbaiki konten berdasarkan catatan revisi, dan menerbitkan konten yang sudah disetujui Validator.
- Mengelola akun Validator (membuat, mengaktifkan, menonaktifkan).
- Menggunakan **Mode Pratinjau (`/preview`)** secara *stateless* untuk menguji kurikulum.
- Melihat ringkasan progres Learner.
- *Inisialisasi:* Akun Admin awal dibuat melalui seeder/skrip terkendali, bukan registrasi publik.

### 2.2 Validator
- Melihat antrean konten (`Pending Review`) yang diajukan Admin.
- Memeriksa kosakata, arti, contoh penggunaan, terjemahan, materi, soal latihan, soal quiz, kunci jawaban, dan kesesuaian soal dengan materi.
- Menyetujui konten (`Approved`) atau meminta revisi (`Changes Requested`) disertai catatan validasi.
- Melihat riwayat validasi dan Kamus Referensi (termasuk kosakata yang masih menunggu review).
- Menggunakan **Mode Pratinjau (`/preview`)** secara *stateless*.
- *Pembatasan:* Validator tidak dapat menerbitkan konten secara langsung dan akunnya dibuat oleh Admin.

### 2.3 Learner
- Mendaftar akun mandiri (otomatis mendapat peran `learner`, tidak dapat mengubah peran sendiri).
- Login, logout, dan melihat profil, progres XP, level, lencana, serta riwayat belajar.
- Mengakses jalur belajar (*Learning Path*), membaca materi, dan mengerjakan latihan interaktif.
- Mengikuti Quiz Unit setelah seluruh 5 lesson pada unit lulus.
- Menerima rekomendasi remedial apabila gagal quiz dan mengerjakan remedial secara terpisah.
- Mengakses **Kamus Bahasa Pasan** dan **Papan Skor (Leaderboard)**.

---

## 3. Struktur Kurikulum Pembelajaran

Kurikulum awal terdiri atas **5 Unit**, **25 Lesson** (5 lesson per unit), dan **5 Quiz Unit** (1 quiz per unit).

| Unit       | Tema                               | Daftar Lesson                                                                                                                                                      | Quiz        |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **Unit 1** | Sapaan dan Ungkapan Dasar          | 1.1 Pengenalan Bahasa Pasan & kosakata dasar; 1.2 Sapaan sederhana; 1.3 Menanyakan kabar & responsnya; 1.4 Terima kasih & permintaan maaf; 1.5 Ungkapan perpisahan | Quiz Unit 1 |
| **Unit 2** | Perkenalan Diri dan Identitas      | 2.1 Kata ganti orang (saya, kamu, dia); 2.2 Menyebutkan nama; 2.3 Menanyakan & menyebutkan asal; 2.4 Menyebutkan tempat tinggal; 2.5 Memperkenalkan diri           | Quiz Unit 2 |
| **Unit 3** | Angka dan Benda di Sekitar         | 3.1 Angka 1–5; 3.2 Angka 6–10; 3.3 Benda-benda di sekitar; 3.4 Menyebutkan jumlah benda; 3.5 Angka & nama benda dalam ungkapan                                     | Quiz Unit 3 |
| **Unit 4** | Keluarga dan Kehidupan Sehari-hari | 4.1 Anggota keluarga; 4.2 Orang-orang di sekitar; 4.3 Makanan dan minuman; 4.4 Aktivitas sehari-hari; 4.5 Kosakata dalam ungkapan sederhana                        | Quiz Unit 4 |
| **Unit 5** | Ungkapan dan Percakapan Sederhana  | 5.1 Susunan ungkapan sederhana; 5.2 Percakapan sapaan; 5.3 Percakapan perkenalan diri; 5.4 Percakapan tentang keluarga; 5.5 Percakapan sehari-hari                 | Quiz Unit 5 |

### Aturan Akses Unit & Lesson
- **Unit 1** terbuka sejak awal bagi setiap Learner.
- **Lesson dalam Unit** dikerjakan secara berurutan berdasarkan `order_number` (Lesson 1 terbuka awal, Lesson berikutnya terbuka setelah Lesson sebelumnya lulus).
- **Quiz Unit** terbuka setelah seluruh 5 lesson dalam unit tersebut lulus pada `content_version` aktif.
- **Unit Berikutnya** terbuka setelah seluruh 5 lesson dan Quiz Unit sebelumnya lulus (nilai minimal 75).
- Unit yang sudah terbuka **tidak pernah dikunci kembali** meskipun Learner mengulang lesson/quiz atau konten diperbarui.

---

## 4. Konsep Pembelajaran, Latihan, dan Quiz

### 4.1 Struktur Lesson Fleksibel
Setiap lesson berisi urutan aktivitas (`lesson_activities`) bertipe `material` atau `exercise` yang urutannya diatur bebas oleh Admin (misalnya: Materi 1 -> Materi 2 -> Latihan 1 -> Materi 3 -> Latihan 2).

### 4.2 Jenis Soal Terstruktur (Latihan & Quiz)
Sistem mendukung **4 jenis soal terstruktur**:
1. Pilihan ganda Bahasa Pasan ke Bahasa Indonesia.
2. Pilihan ganda Bahasa Indonesia ke Bahasa Pasan.
3. Mencocokkan pasangan kosakata dan arti (mendukung penilaian parsial per pasangan).
4. Melengkapi ungkapan atau kalimat rumpang.

### 4.3 Penilaian dan Kelulusan Lesson
Rumus nilai:

$$\text{Nilai} = \frac{\text{Total poin diperoleh}}{\text{Total poin maksimal}} \times 100$$

Syarat kelulusan lesson:
- Seluruh aktivitas `material` wajib telah dibuka dan ditandai selesai.
- Seluruh soal pada aktivitas `exercise` telah dijawab.
- Nilai akhir minimal **75** dari 100.
- Percobaan ulang tidak terbatas dan seluruh riwayat percobaan tetap disimpan.

### 4.4 Quiz Unit
- Jumlah soal: **15–20 soal** per unit yang mencakup kelima lesson secara proporsional (menggunakan 4 jenis soal terstruktur di atas).
- Setiap soal quiz wajib memiliki tepat satu `primary_lesson_id`.
- Nilai maksimal 100; nilai kelulusan minimal **75**.

---

## 5. Sistem Rekomendasi Adaptif & Remedial

- **Pemicu:** Quiz Unit dinyatakan tidak lulus (nilai $< 75$).
- **Metode:** Rekomendasi berbasis aturan (*rule-based*), bukan *machine learning*.
- **Algoritma:**
  1. Ambil seluruh jawaban quiz yang salah (atau tidak mendapat poin penuh).
  2. Kelompokkan kesalahan berdasarkan `primary_lesson_id`.
  3. Urutkan lesson berdasarkan jumlah kesalahan terbanyak (*descending*); jika seri, prioritaskan urutan lesson lebih awal dalam unit (`order_number` *ascending*).
  4. Ambil maksimal **3 lesson** dengan jumlah kesalahan $> 0$.
- **Mekanisme Remedial:**
  - Menggunakan kembali lesson reguler yang sudah ada (materi & latihan).
  - Progres remedial disimpan terpisah dari progres reguler (tidak menghapus status lulus reguler).
  - Syarat lulus remedial: buka semua materi, jawab semua soal, nilai minimal **75** (percobaan tidak terbatas).
  - **Pemblokiran Quiz:** Learner hanya dapat mengulang Quiz Unit setelah seluruh lesson remedial dari percobaan gagal terbaru selesai.

---

## 6. Gamifikasi & Fitur Pendukung Learner

### 6.1 Experience Points (XP)
| Aktivitas                                               | XP     | Aturan                         |
| ------------------------------------------------------- | ------ | ------------------------------ |
| Lulus lesson reguler pertama kali                       | +10 XP | Sekali per lesson per pengguna |
| Selesai remedial lesson pertama kali                    | +5 XP  | Sekali per lesson per pengguna |
| Lulus Quiz Unit pertama kali                            | +25 XP | Sekali per unit per pengguna   |
| Aktivitas gagal atau pengulangan yang sudah mendapat XP | 0 XP   | Tidak ada XP ganda             |

Total XP dihitung dari riwayat transaksi:

$$\text{Total XP} = \sum \text{XP transaksi}$$

### 6.2 Level, Lencana (Badge), Papan Skor, dan Kamus
- **Level:** Dihitung berdasarkan akumulasi Total XP pada halaman Profil Learner.
- **Lencana (Badge):** Penghargaan pencapaian belajar (misalnya lulus lesson pertama, menyelesaikan unit pertama, menuntaskan remedial pertama, dan menuntaskan seluruh kurikulum).
- **Papan Skor (`/learner/papan-skor`):** Menampilkan podium 3 teratas dan daftar peringkat Learner berdasarkan Total XP.
- **Kamus (`/learner/kamus`):** Pencarian kosakata Bahasa Pasan *real-time* beserta filter unit (`Semua`, `Unit 1`, `Unit 2`, `Unit 3`, `Unit 4-5`), arti Bahasa Indonesia, kategori, contoh kalimat, dan status validasi (hanya menampilkan kosakata tervalidasi untuk Learner).

---

## 7. Validasi Konten & Versioning

- **Status Konten:** `draft` -> `pending_review` -> (`changes_requested` -> perbaikan -> `pending_review`) / `approved` -> `published`.
- **Paket Pemeriksaan:** Lesson diajukan beserta seluruh materi, kosakata, contoh, dan soal latihannya; Quiz diajukan beserta seluruh soal, pemetaan `primary_lesson_id`, dan kunci jawabannya.
- **Penguncian Saat Review:** Konten berstatus `pending_review` tidak dapat diubah Admin sampai validasi selesai atau pengajuan dibatalkan.
- **Versioning Konten Terbit:** Mengubah konten berstatus `published` akan menaikkan `content_version`, mengembalikan status menjadi `draft`, dan mewajibkan validasi ulang. Riwayat percobaan versi lama tetap tersimpan.

---

## 8. Ruang Lingkup & Batasan Versi Awal

### Dalam Ruang Lingkup
Autentikasi & RBAC, Learning Path responsif, Microlearning Lesson, **4 jenis soal interaktif**, Quiz Unit (15–20 soal), Rekomendasi Remedial, Gamifikasi (XP, Level, Badge, Papan Skor), Kamus, Manajemen Konten Admin, Validasi Konten Validator, dan Mode Pratinjau (`/preview`).

### Di Luar Ruang Lingkup Versi Awal
Audio / TTS, pengenalan suara / evaluasi pelafalan, latihan mikrofon, chatbot AI / penerjemahan otomatis AI, soal memahami percakapan tertulis khusus, jawaban esai teks bebas, aplikasi mobile native, dan mode offline.

### Kebutuhan Non-Fungsional Utama
- **Arsitektur:** Monolitik modern menggunakan **Laravel + Inertia.js + React.js** (tanpa REST API terpisah).
- **Skala Awal:** Uji coba penelitian dengan target kurang dari 25 pengguna aktif secara bersamaan.
- **Keamanan:** Semua pemeriksaan peran, kunci jawaban, penilaian, rekomendasi, dan transaksi XP wajib dijalankan di sisi server (Laravel Middleware, Policy, Gate, dan `DB::transaction()`). Kunci jawaban dilarang keras dikirim ke *props* Inertia sisi Learner.
- **Keakuratan Bahasa:** Tidak boleh menampilkan kosakata atau contoh Bahasa Pasan tanpa sumber tervalidasi.
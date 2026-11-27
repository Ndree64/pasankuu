# DESIGN.md — Pasanku

Dokumen ini berisi arah desain, token visual, aturan tata letak responsif, dan inventaris antarmuka **PASANKU** yang selaras dengan implementasi `resources/css/app.css` (**Laravel + Inertia.js + React.js + Vite + Tailwind CSS v4**) dan dokumen FigCraft "Pasanku". Seluruh isi dokumen bersifat deklaratif sebagai acuan desain.

---

## 1. Identitas Produk

| Aspek | Nilai |
| --- | --- |
| Nama | PASANKU |
| Tagline | "Bahasa kita, warisan kita." |
| Produk | Aplikasi web pembelajaran Bahasa Pasan (Ratahan, Minahasa Tenggara) berbasis microlearning |
| Pengguna | Learner pemula, Validator (penutur/ahli bahasa), Admin (pengelola kurikulum) |
| Maskot | Ayam jago merah berselendang tenun Pasan, ramah dan bersemangat |
| Kepribadian | Hangat, kultural, interaktif, sederhana, fokus belajar |
| Bukan | Ramai, kekanak-kanakan berlebihan, dashboard korporat dingin |

**Design read:** Platform belajar web responsif (*mobile-first*) untuk pemula Bahasa Pasan dengan tiga peran, gaya modern-kultural yang hangat, sederhana, dan tidak padat.

---

## 2. Liveliness Dials

```text
Dial: ENERGY 2 / RHYTHM 2 / MOTION 1
```

| Dial | Nilai | Alasan |
| --- | --- | --- |
| ENERGY | 2 | Warna hangat dari maskot cukup hidup, tetapi permukaan tetap tenang agar materi mudah dibaca. |
| RHYTHM | 2 | Ritme layout teratur (jalur vertikal dan kartu seragam) supaya pemula tidak tersesat. |
| MOTION | 1 | Gerak hanya untuk umpan balik (tekan tombol, panel hasil, XP). Tidak ada animasi dekoratif. |

---

## 3. Warna

Aturan pemakaian: 2 warna inti (Ink `#4A1F0C` dan Brand Crimson `#C92A2A`) ditambah 1 aksen terarah (Golden Amber `#F5A623`). Hijau (`#2B7A4B`) dipakai khusus untuk status semantik sukses.

### 3.1 Token Warna

| Token CSS | Hex | Peran | Kontras WCAG AA |
| --- | --- | --- | --- |
| `--color-canvas` | `#FFF9F0` | Latar halaman utama (warm cream) | - |
| `--color-surface` | `#FFFFFF` | Kartu, panel, kotak formulir | - |
| `--color-surface-soft` | `#FAF2E6` | Permukaan sekunder, skeleton, kartu catatan | - |
| `--color-surface-highlight` | `#FDF3E3` | Pill navigasi aktif, sorotan baris peringkat | - |
| `--color-border-subtle` | `#EFE4D4` | Garis tepi kartu dan pemisah | - |
| `--color-border-control` | `#D9C5AD` | Garis input dan chip filter tidak aktif | - |
| `--color-ink` | `#4A1F0C` | Teks utama dan permukaan gelap (Espresso Ink) | 13.44:1 di canvas |
| `--color-ink-soft` | `#6E4735` | Teks sekunder, subjudul, metadata | 7.67:1 di canvas |
| `--color-brand` | `#C92A2A` | Aksi utama, banner unit, tab aktif (Crimson Rooster) | 5.46:1 dengan teks putih |
| `--color-brand-lip` | `#9E1F1F` | Bibir bawah 3D tombol dan node brand | - |
| `--color-brand-tint` | `#FDF0F0` | Latar pesan error, status perlu revisi | - |
| `--color-accent` | `#F5A623` | Badge XP, node aktif, sorotan pratinjau (Golden Amber) | 6.94:1 dengan teks `#4A1F0C` |
| `--color-accent-lip` | `#B36B00` | Bibir bawah 3D elemen amber | - |
| `--color-accent-border` | `#C97E0A` | Garis kartu remedial dan banner pratinjau | - |
| `--color-accent-tint` | `#FFF4DE` | Latar kartu remedial dan banner mode pratinjau | - |
| `--color-success` | `#2B7A4B` | Status lulus, disetujui, terbit (Leaf Green) | 5.27:1 dengan teks putih |
| `--color-success-lip` | `#1E5C37` | Bibir bawah 3D tombol dan node selesai | - |
| `--color-success-tint` | `#EEF7F1` | Latar status sukses dan kotak kunci jawaban | - |
| `--color-locked` | `#E5DACB` | Node terkunci (selalu disertai ikon gembok) | - |

### 3.2 Pasangan Teks yang Diizinkan

| Latar | Teks |
| --- | --- |
| `--color-canvas`, `--color-surface`, `--color-surface-soft` | `--color-ink`, `--color-ink-soft` |
| `--color-brand` | `#FFFFFF` |
| `--color-accent` | `--color-ink` (bukan putih) |
| `--color-success` | `#FFFFFF` |
| `--color-ink` | `#FFF9F0` |

Status tidak pernah disampaikan dengan warna saja: selalu disertai label teks atau ikon (centang, silang, jam, pensil, gembok).

### 3.3 Blok `@theme` Tailwind v4 (`resources/css/app.css`)

```css
@import "tailwindcss";

@theme {
  --color-canvas: #FFF9F0;
  --color-surface: #FFFFFF;
  --color-surface-soft: #FAF2E6;
  --color-surface-highlight: #FDF3E3;
  --color-border-subtle: #EFE4D4;
  --color-border-control: #D9C5AD;
  --color-ink: #4A1F0C;
  --color-ink-soft: #6E4735;
  --color-brand: #C92A2A;
  --color-brand-lip: #9E1F1F;
  --color-brand-tint: #FDF0F0;
  --color-accent: #F5A623;
  --color-accent-lip: #B36B00;
  --color-accent-border: #C97E0A;
  --color-accent-tint: #FFF4DE;
  --color-success: #2B7A4B;
  --color-success-lip: #1E5C37;
  --color-success-tint: #EEF7F1;
  --color-locked: #E5DACB;

  --font-display: "Candara", "Trebuchet MS", "Segoe UI", sans-serif;
  --font-body: "Segoe UI", system-ui, -apple-system, sans-serif;

  --radius-chip: 8px;
  --radius-control: 12px;
  --radius-card: 16px;
  --radius-panel: 20px;

  --shadow-focal: 0 4px 12px rgb(74 31 12 / 0.07);
}
```

Mode warna sistem selalu memakai tema terang hangat (`color-scheme: light`).

---

## 4. Tipografi

| Peran | Font Stack | Alasan |
| --- | --- | --- |
| Display dan judul | `Candara`, `Trebuchet MS`, `Segoe UI`, `sans-serif` | Humanist sans dengan lengkung hangat, selaras dengan karakter maskot yang ramah. |
| Body dan kontrol UI | `Segoe UI`, `system-ui`, `-apple-system`, `sans-serif` | Keterbacaan tinggi pada layar mobile untuk materi Bahasa Pasan, kamus, dan formulir. |

### 4.1 Skala Ukuran

| Token | Mobile ($< 768\text{px}$) | Tablet ($768\text{--}1023\text{px}$) | Desktop ($\ge 1024\text{px}$) | Line-height |
| --- | --- | --- | --- | --- |
| `display` | 28px | 32px | 36px | 1.2 |
| `h1` | 24px | 26px | 28px | 1.25 |
| `h2` | 20px | 20px | 22px | 1.3 |
| `h3` | 17px | 18px | 18px | 1.35 |
| `body` | 15px | 16px | 16px | 1.55 |
| `body-sm` | 14px | 14px | 14px | 1.5 |
| `meta` | 12–13px | 13px | 13px | 1.45 |
| `label` (section sidebar) | 11px uppercase, tracking 0.08em | sama | sama | 1.4 |

Kata Bahasa Pasan pada materi dan kamus ditulis Bold (`--color-ink`); terjemahan Bahasa Indonesia ditulis Regular atau Semibold (`--color-ink-soft`).

---

## 5. Bentuk, Elevasi, dan Motif

### 5.1 Radius

| Elemen | Nilai Radius |
| --- | --- |
| Panel besar, banner unit, kartu login | `20px` (`rounded-panel`) |
| Kartu konten dan statistik | `16px` (`rounded-card`) |
| Tombol utama dan input | `12px` (`rounded-control`) |
| Badge status dan chip filter | `8px` (`rounded-chip`) |
| Node learning path | Lingkaran penuh (`rounded-full`) |

### 5.2 Ukuran Kontrol dan Target Sentuh

| Elemen | Ukuran |
| --- | --- |
| Tombol utama | Tinggi minimal `48px` (`50px` di landing), lebar penuh di mobile |
| Input formulir | Tinggi `48px` (`h-12`) |
| Target sentuh minimum | `44px x 44px` |
| Node path | `72px` (selesai/terkunci), `82px–84px` (aktif / Quiz Unit) |
| Bottom navigation mobile | Tinggi `68px` (`h-[68px]`) |
| Sidebar desktop | Lebar `248px`, baris navigasi `48px` |

### 5.3 Elevasi dan Efek Taktil

- Default kartu: datar dengan garis `1px` `--color-border-subtle`.
- Bayangan `--shadow-focal` hanya dipakai pada kartu fokus (kartu login, kartu level, header belajar) dan bar navigasi sticky.
- Tombol dan node memakai bibir 3D (`tactile-brand`, `tactile-accent`, `tactile-success`, `tactile-neutral`): bayangan padat `4px` ke bawah. Saat ditekan (`:active`), posisi turun `4px` (`translateY(4px)`) dan bayangan menjadi rata.

### 5.4 Motif Identitas

Komponen React `<WovenDivider />` menampilkan tiga belah ketupat kecil berputar 45 derajat (`#C92A2A`, `#F5A623`, `#C92A2A`) yang terinspirasi selendang tenun maskot. Motif ini dipakai hemat sebagai pemisah bagian di halaman utama dan tidak dijadikan pola latar penuh.

### 5.5 Motion (MOTION 1)

| Interaksi | Perilaku |
| --- | --- |
| Tekan tombol atau node | `translateY(4px)`, durasi `80ms ease` |
| Banner hasil Lesson / Quiz | Animasi `slideUpFeedback` naik `16px`, durasi `200ms ease-out` |
| `prefers-reduced-motion` | Semua animasi dan transisi dipersingkat ke `0.01ms` |

---

## 6. Pola Komponen (Implementasi Inertia.js + React.js)

### 6.1 Learning Path (Learner)

- Jalur vertikal zig-zag per unit, diawali banner unit (`--color-brand`, teks putih, radius `20px`).
- Status node:
  - **Selesai**: `--color-success` + ikon centang putih.
  - **Aktif**: `--color-accent` berbingkai `--color-accent-border` + label `Mulai` atau `Remedial` di atasnya.
  - **Terkunci**: `--color-locked` + ikon gembok.
  - **Belum Terbit**: node nonaktif disertai label `Segera hadir (dalam validasi)`.
  - **Quiz Unit**: node piala di akhir setiap unit.
- **State Remedial Quiz Unit**: kartu `--color-accent-tint` bergaris `2px` `--color-accent-border` tampil tepat di bawah node Quiz Unit yang gagal (skor $< 75$). Menampilkan skor terakhir, daftar maksimal 3 lesson rekomendasi berdasarkan prioritas kesalahan terbanyak, dan tombol `Mulai Remedial`.

### 6.2 Lesson, Latihan, dan Quiz

- Kanvas fokus (`FocusLayout.jsx`) tanpa navigasi global, lebar maksimal `960px`.
- Header: tombol tutup (`X`), `<ProgressBar />` hijau/amber, dan indikator langkah atau nomor soal.
- Materi singkat: konten ringkas, kotak catatan, kartu kosakata, contoh kalimat, tombol `Sebelumnya` dan `Tandai Selesai & Lanjut`.
- Latihan interaktif & Quiz (berbasis komponen **React** dengan pengiriman jawaban via `router.post` / `useForm` Inertia) mendukung **4 bentuk soal**:
  1. Pilihan ganda Pasan ke Indonesia.
  2. Pilihan ganda Indonesia ke Pasan.
  3. Mencocokkan pasangan (tap kiri ke kanan dengan nomor pasangan dikelola melalui `useState` React dan penilaian parsial di server).
  4. Melengkapi ungkapan atau kalimat rumpang.
- Hasil Lesson & Quiz: skor akhir `/ 100`, badge `Lulus` atau `Belum Lulus` (ambang 75), badge XP jika baru pertama kali lulus, pembahasan per soal, serta rekomendasi remedial pada Quiz yang gagal.

### 6.3 Gamifikasi

| Peristiwa | Nilai XP |
| --- | --- |
| Lulus lesson reguler pertama kali | +10 XP |
| Menyelesaikan remedial pertama kali per lesson | +5 XP |
| Lulus Quiz Unit pertama kali | +25 XP |
| Percobaan gagal atau pengulangan yang sudah pernah lulus | +0 XP |

Badge XP memakai latar `--color-accent` dengan teks `--color-ink`.

### 6.4 Kamus, Papan Skor, dan Profil

- **Kamus:** kolom pencarian *real-time* (React debounce + `router.get` Inertia dengan `preserveState: true, replace: true`), chip filter unit (`Semua`, `Unit 1`, `Unit 2`, `Unit 3`, `Unit 4-5`), kartu kosakata dua kolom di desktop beserta arti, kategori, contoh kalimat, dan catatan validasi.
- **Papan Skor:** podium 3 teratas dan daftar peringkat lengkap dengan sorotan `--color-surface-highlight` pada baris pengguna aktif.
- **Profil:** identitas, level progres XP, lencana pencapaian (`Badge`), riwayat Quiz Unit, riwayat transaksi XP, dan tombol `Keluar`.

### 6.5 Panel Validator (React + Inertia)

- **Antrean Review:** kartu ringkasan status (`Menunggu Review`, `Disetujui`, `Perlu Revisi`, `Total`) dan filter tab daftar pengajuan.
- **Detail Pemeriksaan:** info pembatasan peran (Validator tidak dapat menerbitkan konten langsung), tautan ke Mode Pratinjau, tab `Materi & Kosakata` dan `Soal & Kunci Jawaban`, kolom `Catatan Validasi`, serta tombol `Setujui Konten` dan `Minta Revisi`.
- **Riwayat & Kamus Referensi:** riwayat keputusan validasi dan daftar seluruh kosakata termasuk yang berstatus `Menunggu Review`.

### 6.6 Panel Admin (React + Inertia)

- **Dashboard Ringkasan:** pipeline status konten 4 kolom (`Draf`, `Menunggu Review`, `Perlu Revisi`, `Terbit` + `Siap Terbit`), aksi cepat, daftar tindakan prioritas, dan ringkasan progres Learner.
- **Manajemen Unit & Lesson:** daftar 5 unit dan seluruh lesson, form tambah lesson draf, tombol ajukan validasi, serta tombol `Terbitkan` khusus untuk status `Disetujui Validator`.
- **Builder Lesson:** tab `Edit Materi & Soal` (identitas lesson dan materi) dan tab `Urutan Aktivitas` (tombol `Naik`/`Turun` via aksi Inertia dan form tambah materi/latihan). Pengubahan konten terbit menaikkan `content_version` otomatis ke `draft`.
- **Manajemen Quiz Unit:** pemilih unit, validasi rentang `15–20 soal`, pemetaan wajib tiap soal ke satu `primary_lesson_id`, kunci jawaban, pengajuan validasi, dan penerbitan.
- **Manajemen Akun Validator:** daftar status aktif/nonaktif Validator dan form tambah akun Validator baru.

### 6.7 Mode Pratinjau Learning Path (`/preview`)

- Khusus peran `admin` dan `validator`.
- Banner sticky `--color-accent-tint` bertuliskan `Mode Pratinjau: progres tidak disimpan`, pemilih filter `Semua Status` vs `Hanya Terbit`, dan tombol `Keluar Pratinjau`.
- Seluruh 5 unit, lesson, dan Quiz Unit dapat dibuka dan diuji secara *stateless* (dikelola di memori React & endpoint penilaian pratinjau tanpa mengubah progres atau XP Learner).

### 6.8 Status Antarmuka

| State | Pola |
| --- | --- |
| Loading | `<PageSkeleton />` berbasis `--color-surface-soft` (memanfaatkan `Deferred` props Inertia atau state `processing` transisi) tanpa spinner penuh layar |
| Kosong | `<EmptyState />`: ikon maskot kecil, judul singkat, deskripsi, dan satu tombol aksi |
| Error | `<ErrorState />`: kartu `--color-brand-tint` berbingkai merah dengan pesan jelas dan tombol kembali |
| Focus | Ring `2px` `--color-brand` dengan offset `2px` pada seluruh kontrol interaktif |

### 6.9 Halaman Publik dan Autentikasi

- **Welcome & Landing (`/`):** header ringkas, maskot `pasanku_logo_cream.png`, tagline, `<WovenDivider />`, tombol `MULAI BELAJAR` dan `SUDAH PUNYA AKUN`, serta 3 kartu nilai utama.
- **Login (`/login`) & Register (`/register`):** di desktop memakai tata letak 2 kolom sederhana (kiri maskot dan ajakan `Mari Belajar Pasan!`, kanan kartu formulir berbasis `useForm` Inertia); di mobile tersusun 1 kolom vertikal.

---

## 7. Navigasi dan Responsif

### 7.1 Tiga Rentang Lebar

| Rentang | Lebar | Navigasi | Tata Letak Konten |
| --- | --- | --- | --- |
| Mobile | $< 768\text{px}$ | Top bar `56px` + Bottom nav 4 tab `68px` | Satu kolom, padding horizontal `16px`, padding bawah `96px` (`pb-24`) |
| Tablet | $768\text{--}1023\text{px}$ | Sidebar kiri `224px` (`md:w-56`) | Satu kolom terpusat, padding `28px` |
| Desktop | $\ge 1024\text{px}$ | Sidebar kiri `248px` (`lg:w-[248px]`) | Konten maks `896px` + rail kanan `360px` pada `xl` (Learner home) |

Sesi belajar Lesson dan Quiz menyembunyikan navigasi global di semua rentang lebar.

### 7.2 Tab Navigasi Mobile (4 Tab)

| Peran | Tab Bawah Mobile | Aksi Top Bar Mobile |
| --- | --- | --- |
| Learner | `Belajar`, `Kamus`, `Papan Skor`, `Profil` | Badge total XP |
| Validator | `Antrean`, `Riwayat`, `Kamus`, `Pratinjau` | Tombol `Keluar` |
| Admin | `Ringkasan`, `Kurikulum`, `Quiz Unit`, `Validator` | Tombol `Pratinjau` dan `Keluar` |

---

## 8. Inventaris Rute dan Layar

| Kelompok | Rute Laravel | Halaman React (`resources/js/Pages/...`) | Kode Board Acuan (Mobile / Desktop) |
| --- | --- | --- | --- |
| Publik & Auth | `/`, `/login`, `/register` | `Welcome.jsx`, `Auth/Login.jsx`, `Auth/Register.jsx` | `01`, `02` / `D01` |
| Learner Path & Belajar | `/learner`, `/learner/lessons/{lesson}` | `Learner/LearningPath.jsx`, `Learner/LessonPlayer.jsx` | `03`, `04`, `05`, `06` / `D02`, `D03`, `D04` |
| Learner Evaluasi & Fitur | `/learner/quizzes/{unit}`, `/learner/kamus`, `/learner/papan-skor`, `/learner/profil` | `Learner/QuizPlayer.jsx`, `Learner/Dictionary.jsx`, `Learner/Leaderboard.jsx`, `Learner/Profile.jsx` | `07`, `08`, `09`, `10` / `D05`, `D06` |
| Panel Validator | `/validator`, `/validator/reviews/{type}/{id}`, `/validator/riwayat`, `/validator/kamus` | `Validator/ReviewQueue.jsx`, `Validator/ReviewDetail.jsx`, `Validator/ReviewHistory.jsx`, `Validator/ReferenceDictionary.jsx` | `MV01`, `MV02`, `MV02B`, `MV04` / `V01`, `V02` |
| Panel Admin | `/admin`, `/admin/units`, `/admin/lessons/{lesson}`, `/admin/quizzes`, `/admin/validators` | `Admin/Dashboard.jsx`, `Admin/Units.jsx`, `Admin/LessonBuilder.jsx`, `Admin/Quizzes.jsx`, `Admin/Validators.jsx` | `MA01`, `MA02`, `MA03`, `MA03B`, `MA04`, `MA05` / `A01`–`A05` |
| Mode Pratinjau | `/preview`, `/preview/lessons/{lesson}`, `/preview/quizzes/{unit}` | `Preview/PreviewPath.jsx`, `Preview/PreviewLesson.jsx`, `Preview/PreviewQuiz.jsx` | `MV03` / `MA06`, `V03` / `A06` |

---

## 9. Aset Maskot

| Berkas di `public/images/` | Ukuran | Kegunaan |
| --- | --- | --- |
| `pasanku_logo_cream.png` | `630 x 593` | Maskot utama pada Landing, Login, dan Register berlatar `#FFF9F0` |
| `pasanku_logo_full.png` | `630 x 593` | Logo maskot utuh berlatar putih untuk dokumen/presentasi |
| `pasanku_app_icon.png` | `306 x 311` | Ikon persegi pada header navigasi, sidebar, dan `<EmptyState />` |
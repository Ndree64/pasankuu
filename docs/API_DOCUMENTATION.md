# API_DOCUMENTATION.md — Pasanku

Dokumen ini mendefinisikan kontrak antarmuka server–klien untuk aplikasi **PASANKU** berbasis **Laravel + Inertia.js + React.js**. Karena menggunakan arsitektur *Modern Monolith* (tanpa REST API terpisah), seluruh komunikasi berjalan melalui **Laravel Web Routes (`routes/web.php`)**, **Inertia Page Props**, dan **Inertia Form/Action Visits** dengan autentikasi sesi dan proteksi CSRF bawaan.

## 1. Konvensi Komunikasi Inertia.js

### 1.1 Shared Props Global (`HandleInertiaRequests.php`)

Setiap respons `Inertia::render(...)` secara otomatis menyertakan objek `props` global berikut:

```
{
  "auth": {
    "user": {
      "id": "uuid",
      "username": "admin_atau_null",
      "email": "user@example.com",
      "full_name": "Nama Pengguna",
      "role": "learner | validator | admin",
      "is_active": true,
      "total_xp": 120
    }
  },
  "flash": {
    "success": "Pesan sukses opsional",
    "error": "Pesan error opsional"
  },
  "errors": {}
}

```

### 1.2 Aturan Keamanan Props (Wajib)

* **Dilarang mengirim kunci jawaban (`lesson_question_answer_keys` / `quiz_question_answer_keys`)** ke halaman React milik peran `learner`.

* **Validasi Input:** Seluruh aksi `POST`, `PUT`, `PATCH`, dan `DELETE` divalidasi melalui Laravel `FormRequest`. Error validasi otomatis dikembalikan ke `errors` pada `useForm()` React.

* **Proteksi Status HTTP:**

  * `401 / Redirect /login`: Sesi belum terautentikasi.

  * `403 Forbidden`: Peran tidak sesuai atau akun Validator nonaktif (`is_active = false`).

  * `422 Unprocessable Entity`: Kesalahan validasi formulir atau aturan bisnis (misalnya soal quiz kurang dari 15 atau masih ada tugas remedial belum selesai).

## 2. Spesifikasi Rute Publik & Autentikasi

| Method | Endpoint | Route Name | Controller / Aksi | Payload / Props Utama | 
| ----- | ----- | ----- | ----- | ----- | 
| `GET` | `/` | `welcome` | `WelcomeController@index` | Render `Welcome.jsx` | 
| `GET` | `/login` | `login` | `Auth\LoginController@create` | Render `Auth/Login.jsx` | 
| `POST` | `/login` | `login.store` | `Auth\LoginController@store` | Payload: `{ login, password, remember }` (`login` menerima email atau username). Redirect sesuai peran (`/learner`, `/validator`, `/admin`). | 
| `GET` | `/register` | `register` | `Auth\RegisterController@create` | Render `Auth/Register.jsx` | 
| `POST` | `/register` | `register.store` | `Auth\RegisterController@store` | Payload: `{ full_name, email, password, password_confirmation }`. Server menetapkan `role = 'learner'` & membuka Unit 1. | 
| `POST` | `/logout` | `logout` | `Auth\LogoutController@destroy` | Menghapus sesi, regenerasi token CSRF, redirect ke `/`. | 

## 3. Spesifikasi Rute Learner (`middleware: ['auth', 'role:learner']`)

### 3.1 Learning Path & Pembelajaran Lesson

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/learner` | `learner.home` | Render `Learner/LearningPath.jsx`. Props: `units[]` (berisi `is_unlocked`, `lessons[]` dengan status node, `quiz` dengan status & `active_remedials[]`), `summary` (`total_xp`, `level`). | 
| `GET` | `/learner/lessons/{lesson}` | `learner.lessons.show` | Render `Learner/LessonPlayer.jsx`. Query opsional: `?mode=remedial&assignment={id}`. Props: `lesson`, `attempt`, `activities[]` (materi + soal **tanpa `answer_key`**), `completed_activity_ids[]`, `mode`. | 
| `POST` | `/learner/lessons/{lesson}/activities/{activity}/complete` | `learner.lessons.activities.complete` | Menandai aktivitas `material` selesai. Payload: `{ attempt_id, mode, remedial_assignment_id? }`. | 
| `POST` | `/learner/lessons/{lesson}/responses` | `learner.lessons.responses.store` | Menyimpan dan menilai 1 soal latihan di server. Payload: `{ attempt_id, question_id, response_data }`. Mengembalikan umpan balik: `{ is_correct, earned_points, max_points, explanation }` via flash/props. | 
| `POST` | `/learner/lessons/{lesson}/finish` | `learner.lessons.finish` | Menyelesaikan percobaan lesson secara atomik (`DB::transaction`). Payload: `{ attempt_id }`. Mengembalikan hasil evaluasi: `{ score, status, xp_awarded, new_badges[], review_items[] }`. | 

### 3.2 Quiz Unit & Remedial

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/learner/quizzes/{unit}` | `learner.quizzes.show` | Memeriksa syarat akses (5 lesson lulus & tidak ada remedial aktif). Render `Learner/QuizPlayer.jsx`. Props: `unit`, `quiz`, `attempt`, `questions[]` (15–20 soal **tanpa `answer_key`**). | 
| `POST` | `/learner/quizzes/{unit}/submit` | `learner.quizzes.submit` | Mengirim seluruh jawaban quiz sekaligus. Payload: `{ attempt_id, responses: [{ question_id, response_data }] }`. Server memvalidasi kelengkapan soal, menilai, lalu jika lulus ($\ge 75$) membuka unit berikutnya + `+25 XP`; jika gagal ($< 75$) menghasilkan maksimal 3 `remedial_assignments`. | 

### 3.3 Kamus, Papan Skor, dan Profil

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/learner/kamus` | `learner.dictionary` | Render `Learner/Dictionary.jsx`. Query: `?q=&unit=all|1|2|3|4-5`. Props: `vocabularies[]` (hanya `validation_status = approved`), `filters`. | 
| `GET` | `/learner/papan-skor` | `learner.leaderboard` | Render `Learner/Leaderboard.jsx`. Props: `podium[]` (Top 3), `rankings[]` (`rank`, `user_id`, `full_name`, `total_xp`, `level`, `is_current_user`). | 
| `GET` | `/learner/profil` | `learner.profile` | Render `Learner/Profile.jsx`. Props: `profile`, `level_info`, `badges[]`, `quiz_history[]`, `xp_history[]`. | 

## 4. Spesifikasi Rute Validator (`middleware: ['auth', 'role:validator']`)

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/validator` | `validator.queue` | Render `Validator/ReviewQueue.jsx`. Query: `?status=pending|approved|changes_requested|all`. Props: `counts`, `reviews[]`. | 
| `GET` | `/validator/reviews/{type}/{id}` | `validator.reviews.show` | `{type}` bernilai `lesson` atau `quiz`. Render `Validator/ReviewDetail.jsx`. Props: `review`, `package` (seluruh materi, kosakata, soal, **beserta `answer_key`** khusus Validator). | 
| `POST` | `/validator/reviews/{review}/approve` | `validator.reviews.approve` | Menyetujui konten (`approved`). Payload: `{ review_note? }`. Tidak menerbitkan konten langsung. | 
| `POST` | `/validator/reviews/{review}/request-changes` | `validator.reviews.request-changes` | Meminta revisi (`changes_requested`). Payload: `{ review_note }` (**wajib diisi**). | 
| `GET` | `/validator/riwayat` | `validator.history` | Render `Validator/ReviewHistory.jsx`. Props: `history[]` (riwayat keputusan validasi). | 
| `GET` | `/validator/kamus` | `validator.dictionary` | Render `Validator/ReferenceDictionary.jsx`. Query: `?q=&status=`. Props: `vocabularies[]` (termasuk status `pending_review`). | 

## 5. Spesifikasi Rute Admin (`middleware: ['auth', 'role:admin']`)

### 5.1 Dashboard & Manajemen Kurikulum

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/admin` | `admin.dashboard` | Render `Admin/Dashboard.jsx`. Props: `pipeline_counts`, `priority_actions[]`, `learner_summary`. | 
| `GET` | `/admin/units` | `admin.units.index` | Render `Admin/Units.jsx`. Props: `units[]` beserta daftar `lessons[]` dan status publikasinya. | 
| `POST` | `/admin/units/{unit}/lessons` | `admin.lessons.store` | Membuat lesson draf baru. Payload: `{ title, description, objective, order_number }`. | 
| `GET` | `/admin/lessons/{lesson}` | `admin.lessons.edit` | Render `Admin/LessonBuilder.jsx`. Props: `lesson`, `activities[]` (beserta materi, kosakata, contoh, soal, dan `answer_key`), `vocabularies[]`, `is_locked` (`true` jika `pending_review`). | 
| `PUT` | `/admin/lessons/{lesson}` | `admin.lessons.update` | Memperbarui identitas lesson. Jika status `published`, server otomatis menaikkan `content_version` dan mengubah status ke `draft`. | 
| `POST` | `/admin/lessons/{lesson}/activities` | `admin.lessons.activities.store` | Menambah aktivitas `material` atau `exercise`. | 
| `PATCH` | `/admin/lessons/{lesson}/activities/reorder` | `admin.lessons.activities.reorder` | Mengubah urutan aktivitas (`Naik`/`Turun`). Payload: `{ ordered_ids: ["uuid-1", "uuid-2", ...] }`. | 
| `PUT` | `/admin/activities/{activity}/material` | `admin.activities.material.update` | Menyimpan konten materi, kosakata terkait, dan contoh kalimat. | 
| `POST` | `/admin/activities/{activity}/questions` | `admin.activities.questions.store` | Menambah soal latihan (4 tipe soal) beserta `question_data`, `answer_key`, `points`, dan `explanation`. | 
| `PUT` | `/admin/lesson-questions/{question}` | `admin.lesson-questions.update` | Memperbarui soal latihan dan kunci jawabannya. | 
| `DELETE` | `/admin/lesson-questions/{question}` | `admin.lesson-questions.destroy` | Menghapus soal latihan. | 
| `POST` | `/admin/lessons/{lesson}/submit-review` | `admin.lessons.submit-review` | Mengajukan paket lesson ke Validator (`pending_review`). | 
| `POST` | `/admin/lessons/{lesson}/cancel-review` | `admin.lessons.cancel-review` | Membatalkan pengajuan `pending_review` kembali ke `draft` agar bisa diedit. | 
| `POST` | `/admin/lessons/{lesson}/publish` | `admin.lessons.publish` | Menerbitkan lesson (hanya diizinkan jika status `approved`). | 

### 5.2 Manajemen Quiz Unit & Akun Validator

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/admin/quizzes` | `admin.quizzes.index` | Render `Admin/Quizzes.jsx`. Query: `?unit_id=`. Props: `units[]`, `selected_quiz` (beserta soal, `primary_lesson_id`, dan `answer_key`), `unit_lessons[]`. | 
| `POST` | `/admin/quizzes/{quiz}/questions` | `admin.quizzes.questions.store` | Menambah soal quiz (maks 20 soal). Payload wajib menyertakan `primary_lesson_id`, `question_type` (4 tipe), `question_data`, `answer_key`, `points`. | 
| `PUT` | `/admin/quiz-questions/{question}` | `admin.quiz-questions.update` | Memperbarui soal quiz dan kunci jawabannya. | 
| `DELETE` | `/admin/quiz-questions/{question}` | `admin.quiz-questions.destroy` | Menghapus soal quiz. | 
| `POST` | `/admin/quizzes/{quiz}/submit-review` | `admin.quizzes.submit-review` | Memvalidasi jumlah soal ($15 \le n \le 20$) dan kelengkapan `primary_lesson_id`, lalu mengubah status ke `pending_review`. | 
| `POST` | `/admin/quizzes/{quiz}/publish` | `admin.quizzes.publish` | Menerbitkan quiz unit (hanya jika status `approved`). | 
| `GET` | `/admin/validators` | `admin.validators.index` | Render `Admin/Validators.jsx`. Props: `validators[]`. | 
| `POST` | `/admin/validators` | `admin.validators.store` | Membuat akun Validator baru. Payload: `{ full_name, username, email?, password }`. | 
| `PATCH` | `/admin/validators/{profile}/toggle-status` | `admin.validators.toggle` | Mengaktifkan atau menonaktifkan akun Validator (`is_active`). | 

## 6. Spesifikasi Rute Mode Pratinjau (`middleware: ['auth', 'role:admin,validator']`)

Seluruh endpoint di bawah ini bersifat **stateless** (tidak menulis ke tabel progres, percobaan, remedial, atau XP).

| Method | Endpoint | Route Name | Deskripsi & Kontrak Props / Payload | 
| ----- | ----- | ----- | ----- | 
| `GET` | `/preview` | `preview.path` | Render `Preview/PreviewPath.jsx`. Query: `?filter=all|published`. Menampilkan seluruh 5 unit, lesson, dan quiz tanpa kunci urutan. | 
| `GET` | `/preview/lessons/{lesson}` | `preview.lessons.show` | Render `Preview/PreviewLesson.jsx`. Menampilkan seluruh aktivitas lesson tanpa membuat baris `lesson_attempts`. | 
| `POST` | `/preview/lessons/{lesson}/evaluate` | `preview.lessons.evaluate` | Menilai jawaban simulasi di memori lewat `ScoringService` dan mengembalikan skor serta pembahasan tanpa menyimpan ke DB. | 
| `GET` | `/preview/quizzes/{unit}` | `preview.quizzes.show` | Render `Preview/PreviewQuiz.jsx`. Menampilkan seluruh soal quiz unit secara stateless. | 
| `POST` | `/preview/quizzes/{unit}/evaluate` | `preview.quizzes.evaluate` | Menilai jawaban simulasi quiz dan menampilkan simulasi skor + simulasi rekomendasi remedial tanpa menyimpan ke DB. | 

## 7. Kontrak Payload JSON untuk 4 Jenis Soal

Hanya **4 jenis soal terstruktur** yang didukung oleh sistem (`LessonQuestion` & `QuizQuestion`):

### 7.1 Pilihan Ganda Pasan -> Indonesia (`mc_pasan_to_id`) & Indonesia -> Pasan (`mc_id_to_pasan`)

```
// question_data (dikirim ke React)
{
  "options": [
    { "id": "A", "label": "Selamat pagi" },
    { "id": "B", "label": "Terima kasih" },
    { "id": "C", "label": "Apa kabar" },
    { "id": "D", "label": "Sampai jumpa" }
  ]
}

// answer_key (hanya di server / panel Admin & Validator)
{ "correct_option": "B" }

// response_data (dikirim dari React Learner ke server)
{ "selected_option": "B" }

```

### 7.2 Mencocokkan Pasangan (`matching`)

```
// question_data
{
  "left_items": [
    { "id": "L1", "text": "Kata Pasan 1" },
    { "id": "L2", "text": "Kata Pasan 2" },
    { "id": "L3", "text": "Kata Pasan 3" }
  ],
  "right_items": [
    { "id": "R1", "text": "Arti Indonesia 2" },
    { "id": "R2", "text": "Arti Indonesia 1" },
    { "id": "R3", "text": "Arti Indonesia 3" }
  ]
}

// answer_key
{ "pairs": { "L1": "R2", "L2": "R1", "L3": "R3" } }

// response_data
{ "pairs": { "L1": "R2", "L2": "R3", "L3": "R1" } }

```

*Penilaian parsial:*

$$
\text{earned\_points} = \frac{\text{jumlah pasangan benar}}{\text{total pasangan}} \times \text{points}
$$

### 7.3 Melengkapi Ungkapan / Kalimat Rumpang (`fill_blank`)

```
// question_data
{
  "template": "___ kabar?",
  "choices": [
    { "id": "A", "label": "Pilihan 1" },
    { "id": "B", "label": "Pilihan 2" },
    { "id": "C", "label": "Pilihan 3" }
  ]
}

// answer_key
{ "correct_choice": "A" }

// response_data
{ "selected_choice": "A" }

```

## 8. Ringkasan Kontrak Service Layer (`app/Services/`)

| Service Method | Transaksi Atomik | Deskripsi | 
| ----- | ----- | ----- | 
| `ScoringService::gradeQuestion($question, array $responseData)` | Tidak (murni logika) | Mengembalikan `['is_correct' => bool, 'earned_points' => float]` untuk 4 tipe soal. | 
| `LearningService::startOrResumeAttempt($user, $lesson, $mode, $remedialId)` | Ya | Membuat/melanjutkan `lesson_attempts` reguler atau remedial. | 
| `LearningService::finishAttempt($attempt)` | Ya (`DB::transaction`) | Menghitung skor, validasi syarat lulus ($\ge 75$), update progres/remedial, panggil `GamificationService`. | 
| `QuizService::submitAttempt($attempt, array $responses)` | Ya (`DB::transaction`) | Menilai 15–20 soal, menentukan lulus/gagal, membuka unit berikutnya + XP jika lulus, atau memanggil `RecommendationService` jika gagal. | 
| `RecommendationService::generateFromFailedQuiz($quizAttempt)` | Ya | Mengelompokkan salah per `primary_lesson_id`, urutkan (`error_count DESC`, `order_number ASC`), simpan maks 3 `remedial_assignments`. | 
| `GamificationService::awardXpOnce($user, $type, $refId, $amount)` | Ya | Insert `xp_transactions` dengan `firstOrCreate` / unique constraint agar bebas XP ganda, lalu cek `Badge`. | 
| `ContentValidationService::submitForReview($model, $admin)` | Ya | Mengubah status ke `pending_review` dan membuat entri baru di `content_reviews`. | 
| `ContentValidationService::bumpVersionIfPublished($model)` | Ya | Menaikkan `content_version` (+1) dan mengembalikan status ke `draft` saat konten terbit diubah. | 

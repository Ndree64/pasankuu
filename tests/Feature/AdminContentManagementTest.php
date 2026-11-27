<?php

use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Enums\UserRole;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\Profile;
use App\Models\Unit;
use App\Models\UnitQuiz;
use App\Models\User;
use Database\Seeders\InitialAdminSeeder;
use Database\Seeders\InitialCurriculumSeeder;
use Illuminate\Support\Str;

test('admin can build lesson activities, reorder them, manage validators, and version published edits', function () {
    $this->seed([InitialAdminSeeder::class, InitialCurriculumSeeder::class]);

    $admin = User::where('username', 'admin')->firstOrFail();
    $this->actingAs($admin);

    $lesson = Lesson::firstOrFail();

    $this->post("/admin/lessons/{$lesson->id}/activities", [
        'activity_type' => 'material',
        'title' => 'Materi 1',
    ])->assertRedirect();

    $this->post("/admin/lessons/{$lesson->id}/activities", [
        'activity_type' => 'exercise',
        'title' => 'Latihan 1',
    ])->assertRedirect();

    $activities = LessonActivity::where('lesson_id', $lesson->id)->orderBy('order_number')->get();
    expect($activities)->toHaveCount(2);

    $this->patch("/admin/lessons/{$lesson->id}/activities/reorder", [
        'ordered_ids' => [$activities[1]->id, $activities[0]->id],
    ])->assertRedirect();

    expect($activities[1]->fresh()->order_number)->toBe(1);
    expect($activities[0]->fresh()->order_number)->toBe(2);

    $this->post("/admin/activities/{$activities[1]->id}/questions", [
        'question_type' => QuestionType::McPasanToId->value,
        'question_text' => 'Apa arti kata uji?',
        'question_data' => ['options' => [['id' => 'A', 'label' => 'Satu'], ['id' => 'B', 'label' => 'Dua']]],
        'answer_key' => ['correct_option' => 'A'],
        'points' => 10,
    ])->assertRedirect();

    $lesson->update(['status' => ContentStatus::Published]);

    $this->put("/admin/lessons/{$lesson->id}", [
        'title' => 'Judul Revisi',
        'description' => 'Deskripsi baru',
        'objective' => 'Tujuan baru',
    ])->assertRedirect();

    $lesson->refresh();
    expect($lesson->content_version)->toBe(2);
    expect($lesson->status)->toBe(ContentStatus::Draft);

    $this->post('/admin/validators', [
        'full_name' => 'Validator Baru',
        'username' => 'validator_baru',
        'password' => 'password123',
    ])->assertRedirect();

    $newValidator = Profile::where('full_name', 'Validator Baru')->firstOrFail();
    expect($newValidator->role)->toBe(UserRole::Validator);
    expect($newValidator->user->username)->toBe('validator_baru');
    expect($newValidator->user->email)->toBeNull();
    expect($newValidator->is_active)->toBeTrue();

    $this->patch("/admin/validators/{$newValidator->id}/toggle-status")->assertRedirect();
    expect($newValidator->fresh()->is_active)->toBeFalse();
});

test('admin cannot submit unit quiz for review unless it has 15 to 20 questions mapped to unit lessons', function () {
    $this->seed([InitialAdminSeeder::class, InitialCurriculumSeeder::class]);

    $admin = User::where('username', 'admin')->firstOrFail();
    $this->actingAs($admin);

    $unit = Unit::where('order_number', 1)->firstOrFail();
    $quiz = UnitQuiz::where('unit_id', $unit->id)->firstOrFail();
    $lesson = Lesson::where('unit_id', $unit->id)->firstOrFail();

    for ($i = 1; $i <= 14; $i++) {
        $this->post("/admin/quizzes/{$quiz->id}/questions", [
            'primary_lesson_id' => $lesson->id,
            'question_type' => QuestionType::McPasanToId->value,
            'question_text' => "Soal {$i}",
            'question_data' => ['options' => [['id' => 'A', 'label' => 'A'], ['id' => 'B', 'label' => 'B']]],
            'answer_key' => ['correct_option' => 'A'],
            'points' => 10,
        ])->assertRedirect();
    }

    $this->post("/admin/quizzes/{$quiz->id}/submit-review")
        ->assertSessionHasErrors('questions');

    $this->post("/admin/quizzes/{$quiz->id}/questions", [
        'primary_lesson_id' => $lesson->id,
        'question_type' => QuestionType::McPasanToId->value,
        'question_text' => 'Soal 15',
        'question_data' => ['options' => [['id' => 'A', 'label' => 'A'], ['id' => 'B', 'label' => 'B']]],
        'answer_key' => ['correct_option' => 'A'],
        'points' => 10,
    ])->assertRedirect();

    $this->post("/admin/quizzes/{$quiz->id}/submit-review")
        ->assertSessionHasNoErrors();

    expect($quiz->fresh()->status)->toBe(ContentStatus::PendingReview);
});

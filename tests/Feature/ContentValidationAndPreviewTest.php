<?php

use App\Enums\ActivityType;
use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Models\ContentReview;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\LessonAttempt;
use App\Models\QuizAttempt;
use App\Models\RemedialAssignment;
use App\Models\Unit;
use App\Models\User;
use App\Models\XpTransaction;
use Database\Seeders\InitialAdminSeeder;
use Database\Seeders\InitialCurriculumSeeder;

test('content follows draft -> pending_review -> changes_requested -> approved -> published lifecycle', function () {
    $this->seed([InitialAdminSeeder::class, InitialCurriculumSeeder::class]);

    $admin = User::where('email', 'admin@pasanku.test')->firstOrFail();
    $validator = User::where('email', 'validator@pasanku.test')->firstOrFail();
    $lesson = Lesson::firstOrFail();

    // Admin submits for review
    $this->actingAs($admin)
        ->post("/admin/lessons/{$lesson->id}/submit-review")
        ->assertRedirect();

    expect($lesson->fresh()->status)->toBe(ContentStatus::PendingReview);

    // Locked while pending_review
    $this->actingAs($admin)
        ->put("/admin/lessons/{$lesson->id}", ['title' => 'Tidak Boleh Ubah'])
        ->assertSessionHasErrors('status');

    // Admin cannot publish unapproved lesson
    $this->actingAs($admin)
        ->post("/admin/lessons/{$lesson->id}/publish")
        ->assertSessionHasErrors('status');

    // Validator cannot publish directly
    $this->actingAs($validator)
        ->post("/admin/lessons/{$lesson->id}/publish")
        ->assertForbidden();

    $review = ContentReview::where('lesson_id', $lesson->id)->firstOrFail();

    // Validator requests changes with note
    $this->actingAs($validator)
        ->post("/validator/reviews/{$review->id}/request-changes", ['review_note' => 'Perbaiki ejaan'])
        ->assertRedirect();

    expect($lesson->fresh()->status)->toBe(ContentStatus::ChangesRequested);

    // Admin resubmits, Validator approves, Admin publishes
    $this->actingAs($admin)->post("/admin/lessons/{$lesson->id}/submit-review")->assertRedirect();
    $review2 = ContentReview::where('lesson_id', $lesson->id)
        ->where('status', 'pending')
        ->firstOrFail();

    $this->actingAs($validator)->post("/validator/reviews/{$review2->id}/approve")->assertRedirect();
    expect($lesson->fresh()->status)->toBe(ContentStatus::Approved);

    $this->actingAs($admin)->post("/admin/lessons/{$lesson->id}/publish")->assertRedirect();
    expect($lesson->fresh()->status)->toBe(ContentStatus::Published);
});

test('preview mode is stateless and writes no learner progress, attempts, remedials, or xp', function () {
    $this->seed([InitialAdminSeeder::class, InitialCurriculumSeeder::class]);

    $validator = User::where('email', 'validator@pasanku.test')->firstOrFail();
    $lesson = Lesson::firstOrFail();
    $unit = Unit::findOrFail($lesson->unit_id);

    $activity = $lesson->activities()->create([
        'activity_type' => ActivityType::Exercise,
        'title' => 'Latihan Pratinjau',
        'order_number' => 1,
        'is_required' => true,
    ]);
    $question = $activity->questions()->create([
        'question_type' => QuestionType::McPasanToId,
        'question_text' => 'Pertanyaan Pratinjau',
        'question_data' => ['options' => [['id' => 'A', 'label' => 'Ya']]],
        'points' => 10,
        'order_number' => 1,
    ]);
    $question->answerKey()->create(['answer_key' => ['correct_option' => 'A']]);

    $this->actingAs($validator);

    $this->get('/preview')->assertOk();
    $this->get("/preview/lessons/{$lesson->id}")->assertOk();
    $this->post("/preview/lessons/{$lesson->id}/evaluate", [
        'responses' => [$question->id => ['selected_option' => 'A']],
    ])->assertSessionHas('preview_result');

    $this->post("/preview/quizzes/{$unit->id}/evaluate", ['responses' => []])
        ->assertSessionHas('preview_result');

    expect(LessonAttempt::count())->toBe(0);
    expect(QuizAttempt::count())->toBe(0);
    expect(LearnerLessonProgress::count())->toBe(0);
    expect(RemedialAssignment::count())->toBe(0);
    expect(XpTransaction::count())->toBe(0);
});

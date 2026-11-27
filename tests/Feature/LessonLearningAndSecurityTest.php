<?php

use App\Enums\ActivityType;
use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Models\Lesson;
use App\Models\LessonAttempt;
use App\Models\Unit;
use App\Models\User;
use App\Models\XpTransaction;
use Database\Seeders\BadgeSeeder;
use Database\Seeders\InitialCurriculumSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function registerLearner($test, string $email = 'siswa@example.com'): User
{
    $test->post('/register', [
        'full_name' => 'Siswa Uji',
        'email' => $email,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/learner');

    return User::where('email', $email)->firstOrFail();
}

test('unpublished lessons are hidden from learner and answer keys never appear in learner inertia props', function () {
    $this->seed([InitialCurriculumSeeder::class, BadgeSeeder::class]);
    $learner = registerLearner($this);

    $unit1 = Unit::where('order_number', 1)->firstOrFail();
    $lesson1 = Lesson::where('unit_id', $unit1->id)->where('order_number', 1)->firstOrFail();

    // Draft lesson cannot be opened
    $this->get("/learner/lessons/{$lesson1->id}")->assertNotFound();

    // Add material + exercise with secret answer_key and publish
    $matAct = $lesson1->activities()->create([
        'activity_type' => ActivityType::Material,
        'title' => 'Materi 1',
        'order_number' => 1,
        'is_required' => true,
    ]);
    $matAct->material()->create(['content' => 'Konten materi']);

    $exAct = $lesson1->activities()->create([
        'activity_type' => ActivityType::Exercise,
        'title' => 'Latihan 1',
        'order_number' => 2,
        'is_required' => true,
    ]);
    $question = $exAct->questions()->create([
        'question_type' => QuestionType::McPasanToId,
        'question_text' => 'Pilih opsi rahasia',
        'question_data' => ['options' => [['id' => 'A', 'label' => 'Salah'], ['id' => 'B', 'label' => 'Benar']]],
        'explanation' => 'Pembahasan rahasia',
        'points' => 10,
        'order_number' => 1,
    ]);
    $question->answerKey()->create(['answer_key' => ['correct_option' => 'B', 'secret_marker' => 'DO_NOT_LEAK']]);
    $lesson1->update(['status' => ContentStatus::Published]);

    $response = $this->get("/learner/lessons/{$lesson1->id}");
    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Learner/LessonPlayer')
        ->missing('activities.0.questions.0.answer_key')
        ->missing('activities.1.questions.0.answer_key')
        ->missing('activities.1.questions.0.explanation')
    );

    expect($response->getContent())->not->toContain('DO_NOT_LEAK');
    expect($response->getContent())->not->toContain('correct_option');

    // Attempt 1: fail (< 75) -> 0 XP
    $attemptId = LessonAttempt::firstOrFail()->id;
    $this->post("/learner/lessons/{$lesson1->id}/activities/{$matAct->id}/complete", ['attempt_id' => $attemptId]);
    $this->post("/learner/lessons/{$lesson1->id}/responses", [
        'attempt_id' => $attemptId,
        'question_id' => $question->id,
        'response_data' => ['selected_option' => 'A'],
    ]);
    $this->post("/learner/lessons/{$lesson1->id}/finish", ['attempt_id' => $attemptId])
        ->assertSessionHas('lesson_result', fn ($res) => $res['status'] === 'failed' && $res['xp_awarded'] === 0);

    // Attempt 2: pass (>= 75) -> +10 XP
    $this->get("/learner/lessons/{$lesson1->id}")->assertOk();
    $attempt2Id = LessonAttempt::orderByDesc('attempt_number')->firstOrFail()->id;
    $this->post("/learner/lessons/{$lesson1->id}/responses", [
        'attempt_id' => $attempt2Id,
        'question_id' => $question->id,
        'response_data' => ['selected_option' => 'B'],
    ]);
    $this->post("/learner/lessons/{$lesson1->id}/finish", ['attempt_id' => $attempt2Id])
        ->assertSessionHas('lesson_result', fn ($res) => $res['status'] === 'passed' && $res['xp_awarded'] === 10);

    // Attempt 3: repeat pass -> +0 XP
    $this->get("/learner/lessons/{$lesson1->id}")->assertOk();
    $attempt3Id = LessonAttempt::orderByDesc('attempt_number')->firstOrFail()->id;
    $this->post("/learner/lessons/{$lesson1->id}/responses", [
        'attempt_id' => $attempt3Id,
        'question_id' => $question->id,
        'response_data' => ['selected_option' => 'B'],
    ]);
    $this->post("/learner/lessons/{$lesson1->id}/finish", ['attempt_id' => $attempt3Id])
        ->assertSessionHas('lesson_result', fn ($res) => $res['status'] === 'passed' && $res['xp_awarded'] === 0);

    expect(XpTransaction::where('user_id', $learner->id)->sum('xp_amount'))->toBe(10);
});

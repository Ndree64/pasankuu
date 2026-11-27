<?php

use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Enums\RemedialStatus;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\LessonAttempt;
use App\Models\QuizAttempt;
use App\Models\RemedialAssignment;
use App\Models\Unit;
use App\Models\UnitQuiz;
use App\Models\UnitUnlock;
use App\Models\User;
use App\Models\XpTransaction;
use Database\Seeders\BadgeSeeder;
use Database\Seeders\InitialCurriculumSeeder;

test('unit quiz requires all 5 lessons, blocks retake until remedials complete, and unlocks next unit on pass', function () {
    $this->seed([InitialCurriculumSeeder::class, BadgeSeeder::class]);

    $this->post('/register', [
        'full_name' => 'Pejuang Quiz',
        'email' => 'quiz@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/learner');

    $user = User::where('email', 'quiz@example.com')->firstOrFail();
    $unit1 = Unit::where('order_number', 1)->firstOrFail();
    $unit2 = Unit::where('order_number', 2)->firstOrFail();
    $lessons = Lesson::where('unit_id', $unit1->id)->orderBy('order_number')->get();
    $quiz = UnitQuiz::where('unit_id', $unit1->id)->firstOrFail();

    // Publish all 5 lessons (with 1 simple question each for remedial testing) & mark regular progress complete
    foreach ($lessons as $lesson) {
        $act = $lesson->activities()->create([
            'activity_type' => 'exercise',
            'title' => 'Latihan',
            'order_number' => 1,
            'is_required' => true,
        ]);
        $lq = $act->questions()->create([
            'question_type' => QuestionType::McPasanToId,
            'question_text' => 'Soal remedial',
            'question_data' => ['options' => [['id' => 'A', 'label' => 'Benar'], ['id' => 'B', 'label' => 'Salah']]],
            'points' => 10,
            'order_number' => 1,
        ]);
        $lq->answerKey()->create(['answer_key' => ['correct_option' => 'A']]);
        $lesson->update(['status' => ContentStatus::Published]);
    }

    // Populate 15 quiz questions (3 per lesson) & publish quiz
    $quizQuestions = collect();
    $order = 1;
    foreach ($lessons as $lesson) {
        for ($i = 0; $i < 3; $i++) {
            $qq = $quiz->questions()->create([
                'primary_lesson_id' => $lesson->id,
                'question_type' => QuestionType::McPasanToId,
                'question_text' => "Quiz Q{$order}",
                'question_data' => ['options' => [['id' => 'A', 'label' => 'Benar'], ['id' => 'B', 'label' => 'Salah']]],
                'points' => 10,
                'order_number' => $order++,
            ]);
            $qq->answerKey()->create(['answer_key' => ['correct_option' => 'A']]);
            $quizQuestions->push($qq);
        }
    }
    $quiz->update(['status' => ContentStatus::Published]);

    // Blocked before 5 lessons completed
    $this->get("/learner/quizzes/{$unit1->id}")->assertStatus(422);

    // Complete 5 lessons regularly
    foreach ($lessons as $lesson) {
        LearnerLessonProgress::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed_content_version' => 1,
            'best_score' => 100,
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    // Start & Fail Quiz (< 75)
    $this->get("/learner/quizzes/{$unit1->id}")->assertOk();
    $attempt1 = QuizAttempt::firstOrFail();

    $wrongResponses = $quizQuestions->map(fn ($qq) => [
        'question_id' => $qq->id,
        'response_data' => ['selected_option' => 'B'],
    ])->toArray();

    $this->post("/learner/quizzes/{$unit1->id}/submit", [
        'attempt_id' => $attempt1->id,
        'responses' => $wrongResponses,
    ])->assertSessionHas('quiz_result', fn ($res) => $res['status'] === 'failed');

    $remedials = RemedialAssignment::where('user_id', $user->id)->get();
    expect($remedials)->toHaveCount(3);

    // Retaking quiz is blocked while remedial pending
    $this->get("/learner/quizzes/{$unit1->id}")->assertStatus(422);

    // Complete all 3 remedials
    foreach ($remedials as $remedial) {
        $this->get("/learner/lessons/{$remedial->lesson_id}?mode=remedial&assignment={$remedial->id}")->assertOk();
        $remAttempt = LessonAttempt::where('remedial_assignment_id', $remedial->id)->firstOrFail();
        $lq = $remedial->lesson->activities()->first()->questions()->first();

        $this->post("/learner/lessons/{$remedial->lesson_id}/responses", [
            'attempt_id' => $remAttempt->id,
            'question_id' => $lq->id,
            'response_data' => ['selected_option' => 'A'],
        ]);
        $this->post("/learner/lessons/{$remedial->lesson_id}/finish", [
            'attempt_id' => $remAttempt->id,
        ])->assertSessionHas('lesson_result', fn ($res) => $res['status'] === 'passed' && $res['xp_awarded'] === 5);

        expect($remedial->fresh()->status)->toBe(RemedialStatus::Completed);
        expect(LearnerLessonProgress::where('user_id', $user->id)->where('lesson_id', $remedial->lesson_id)->first()->best_score)->toBe(100.0);
    }

    // Quiz retake unlocked & pass unlocks Unit 2 + 25 XP
    $this->get("/learner/quizzes/{$unit1->id}")->assertOk();
    $attempt2 = QuizAttempt::orderByDesc('attempt_number')->firstOrFail();

    $correctResponses = $quizQuestions->map(fn ($qq) => [
        'question_id' => $qq->id,
        'response_data' => ['selected_option' => 'A'],
    ])->toArray();

    $this->post("/learner/quizzes/{$unit1->id}/submit", [
        'attempt_id' => $attempt2->id,
        'responses' => $correctResponses,
    ])->assertSessionHas('quiz_result', fn ($res) => $res['status'] === 'passed' && $res['xp_awarded'] === 25);

    expect(UnitUnlock::where('user_id', $user->id)->where('unit_id', $unit2->id)->exists())->toBeTrue();
    expect(XpTransaction::where('user_id', $user->id)->sum('xp_amount'))->toBe(40); // 3*5 remedial + 25 quiz
});

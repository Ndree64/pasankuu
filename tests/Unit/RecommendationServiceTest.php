<?php

use App\Enums\AttemptStatus;
use App\Enums\QuestionType;
use App\Enums\UserRole;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizResponse;
use App\Models\Unit;
use App\Models\UnitQuiz;
use App\Models\User;
use App\Services\RecommendationService;
use Database\Seeders\InitialCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('recommendation service groups errors by primary_lesson_id, breaks ties by order_number, and caps at 3', function () {
    $this->seed(InitialCurriculumSeeder::class);

    $user = User::create(['email' => 'rec@example.com', 'password' => Hash::make('password123')]);
    $profile = Profile::create(['id' => $user->id, 'full_name' => 'Learner Rec', 'role' => UserRole::Learner, 'is_active' => true]);

    $unit = Unit::where('order_number', 1)->firstOrFail();
    $lessons = Lesson::where('unit_id', $unit->id)->orderBy('order_number')->get()->keyBy('order_number');
    $quiz = UnitQuiz::where('unit_id', $unit->id)->firstOrFail();

    $attempt = QuizAttempt::create([
        'user_id' => $profile->id,
        'quiz_id' => $quiz->id,
        'attempt_number' => 1,
        'status' => AttemptStatus::Failed,
        'score' => 40,
        'content_version' => 1,
        'started_at' => now(),
        'completed_at' => now(),
    ]);

    // Errors: Lesson 4 (2 errors), Lesson 2 (2 errors -> tie-breaker puts Lesson 2 before Lesson 4),
    // Lesson 5 (3 errors -> highest priority #1), Lesson 1 (1 error -> dropped by cap of 3)
    $errorDistribution = [1 => 1, 2 => 2, 4 => 2, 5 => 3];
    $order = 1;
    foreach ($errorDistribution as $lessonOrder => $wrongCount) {
        for ($i = 0; $i < $wrongCount; $i++) {
            $q = QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'primary_lesson_id' => $lessons[$lessonOrder]->id,
                'question_type' => QuestionType::McPasanToId,
                'question_text' => "Soal {$order}",
                'question_data' => ['options' => [['id' => 'A', 'label' => 'A']]],
                'points' => 10,
                'order_number' => $order++,
            ]);
            QuizResponse::create([
                'attempt_id' => $attempt->id,
                'question_id' => $q->id,
                'response_data' => ['selected_option' => 'B'],
                'is_correct' => false,
                'earned_points' => 0,
                'submitted_at' => now(),
            ]);
        }
    }

    $recommendations = (new RecommendationService())->generateFromFailedQuiz($attempt);

    expect($recommendations)->toHaveCount(3);
    expect($recommendations[0]->lesson_id)->toBe($lessons[5]->id);
    expect($recommendations[0]->error_count)->toBe(3);
    expect($recommendations[1]->lesson_id)->toBe($lessons[2]->id);
    expect($recommendations[2]->lesson_id)->toBe($lessons[4]->id);
});

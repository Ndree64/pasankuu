<?php

namespace App\Services;

use App\Enums\AttemptStatus;
use App\Enums\XpActivityType;
use App\Models\Profile;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\QuizResponse;
use App\Models\Unit;
use App\Models\UnitUnlock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuizService
{
    public function __construct(
        private AccessControlService $accessControlService,
        private ScoringService $scoringService,
        private RecommendationService $recommendationService,
        private GamificationService $gamificationService,
    ) {
    }

    public function startOrResumeAttempt(Profile $profile, Unit $unit): QuizAttempt
    {
        $eligibility = $this->accessControlService->canStartUnitQuiz($profile, $unit);
        if (! $eligibility['allowed']) {
            throw ValidationException::withMessages([
                'quiz' => $eligibility['reason'],
            ]);
        }

        $quiz = $unit->quiz;

        return DB::transaction(function () use ($profile, $quiz) {
            $existing = QuizAttempt::where('user_id', $profile->id)
                ->where('quiz_id', $quiz->id)
                ->where('status', AttemptStatus::InProgress)
                ->first();

            if ($existing) {
                return $existing;
            }

            $nextAttemptNumber = (int) QuizAttempt::where('user_id', $profile->id)
                ->where('quiz_id', $quiz->id)
                ->max('attempt_number') + 1;

            return QuizAttempt::create([
                'user_id' => $profile->id,
                'quiz_id' => $quiz->id,
                'attempt_number' => $nextAttemptNumber,
                'status' => AttemptStatus::InProgress,
                'content_version' => $quiz->content_version,
                'started_at' => now(),
            ]);
        });
    }

    public function submitAttempt(QuizAttempt $attempt, array $responsesInput): array
    {
        if ($attempt->status !== AttemptStatus::InProgress) {
            throw ValidationException::withMessages([
                'attempt' => 'Percobaan quiz ini sudah selesai.',
            ]);
        }

        return DB::transaction(function () use ($attempt, $responsesInput) {
            $quiz = $attempt->quiz()->with(['unit', 'questions.answerKey', 'questions.primaryLesson:id,title,order_number'])->firstOrFail();
            $questions = $quiz->questions;

            $mappedInput = collect($responsesInput)->keyBy('question_id');

            foreach ($questions as $question) {
                $item = $mappedInput->get($question->id);
                if (! $item || empty($item['response_data'])) {
                    throw ValidationException::withMessages([
                        'responses' => 'Semua soal quiz wajib dijawab sebelum dikirim.',
                    ]);
                }
            }

            $totalMax = 0.0;
            $totalEarned = 0.0;
            $reviewItems = [];

            foreach ($questions as $question) {
                $responseData = $mappedInput->get($question->id)['response_data'];
                $grade = $this->scoringService->gradeQuestion($question, $responseData);

                QuizResponse::updateOrCreate(
                    [
                        'attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'response_data' => $responseData,
                        'is_correct' => $grade['is_correct'],
                        'earned_points' => $grade['earned_points'],
                        'submitted_at' => now(),
                    ]
                );

                $totalMax += (float) $question->points;
                $totalEarned += (float) $grade['earned_points'];

                $reviewItems[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'is_correct' => $grade['is_correct'],
                    'earned_points' => $grade['earned_points'],
                    'max_points' => (float) $question->points,
                    'explanation' => $question->explanation,
                    'primary_lesson_title' => $question->primaryLesson?->title,
                ];
            }

            $score = $this->scoringService->calculatePercentage($totalEarned, $totalMax);
            $passed = $score >= (float) $quiz->passing_score;
            $status = $passed ? AttemptStatus::Passed : AttemptStatus::Failed;

            $attempt->update([
                'score' => $score,
                'status' => $status,
                'completed_at' => now(),
            ]);

            $profile = $attempt->profile;
            $xpAwarded = 0;
            $newBadges = [];
            $unlockedNextUnit = null;
            $remedials = [];

            if ($passed) {
                $nextUnit = Unit::where('order_number', $quiz->unit->order_number + 1)->first();
                if ($nextUnit) {
                    UnitUnlock::firstOrCreate(
                        [
                            'user_id' => $profile->id,
                            'unit_id' => $nextUnit->id,
                        ],
                        ['unlocked_at' => now()]
                    );
                    $unlockedNextUnit = [
                        'id' => $nextUnit->id,
                        'title' => $nextUnit->title,
                        'order_number' => $nextUnit->order_number,
                    ];
                }

                $xpAwarded = $this->gamificationService->awardXpOnce(
                    $profile,
                    XpActivityType::Quiz,
                    $quiz->id,
                    GamificationService::XP_QUIZ
                );
                $newBadges = $this->gamificationService->checkAndAwardBadges($profile);
            } else {
                $generated = $this->recommendationService->generateFromFailedQuiz($attempt);
                $remedials = $generated->map(function ($r) {
                    $r->loadMissing('lesson:id,title,order_number');
                    return [
                        'id' => $r->id,
                        'lesson_id' => $r->lesson_id,
                        'lesson_title' => $r->lesson?->title,
                        'lesson_order' => $r->lesson?->order_number,
                        'error_count' => $r->error_count,
                        'priority_order' => $r->priority_order,
                    ];
                })->values()->toArray();
            }

            return [
                'score' => $score,
                'status' => $status->value,
                'xp_awarded' => $xpAwarded,
                'new_badges' => $newBadges,
                'unlocked_next_unit' => $unlockedNextUnit,
                'remedials' => $remedials,
                'review_items' => $reviewItems,
            ];
        });
    }
}

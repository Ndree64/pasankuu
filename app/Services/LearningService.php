<?php

namespace App\Services;

use App\Enums\ActivityType;
use App\Enums\AttemptStatus;
use App\Enums\RemedialStatus;
use App\Enums\XpActivityType;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\LessonActivityProgress;
use App\Models\LessonAttempt;
use App\Models\LessonQuestion;
use App\Models\LessonResponse;
use App\Models\Profile;
use App\Models\RemedialAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LearningService
{
    public function __construct(
        private ScoringService $scoringService,
        private GamificationService $gamificationService,
    ) {
    }

    public function startOrResumeAttempt(
        Profile $profile,
        Lesson $lesson,
        string $mode = 'regular',
        ?RemedialAssignment $remedial = null
    ): LessonAttempt {
        return DB::transaction(function () use ($profile, $lesson, $mode, $remedial) {
            $query = LessonAttempt::where('user_id', $profile->id)
                ->where('lesson_id', $lesson->id)
                ->where('attempt_type', $mode)
                ->where('status', AttemptStatus::InProgress);

            if ($mode === 'remedial' && $remedial) {
                $query->where('remedial_assignment_id', $remedial->id);
                if ($remedial->status === RemedialStatus::Pending) {
                    $remedial->update(['status' => RemedialStatus::InProgress]);
                }
            }

            $existing = $query->first();
            if ($existing) {
                return $existing;
            }

            $nextAttemptNumber = (int) LessonAttempt::where('user_id', $profile->id)
                ->where('lesson_id', $lesson->id)
                ->max('attempt_number') + 1;

            return LessonAttempt::create([
                'user_id' => $profile->id,
                'lesson_id' => $lesson->id,
                'attempt_type' => $mode,
                'remedial_assignment_id' => $mode === 'remedial' ? $remedial?->id : null,
                'attempt_number' => $nextAttemptNumber,
                'status' => AttemptStatus::InProgress,
                'content_version' => $lesson->content_version,
                'started_at' => now(),
            ]);
        });
    }

    public function completeActivity(
        Profile $profile,
        Lesson $lesson,
        LessonActivity $activity,
        LessonAttempt $attempt
    ): void {
        LessonActivityProgress::updateOrCreate(
            [
                'user_id' => $profile->id,
                'lesson_id' => $lesson->id,
                'activity_id' => $activity->id,
                'progress_type' => $attempt->attempt_type,
                'remedial_assignment_id' => $attempt->remedial_assignment_id,
            ],
            [
                'status' => 'completed',
                'completed_at' => now(),
            ]
        );
    }

    public function submitResponse(LessonAttempt $attempt, LessonQuestion $question, array $responseData): array
    {
        if ($attempt->status !== AttemptStatus::InProgress) {
            throw ValidationException::withMessages([
                'attempt' => 'Percobaan lesson ini sudah selesai.',
            ]);
        }

        $result = $this->scoringService->gradeQuestion($question, $responseData);

        DB::transaction(function () use ($attempt, $question, $responseData, $result) {
            LessonResponse::updateOrCreate(
                [
                    'attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                ],
                [
                    'response_data' => $responseData,
                    'is_correct' => $result['is_correct'],
                    'earned_points' => $result['earned_points'],
                    'submitted_at' => now(),
                ]
            );

            $activity = $question->activity;
            $totalQuestionsInActivity = $activity->questions()->count();
            $answeredCount = LessonResponse::where('attempt_id', $attempt->id)
                ->whereIn('question_id', $activity->questions()->pluck('id'))
                ->count();

            if ($answeredCount >= $totalQuestionsInActivity) {
                $this->completeActivity($attempt->profile, $attempt->lesson, $activity, $attempt);
            }
        });

        return [
            'is_correct' => $result['is_correct'],
            'earned_points' => $result['earned_points'],
            'max_points' => (float) $question->points,
            'explanation' => $question->explanation,
        ];
    }

    public function finishAttempt(LessonAttempt $attempt): array
    {
        return DB::transaction(function () use ($attempt) {
            $lesson = $attempt->lesson()->with(['activities.questions'])->firstOrFail();
            $profile = $attempt->profile;

            $requiredMaterials = $lesson->activities
                ->where('activity_type', ActivityType::Material)
                ->where('is_required', true);

            $completedActivityIds = LessonActivityProgress::where('user_id', $profile->id)
                ->where('lesson_id', $lesson->id)
                ->where('progress_type', $attempt->attempt_type)
                ->where('remedial_assignment_id', $attempt->remedial_assignment_id)
                ->where('status', 'completed')
                ->pluck('activity_id');

            foreach ($requiredMaterials as $materialActivity) {
                if (! $completedActivityIds->contains($materialActivity->id)) {
                    throw ValidationException::withMessages([
                        'materials' => 'Selesaikan seluruh aktivitas materi terlebih dahulu sebelum mengakhiri lesson.',
                    ]);
                }
            }

            $allQuestions = $lesson->activities
                ->where('activity_type', ActivityType::Exercise)
                ->flatMap(fn (LessonActivity $act) => $act->questions);

            $responses = LessonResponse::where('attempt_id', $attempt->id)->get()->keyBy('question_id');

            if ($allQuestions->isNotEmpty() && $responses->count() < $allQuestions->count()) {
                throw ValidationException::withMessages([
                    'questions' => 'Seluruh soal latihan wajib dijawab sebelum menyelesaikan lesson.',
                ]);
            }

            $maxPoints = (float) $allQuestions->sum('points');
            $earnedPoints = (float) $responses->sum('earned_points');
            $score = $allQuestions->isEmpty()
                ? 100.0
                : $this->scoringService->calculatePercentage($earnedPoints, $maxPoints);

            $passed = $score >= 75.0;
            $status = $passed ? AttemptStatus::Passed : AttemptStatus::Failed;

            $attempt->update([
                'score' => $score,
                'status' => $status,
                'completed_at' => now(),
            ]);

            $xpAwarded = 0;

            if ($passed && $attempt->attempt_type === 'regular') {
                $existingProgress = LearnerLessonProgress::where('user_id', $profile->id)
                    ->where('lesson_id', $lesson->id)
                    ->first();

                $bestScore = $existingProgress
                    ? max((float) ($existingProgress->best_score ?? 0), $score)
                    : $score;

                LearnerLessonProgress::updateOrCreate(
                    [
                        'user_id' => $profile->id,
                        'lesson_id' => $lesson->id,
                    ],
                    [
                        'completed_content_version' => $lesson->content_version,
                        'best_score' => $bestScore,
                        'status' => 'completed',
                        'completed_at' => $existingProgress?->completed_at ?? now(),
                    ]
                );

                $xpAwarded = $this->gamificationService->awardXpOnce(
                    $profile,
                    XpActivityType::Lesson,
                    $lesson->id,
                    GamificationService::XP_LESSON
                );
            }

            if ($passed && $attempt->attempt_type === 'remedial' && $attempt->remedial_assignment_id) {
                RemedialAssignment::where('id', $attempt->remedial_assignment_id)->update([
                    'status' => RemedialStatus::Completed,
                    'completed_at' => now(),
                ]);

                $xpAwarded = $this->gamificationService->awardXpOnce(
                    $profile,
                    XpActivityType::Remedial,
                    $lesson->id,
                    GamificationService::XP_REMEDIAL
                );
            }

            $newBadges = $passed ? $this->gamificationService->checkAndAwardBadges($profile) : [];

            $reviewItems = $allQuestions->map(function (LessonQuestion $q) use ($responses) {
                $resp = $responses->get($q->id);
                return [
                    'question_id' => $q->id,
                    'question_text' => $q->question_text,
                    'is_correct' => (bool) ($resp?->is_correct ?? false),
                    'earned_points' => (float) ($resp?->earned_points ?? 0),
                    'max_points' => (float) $q->points,
                    'explanation' => $q->explanation,
                ];
            })->values();

            return [
                'score' => $score,
                'status' => $status->value,
                'xp_awarded' => $xpAwarded,
                'new_badges' => $newBadges,
                'review_items' => $reviewItems,
            ];
        });
    }
}

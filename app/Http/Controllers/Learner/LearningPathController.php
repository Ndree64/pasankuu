<?php

namespace App\Http\Controllers\Learner;

use App\Enums\AttemptStatus;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use App\Models\Unit;
use App\Services\AccessControlService;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningPathController extends Controller
{
    public function __construct(
        private AccessControlService $accessControlService,
        private GamificationService $gamificationService,
    ) {
    }

    public function index(Request $request): Response
    {
        $profile = $request->user()->profile;

        $units = Unit::with([
            'lessons' => fn ($q) => $q->orderBy('order_number'),
            'quiz',
        ])
            ->where('status', ContentStatus::Published)
            ->orderBy('order_number')
            ->get();

        $completedProgress = LearnerLessonProgress::where('user_id', $profile->id)
            ->where('status', 'completed')
            ->get()
            ->keyBy('lesson_id');

        $passedQuizIds = QuizAttempt::where('user_id', $profile->id)
            ->where('status', AttemptStatus::Passed)
            ->pluck('quiz_id')
            ->unique();

        $totalPublishedLessons = 0;
        $completedPublishedLessons = 0;

        $unitsPayload = $units->map(function (Unit $unit) use (
            $profile,
            $completedProgress,
            $passedQuizIds,
            &$totalPublishedLessons,
            &$completedPublishedLessons
        ) {
            $unitUnlocked = $this->accessControlService->isUnitUnlocked($profile, $unit);

            $lessonsPayload = $unit->lessons->map(function (Lesson $lesson) use (
                $profile,
                $unitUnlocked,
                $completedProgress,
                &$totalPublishedLessons,
                &$completedPublishedLessons
            ) {
                $isPublished = $lesson->status === ContentStatus::Published;
                if ($isPublished) {
                    $totalPublishedLessons++;
                }

                $progress = $completedProgress->get($lesson->id);
                $isCompleted = $isPublished
                    && $progress
                    && (int) $progress->completed_content_version === (int) $lesson->content_version;

                if ($isCompleted) {
                    $completedPublishedLessons++;
                }

                $nodeStatus = 'locked';
                if (! $isPublished) {
                    $nodeStatus = 'unpublished';
                } elseif ($isCompleted) {
                    $nodeStatus = 'completed';
                } elseif ($unitUnlocked && $this->accessControlService->isLessonUnlocked($profile, $lesson)) {
                    $nodeStatus = 'active';
                }

                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'order_number' => $lesson->order_number,
                    'node_status' => $nodeStatus,
                    'best_score' => $progress?->best_score,
                ];
            })->values();

            $activeRemedials = $this->accessControlService->activeRemedialsForUnit($profile, $unit);
            $latestFailedQuizScore = null;

            if ($activeRemedials->isNotEmpty()) {
                $latestFailedQuizScore = QuizAttempt::find($activeRemedials->first()->quiz_attempt_id)?->score;
            }

            $quiz = $unit->quiz;
            $quizStatus = 'locked';
            if (! $quiz || $quiz->status !== ContentStatus::Published) {
                $quizStatus = 'unpublished';
            } elseif ($passedQuizIds->contains($quiz->id)) {
                $quizStatus = 'completed';
            } else {
                $eligibility = $this->accessControlService->canStartUnitQuiz($profile, $unit);
                if ($eligibility['allowed']) {
                    $quizStatus = 'active';
                } elseif ($activeRemedials->contains(fn ($r) => $r->status->value !== 'completed')) {
                    $quizStatus = 'remedial_blocked';
                }
            }

            return [
                'id' => $unit->id,
                'title' => $unit->title,
                'description' => $unit->description,
                'order_number' => $unit->order_number,
                'is_unlocked' => $unitUnlocked,
                'lessons' => $lessonsPayload,
                'quiz' => $quiz ? [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'status' => $quizStatus,
                    'latest_failed_score' => $latestFailedQuizScore,
                ] : null,
                'active_remedials' => $activeRemedials->map(fn ($r) => [
                    'id' => $r->id,
                    'lesson_id' => $r->lesson_id,
                    'lesson_title' => $r->lesson?->title,
                    'lesson_order' => $r->lesson?->order_number,
                    'error_count' => $r->error_count,
                    'priority_order' => $r->priority_order,
                    'status' => $r->status->value,
                ])->values(),
            ];
        })->values();

        $totalXp = $this->gamificationService->totalXp($profile);

        return Inertia::render('Learner/LearningPath', [
            'units' => $unitsPayload,
            'summary' => [
                'total_xp' => $totalXp,
                'level' => $this->gamificationService->calculateLevelInfo($totalXp),
                'completed_lessons' => $completedPublishedLessons,
                'total_lessons' => $totalPublishedLessons,
            ],
        ]);
    }
}

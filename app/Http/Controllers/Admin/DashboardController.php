<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\UnitQuiz;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $lessons = Lesson::with('unit:id,title,order_number')->get();
        $quizzes = UnitQuiz::with('unit:id,title,order_number')->get();

        $pipelineCounts = [
            'draft' => $lessons->where('status', ContentStatus::Draft)->count()
                + $quizzes->where('status', ContentStatus::Draft)->count(),
            'pending_review' => $lessons->where('status', ContentStatus::PendingReview)->count()
                + $quizzes->where('status', ContentStatus::PendingReview)->count(),
            'changes_requested' => $lessons->where('status', ContentStatus::ChangesRequested)->count()
                + $quizzes->where('status', ContentStatus::ChangesRequested)->count(),
            'approved' => $lessons->where('status', ContentStatus::Approved)->count()
                + $quizzes->where('status', ContentStatus::Approved)->count(),
            'published' => $lessons->where('status', ContentStatus::Published)->count()
                + $quizzes->where('status', ContentStatus::Published)->count(),
        ];

        $priorityActions = collect()
            ->merge(
                $lessons->whereIn('status', [ContentStatus::Approved, ContentStatus::ChangesRequested])->map(fn (Lesson $l) => [
                    'id' => $l->id,
                    'type' => 'lesson',
                    'title' => $l->title,
                    'unit_title' => $l->unit?->title,
                    'status' => $l->status->value,
                    'href' => "/admin/lessons/{$l->id}",
                ])
            )
            ->merge(
                $quizzes->whereIn('status', [ContentStatus::Approved, ContentStatus::ChangesRequested])->map(fn (UnitQuiz $q) => [
                    'id' => $q->id,
                    'type' => 'quiz',
                    'title' => $q->title,
                    'unit_title' => $q->unit?->title,
                    'status' => $q->status->value,
                    'href' => "/admin/quizzes?unit_id={$q->unit_id}",
                ])
            )
            ->take(8)
            ->values();

        $learnerSummary = [
            'total_learners' => Profile::where('role', UserRole::Learner)->count(),
            'completed_lessons' => LearnerLessonProgress::where('status', 'completed')->count(),
            'active_validators' => Profile::where('role', UserRole::Validator)->where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'pipeline_counts' => $pipelineCounts,
            'priority_actions' => $priorityActions,
            'learner_summary' => $learnerSummary,
        ]);
    }
}

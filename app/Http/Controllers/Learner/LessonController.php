<?php

namespace App\Http\Controllers\Learner;

use App\Enums\ActivityType;
use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\LessonActivityProgress;
use App\Models\LessonAttempt;
use App\Models\LessonQuestion;
use App\Models\LessonResponse;
use App\Models\RemedialAssignment;
use App\Services\AccessControlService;
use App\Services\LearningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function __construct(
        private AccessControlService $accessControlService,
        private LearningService $learningService,
    ) {
    }

    public function show(Request $request, Lesson $lesson): Response
    {
        if ($lesson->status !== ContentStatus::Published) {
            abort(404, 'Lesson ini belum diterbitkan.');
        }

        $profile = $request->user()->profile;
        $mode = $request->query('mode') === 'remedial' ? 'remedial' : 'regular';
        $assignmentId = $request->query('assignment');
        $remedial = null;

        if ($mode === 'remedial') {
            $remedial = RemedialAssignment::where('id', $assignmentId)
                ->where('user_id', $profile->id)
                ->where('lesson_id', $lesson->id)
                ->firstOrFail();
        } else {
            if (! $this->accessControlService->isLessonUnlocked($profile, $lesson)) {
                abort(403, 'Selesaikan lesson sebelumnya terlebih dahulu.');
            }
        }

        $attempt = $this->learningService->startOrResumeAttempt($profile, $lesson, $mode, $remedial);

        $lesson->load([
            'unit:id,title,order_number',
            'activities' => fn ($q) => $q->orderBy('order_number'),
            'activities.material.vocabularies:id,pasan_word,indonesian_meaning,category',
            'activities.material.examples:id,material_id,pasan_text,indonesian_translation,order_number',
            'activities.questions' => fn ($q) => $q->select([
                'id',
                'activity_id',
                'question_type',
                'question_text',
                'question_data',
                'points',
                'order_number',
            ])->orderBy('order_number'),
        ]);

        $completedActivityIds = LessonActivityProgress::where('user_id', $profile->id)
            ->where('lesson_id', $lesson->id)
            ->where('progress_type', $mode)
            ->where('remedial_assignment_id', $remedial?->id)
            ->where('status', 'completed')
            ->pluck('activity_id')
            ->values();

        $submittedResponses = LessonResponse::where('attempt_id', $attempt->id)
            ->get(['question_id', 'response_data', 'is_correct', 'earned_points'])
            ->keyBy('question_id');

        $activitiesPayload = $lesson->activities->map(fn (LessonActivity $act) => [
            'id' => $act->id,
            'activity_type' => $act->activity_type->value,
            'title' => $act->title,
            'instruction' => $act->instruction,
            'order_number' => $act->order_number,
            'is_required' => $act->is_required,
            'material' => $act->activity_type === ActivityType::Material && $act->material ? [
                'id' => $act->material->id,
                'content' => $act->material->content,
                'explanation' => $act->material->explanation,
                'vocabularies' => $act->material->vocabularies->map(fn ($v) => [
                    'id' => $v->id,
                    'pasan_word' => $v->pasan_word,
                    'indonesian_meaning' => $v->indonesian_meaning,
                    'category' => $v->category,
                ])->values(),
                'examples' => $act->material->examples->map(fn ($ex) => [
                    'id' => $ex->id,
                    'pasan_text' => $ex->pasan_text,
                    'indonesian_translation' => $ex->indonesian_translation,
                ])->values(),
            ] : null,
            'questions' => $act->activity_type === ActivityType::Exercise ? $act->questions->map(fn (LessonQuestion $q) => [
                'id' => $q->id,
                'question_type' => $q->question_type->value,
                'question_text' => $q->question_text,
                'question_data' => $q->question_data,
                'points' => $q->points,
                'order_number' => $q->order_number,
            ])->values() : [],
        ])->values();

        return Inertia::render('Learner/LessonPlayer', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'objective' => $lesson->objective,
                'order_number' => $lesson->order_number,
                'unit_title' => $lesson->unit?->title,
                'unit_order' => $lesson->unit?->order_number,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'attempt_type' => $attempt->attempt_type,
                'remedial_assignment_id' => $attempt->remedial_assignment_id,
            ],
            'activities' => $activitiesPayload,
            'completed_activity_ids' => $completedActivityIds,
            'submitted_responses' => $submittedResponses,
            'mode' => $mode,
        ]);
    }

    public function completeActivity(Request $request, Lesson $lesson, LessonActivity $activity): RedirectResponse
    {
        $validated = $request->validate([
            'attempt_id' => ['required', 'uuid'],
        ]);

        $profile = $request->user()->profile;
        $attempt = LessonAttempt::where('id', $validated['attempt_id'])
            ->where('user_id', $profile->id)
            ->where('lesson_id', $lesson->id)
            ->firstOrFail();

        if ($activity->lesson_id !== $lesson->id) {
            abort(404);
        }

        $this->learningService->completeActivity($profile, $lesson, $activity, $attempt);

        return back();
    }

    public function storeResponse(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'attempt_id' => ['required', 'uuid'],
            'question_id' => ['required', 'uuid'],
            'response_data' => ['required', 'array'],
        ]);

        $profile = $request->user()->profile;
        $attempt = LessonAttempt::where('id', $validated['attempt_id'])
            ->where('user_id', $profile->id)
            ->where('lesson_id', $lesson->id)
            ->firstOrFail();

        $question = LessonQuestion::where('id', $validated['question_id'])
            ->whereHas('activity', fn ($q) => $q->where('lesson_id', $lesson->id))
            ->firstOrFail();

        $feedback = $this->learningService->submitResponse($attempt, $question, $validated['response_data']);

        return back()->with('lesson_feedback', [
            'question_id' => $question->id,
            ...$feedback,
        ]);
    }

    public function finish(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'attempt_id' => ['required', 'uuid'],
        ]);

        $profile = $request->user()->profile;
        $attempt = LessonAttempt::where('id', $validated['attempt_id'])
            ->where('user_id', $profile->id)
            ->where('lesson_id', $lesson->id)
            ->firstOrFail();

        $result = $this->learningService->finishAttempt($attempt);

        return back()->with('lesson_result', $result);
    }
}

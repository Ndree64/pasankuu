<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\Unit;
use App\Services\AccessControlService;
use App\Services\QuizService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function __construct(
        private AccessControlService $accessControlService,
        private QuizService $quizService,
    ) {
    }

    public function show(Request $request, Unit $unit): Response
    {
        $profile = $request->user()->profile;
        $eligibility = $this->accessControlService->canStartUnitQuiz($profile, $unit);

        if (! $eligibility['allowed']) {
            abort(422, $eligibility['reason']);
        }

        $attempt = $this->quizService->startOrResumeAttempt($profile, $unit);
        $quiz = $unit->quiz()->with([
            'questions' => fn ($q) => $q->select([
                'id',
                'quiz_id',
                'primary_lesson_id',
                'question_type',
                'question_text',
                'question_data',
                'points',
                'order_number',
            ])->orderBy('order_number'),
        ])->firstOrFail();

        return Inertia::render('Learner/QuizPlayer', [
            'unit' => [
                'id' => $unit->id,
                'title' => $unit->title,
                'order_number' => $unit->order_number,
            ],
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'passing_score' => $quiz->passing_score,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
            ],
            'questions' => $quiz->questions->map(fn (QuizQuestion $q) => [
                'id' => $q->id,
                'question_type' => $q->question_type->value,
                'question_text' => $q->question_text,
                'question_data' => $q->question_data,
                'points' => $q->points,
                'order_number' => $q->order_number,
            ])->values(),
        ]);
    }

    public function submit(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'attempt_id' => ['required', 'uuid'],
            'responses' => ['required', 'array'],
            'responses.*.question_id' => ['required', 'uuid'],
            'responses.*.response_data' => ['required', 'array'],
        ]);

        $profile = $request->user()->profile;
        $quiz = $unit->quiz()->firstOrFail();

        $attempt = QuizAttempt::where('id', $validated['attempt_id'])
            ->where('user_id', $profile->id)
            ->where('quiz_id', $quiz->id)
            ->firstOrFail();

        $result = $this->quizService->submitAttempt($attempt, $validated['responses']);

        return back()->with('quiz_result', $result);
    }
}

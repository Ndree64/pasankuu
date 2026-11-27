<?php

namespace App\Http\Controllers;

use App\Enums\ContentStatus;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\LessonQuestion;
use App\Models\QuizQuestion;
use App\Models\Unit;
use App\Services\ScoringService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PreviewController extends Controller
{
    public function __construct(private ScoringService $scoringService)
    {
    }

    public function path(Request $request): Response
    {
        $filter = $request->query('filter', 'all');
        $onlyPublished = $filter === 'published';

        $units = Unit::with([
            'lessons' => function ($q) use ($onlyPublished) {
                $q->orderBy('order_number');
                if ($onlyPublished) {
                    $q->where('status', ContentStatus::Published);
                }
            },
            'quiz',
        ])
            ->orderBy('order_number')
            ->get()
            ->map(function (Unit $unit) use ($onlyPublished) {
                $quiz = $unit->quiz;
                if ($onlyPublished && $quiz && $quiz->status !== ContentStatus::Published) {
                    $quiz = null;
                }

                return [
                    'id' => $unit->id,
                    'title' => $unit->title,
                    'description' => $unit->description,
                    'order_number' => $unit->order_number,
                    'lessons' => $unit->lessons->map(fn (Lesson $lesson) => [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'order_number' => $lesson->order_number,
                        'status' => $lesson->status->value,
                        'content_version' => $lesson->content_version,
                    ])->values(),
                    'quiz' => $quiz ? [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                        'status' => $quiz->status->value,
                    ] : null,
                ];
            })->values();

        return Inertia::render('Preview/PreviewPath', [
            'units' => $units,
            'filter' => $onlyPublished ? 'published' : 'all',
        ]);
    }

    public function showLesson(Lesson $lesson): Response
    {
        $lesson->load([
            'unit:id,title,order_number',
            'activities' => fn ($q) => $q->orderBy('order_number'),
            'activities.material.vocabularies',
            'activities.material.examples',
            'activities.questions' => fn ($q) => $q->orderBy('order_number'),
        ]);

        return Inertia::render('Preview/PreviewLesson', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'objective' => $lesson->objective,
                'status' => $lesson->status->value,
                'unit_title' => $lesson->unit?->title,
            ],
            'activities' => $lesson->activities->map(fn (LessonActivity $act) => [
                'id' => $act->id,
                'activity_type' => $act->activity_type->value,
                'title' => $act->title,
                'instruction' => $act->instruction,
                'order_number' => $act->order_number,
                'material' => $act->material ? [
                    'content' => $act->material->content,
                    'explanation' => $act->material->explanation,
                    'vocabularies' => $act->material->vocabularies->map(fn ($v) => [
                        'id' => $v->id,
                        'pasan_word' => $v->pasan_word,
                        'indonesian_meaning' => $v->indonesian_meaning,
                    ])->values(),
                    'examples' => $act->material->examples->map(fn ($ex) => [
                        'id' => $ex->id,
                        'pasan_text' => $ex->pasan_text,
                        'indonesian_translation' => $ex->indonesian_translation,
                    ])->values(),
                ] : null,
                'questions' => $act->questions->map(fn (LessonQuestion $q) => [
                    'id' => $q->id,
                    'question_type' => $q->question_type->value,
                    'question_text' => $q->question_text,
                    'question_data' => $q->question_data,
                    'points' => $q->points,
                    'order_number' => $q->order_number,
                ])->values(),
            ])->values(),
        ]);
    }

    public function evaluateLesson(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'responses' => ['array'],
        ]);

        $lesson->load('activities.questions.answerKey');
        $questions = $lesson->activities->flatMap(fn (LessonActivity $a) => $a->questions);

        $responses = $validated['responses'] ?? [];
        $maxPoints = 0.0;
        $earnedPoints = 0.0;
        $items = [];

        foreach ($questions as $question) {
            $resp = $responses[$question->id] ?? [];
            $grade = $this->scoringService->gradeQuestion($question, is_array($resp) ? $resp : []);
            $maxPoints += (float) $question->points;
            $earnedPoints += (float) $grade['earned_points'];

            $items[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'is_correct' => $grade['is_correct'],
                'earned_points' => $grade['earned_points'],
                'max_points' => (float) $question->points,
                'explanation' => $question->explanation,
            ];
        }

        $score = $questions->isEmpty() ? 100.0 : $this->scoringService->calculatePercentage($earnedPoints, $maxPoints);

        return back()->with('preview_result', [
            'score' => $score,
            'passed' => $score >= 75.0,
            'items' => $items,
        ]);
    }

    public function showQuiz(Unit $unit): Response
    {
        $quiz = $unit->quiz()->with([
            'questions' => fn ($q) => $q->orderBy('order_number'),
            'questions.primaryLesson:id,title,order_number',
        ])->firstOrFail();

        return Inertia::render('Preview/PreviewQuiz', [
            'unit' => [
                'id' => $unit->id,
                'title' => $unit->title,
                'order_number' => $unit->order_number,
            ],
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'status' => $quiz->status->value,
                'passing_score' => $quiz->passing_score,
            ],
            'questions' => $quiz->questions->map(fn (QuizQuestion $q) => [
                'id' => $q->id,
                'question_type' => $q->question_type->value,
                'question_text' => $q->question_text,
                'question_data' => $q->question_data,
                'points' => $q->points,
                'order_number' => $q->order_number,
                'primary_lesson_title' => $q->primaryLesson?->title,
            ])->values(),
        ]);
    }

    public function evaluateQuiz(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'responses' => ['array'],
        ]);

        $quiz = $unit->quiz()->with(['questions.answerKey', 'questions.primaryLesson:id,title,order_number'])->firstOrFail();
        $responses = $validated['responses'] ?? [];

        $maxPoints = 0.0;
        $earnedPoints = 0.0;
        $items = [];
        $errorsByLesson = [];

        foreach ($quiz->questions as $question) {
            $resp = $responses[$question->id] ?? [];
            $grade = $this->scoringService->gradeQuestion($question, is_array($resp) ? $resp : []);
            $maxPoints += (float) $question->points;
            $earnedPoints += (float) $grade['earned_points'];

            if (! $grade['is_correct'] && $question->primaryLesson) {
                $lid = $question->primaryLesson->id;
                if (! isset($errorsByLesson[$lid])) {
                    $errorsByLesson[$lid] = [
                        'lesson_id' => $lid,
                        'lesson_title' => $question->primaryLesson->title,
                        'order_number' => $question->primaryLesson->order_number,
                        'error_count' => 0,
                    ];
                }
                $errorsByLesson[$lid]['error_count']++;
            }

            $items[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'is_correct' => $grade['is_correct'],
                'earned_points' => $grade['earned_points'],
                'max_points' => (float) $question->points,
                'explanation' => $question->explanation,
            ];
        }

        $score = $this->scoringService->calculatePercentage($earnedPoints, $maxPoints);
        $passed = $score >= (float) $quiz->passing_score;

        $simulatedRemedials = [];
        if (! $passed) {
            $simulatedRemedials = collect($errorsByLesson)
                ->sort(fn ($a, $b) => $b['error_count'] !== $a['error_count']
                    ? $b['error_count'] <=> $a['error_count']
                    : $a['order_number'] <=> $b['order_number'])
                ->take(3)
                ->values()
                ->toArray();
        }

        return back()->with('preview_result', [
            'score' => $score,
            'passed' => $passed,
            'items' => $items,
            'simulated_remedials' => $simulatedRemedials,
        ]);
    }
}

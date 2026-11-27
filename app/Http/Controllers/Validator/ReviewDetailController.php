<?php

namespace App\Http\Controllers\Validator;

use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\LessonQuestion;
use App\Models\QuizQuestion;
use App\Models\UnitQuiz;
use App\Services\ContentValidationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewDetailController extends Controller
{
    public function __construct(private ContentValidationService $validationService)
    {
    }

    public function show(string $type, string $id): Response
    {
        if (! in_array($type, ['lesson', 'quiz'], true)) {
            abort(404);
        }

        if ($type === 'lesson') {
            $lesson = Lesson::with([
                'unit:id,title,order_number',
                'activities' => fn ($q) => $q->orderBy('order_number'),
                'activities.material.vocabularies',
                'activities.material.examples',
                'activities.questions.answerKey',
            ])->findOrFail($id);

            $review = ContentReview::where('lesson_id', $lesson->id)
                ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
                ->orderByDesc('submitted_at')
                ->firstOrFail();

            $package = [
                'id' => $lesson->id,
                'type' => 'lesson',
                'title' => $lesson->title,
                'description' => $lesson->description,
                'objective' => $lesson->objective,
                'unit_title' => $lesson->unit?->title,
                'content_version' => $lesson->content_version,
                'status' => $lesson->status->value,
                'activities' => $lesson->activities->map(fn (LessonActivity $act) => [
                    'id' => $act->id,
                    'activity_type' => $act->activity_type->value,
                    'title' => $act->title,
                    'order_number' => $act->order_number,
                    'material' => $act->material ? [
                        'content' => $act->material->content,
                        'explanation' => $act->material->explanation,
                        'vocabularies' => $act->material->vocabularies->map(fn ($v) => [
                            'id' => $v->id,
                            'pasan_word' => $v->pasan_word,
                            'indonesian_meaning' => $v->indonesian_meaning,
                            'category' => $v->category,
                            'source_note' => $v->source_note,
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
                        'answer_key' => $q->answerKey?->answer_key ?? [],
                        'explanation' => $q->explanation,
                        'points' => $q->points,
                    ])->values(),
                ])->values(),
            ];
        } else {
            $quiz = UnitQuiz::with([
                'unit:id,title,order_number',
                'questions' => fn ($q) => $q->orderBy('order_number'),
                'questions.primaryLesson:id,title,order_number',
                'questions.answerKey',
            ])->findOrFail($id);

            $review = ContentReview::where('quiz_id', $quiz->id)
                ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
                ->orderByDesc('submitted_at')
                ->firstOrFail();

            $package = [
                'id' => $quiz->id,
                'type' => 'quiz',
                'title' => $quiz->title,
                'description' => $quiz->description,
                'unit_title' => $quiz->unit?->title,
                'content_version' => $quiz->content_version,
                'status' => $quiz->status->value,
                'questions' => $quiz->questions->map(fn (QuizQuestion $q) => [
                    'id' => $q->id,
                    'primary_lesson_title' => $q->primaryLesson?->title,
                    'question_type' => $q->question_type->value,
                    'question_text' => $q->question_text,
                    'question_data' => $q->question_data,
                    'answer_key' => $q->answerKey?->answer_key ?? [],
                    'explanation' => $q->explanation,
                    'points' => $q->points,
                ])->values(),
            ];
        }

        return Inertia::render('Validator/ReviewDetail', [
            'review' => [
                'id' => $review->id,
                'status' => $review->status->value,
                'content_version' => $review->content_version,
                'review_note' => $review->review_note,
                'submitted_at' => $review->submitted_at?->toDateTimeString(),
            ],
            'package' => $package,
        ]);
    }

    public function approve(Request $request, ContentReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'review_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->validationService->approve($review, $request->user()->profile, $validated['review_note'] ?? null);

        return redirect()
            ->route('validator.queue')
            ->with('success', 'Konten disetujui. Admin kini dapat menerbitkannya ke Learner.');
    }

    public function requestChanges(Request $request, ContentReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'review_note' => ['required', 'string', 'min:3', 'max:2000'],
        ]);

        $this->validationService->requestChanges($review, $request->user()->profile, $validated['review_note']);

        return redirect()
            ->route('validator.queue')
            ->with('success', 'Permintaan revisi dan catatan validasi berhasil dikirim ke Admin.');
    }
}

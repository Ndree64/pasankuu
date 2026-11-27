<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\QuizQuestion;
use App\Models\Unit;
use App\Models\UnitQuiz;
use App\Services\ContentValidationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function __construct(private ContentValidationService $validationService)
    {
    }

    public function index(Request $request): Response
    {
        $units = Unit::orderBy('order_number')->get(['id', 'title', 'order_number']);
        $selectedUnitId = $request->query('unit_id') ?: $units->first()?->id;

        $selectedQuiz = null;
        $unitLessons = [];

        if ($selectedUnitId) {
            $selectedQuiz = UnitQuiz::with(['questions' => fn ($q) => $q->orderBy('order_number'), 'questions.answerKey', 'questions.primaryLesson:id,title,order_number'])
                ->where('unit_id', $selectedUnitId)
                ->first();

            $unitLessons = Lesson::where('unit_id', $selectedUnitId)
                ->orderBy('order_number')
                ->get(['id', 'title', 'order_number'])
                ->toArray();
        }

        return Inertia::render('Admin/Quizzes', [
            'units' => $units,
            'selected_unit_id' => $selectedUnitId,
            'unit_lessons' => $unitLessons,
            'selected_quiz' => $selectedQuiz ? [
                'id' => $selectedQuiz->id,
                'unit_id' => $selectedQuiz->unit_id,
                'title' => $selectedQuiz->title,
                'description' => $selectedQuiz->description,
                'passing_score' => $selectedQuiz->passing_score,
                'content_version' => $selectedQuiz->content_version,
                'status' => $selectedQuiz->status->value,
                'is_locked' => $selectedQuiz->status === ContentStatus::PendingReview,
                'questions' => $selectedQuiz->questions->map(fn (QuizQuestion $q) => [
                    'id' => $q->id,
                    'primary_lesson_id' => $q->primary_lesson_id,
                    'primary_lesson_title' => $q->primaryLesson?->title,
                    'question_type' => $q->question_type->value,
                    'question_text' => $q->question_text,
                    'question_data' => $q->question_data,
                    'answer_key' => $q->answerKey?->answer_key ?? [],
                    'explanation' => $q->explanation,
                    'points' => $q->points,
                    'order_number' => $q->order_number,
                ])->values(),
            ] : null,
        ]);
    }

    public function storeQuestion(Request $request, UnitQuiz $quiz): RedirectResponse
    {
        $this->validationService->prepareForEdit($quiz);

        if ($quiz->questions()->count() >= 20) {
            return back()->withErrors([
                'questions' => 'Quiz Unit maksimal memiliki 20 soal.',
            ]);
        }

        $validated = $this->validateQuizQuestion($request, $quiz->unit_id);

        DB::transaction(function () use ($quiz, $validated) {
            $nextOrder = (int) $quiz->questions()->max('order_number') + 1;
            $question = $quiz->questions()->create([
                'primary_lesson_id' => $validated['primary_lesson_id'],
                'question_type' => $validated['question_type'],
                'question_text' => $validated['question_text'],
                'question_data' => $validated['question_data'],
                'explanation' => $validated['explanation'] ?? null,
                'points' => $validated['points'],
                'order_number' => $nextOrder,
            ]);

            $question->answerKey()->create([
                'answer_key' => $validated['answer_key'],
            ]);
        });

        return back()->with('success', 'Soal quiz berhasil ditambahkan.');
    }

    public function updateQuestion(Request $request, QuizQuestion $question): RedirectResponse
    {
        $quiz = $question->quiz;
        $this->validationService->prepareForEdit($quiz);

        $validated = $this->validateQuizQuestion($request, $quiz->unit_id);

        DB::transaction(function () use ($question, $validated) {
            $question->update([
                'primary_lesson_id' => $validated['primary_lesson_id'],
                'question_type' => $validated['question_type'],
                'question_text' => $validated['question_text'],
                'question_data' => $validated['question_data'],
                'explanation' => $validated['explanation'] ?? null,
                'points' => $validated['points'],
            ]);

            $question->answerKey()->updateOrCreate(
                ['question_id' => $question->id],
                ['answer_key' => $validated['answer_key']]
            );
        });

        return back()->with('success', 'Soal quiz berhasil diperbarui.');
    }

    public function destroyQuestion(QuizQuestion $question): RedirectResponse
    {
        $quiz = $question->quiz;
        $this->validationService->prepareForEdit($quiz);

        $question->delete();

        return back()->with('success', 'Soal quiz berhasil dihapus.');
    }

    public function submitReview(Request $request, UnitQuiz $quiz): RedirectResponse
    {
        $this->validationService->submitForReview($quiz, $request->user()->profile);

        return back()->with('success', 'Quiz Unit berhasil diajukan ke antrean review Validator.');
    }

    public function cancelReview(UnitQuiz $quiz): RedirectResponse
    {
        $this->validationService->cancelReview($quiz);

        return back()->with('success', 'Pengajuan review Quiz Unit dibatalkan.');
    }

    public function publish(UnitQuiz $quiz): RedirectResponse
    {
        $this->validationService->publish($quiz);

        return back()->with('success', 'Quiz Unit berhasil diterbitkan ke Learner.');
    }

    private function validateQuizQuestion(Request $request, string $unitId): array
    {
        return $request->validate([
            'primary_lesson_id' => [
                'required',
                'uuid',
                Rule::exists('lessons', 'id')->where(fn ($q) => $q->where('unit_id', $unitId)),
            ],
            'question_type' => ['required', Rule::enum(QuestionType::class)],
            'question_text' => ['required', 'string'],
            'question_data' => ['required', 'array'],
            'answer_key' => ['required', 'array'],
            'explanation' => ['nullable', 'string'],
            'points' => ['required', 'numeric', 'min:1', 'max:100'],
        ]);
    }
}

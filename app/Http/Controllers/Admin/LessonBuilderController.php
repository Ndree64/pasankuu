<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ActivityType;
use App\Enums\ContentStatus;
use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonActivity;
use App\Models\LessonQuestion;
use App\Models\MaterialExample;
use App\Models\Vocabulary;
use App\Services\ContentValidationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LessonBuilderController extends Controller
{
    public function __construct(private ContentValidationService $validationService)
    {
    }

    public function edit(Lesson $lesson): Response
    {
        $lesson->load([
            'unit:id,title,order_number',
            'activities' => fn ($q) => $q->orderBy('order_number'),
            'activities.material.vocabularies',
            'activities.material.examples',
            'activities.questions.answerKey',
            'contentReviews' => fn ($q) => $q->with('reviewer:id,full_name')->orderByDesc('submitted_at')->limit(5),
        ]);

        $activities = $lesson->activities->map(fn (LessonActivity $activity) => [
            'id' => $activity->id,
            'activity_type' => $activity->activity_type->value,
            'title' => $activity->title,
            'instruction' => $activity->instruction,
            'order_number' => $activity->order_number,
            'is_required' => $activity->is_required,
            'material' => $activity->material ? [
                'id' => $activity->material->id,
                'content' => $activity->material->content,
                'explanation' => $activity->material->explanation,
                'estimated_duration' => $activity->material->estimated_duration,
                'vocabularies' => $activity->material->vocabularies->map(fn (Vocabulary $v) => [
                    'id' => $v->id,
                    'pasan_word' => $v->pasan_word,
                    'indonesian_meaning' => $v->indonesian_meaning,
                    'category' => $v->category,
                    'source_note' => $v->source_note,
                    'validation_status' => $v->validation_status->value,
                ])->values(),
                'examples' => $activity->material->examples->map(fn (MaterialExample $ex) => [
                    'id' => $ex->id,
                    'pasan_text' => $ex->pasan_text,
                    'indonesian_translation' => $ex->indonesian_translation,
                    'order_number' => $ex->order_number,
                ])->values(),
            ] : null,
            'questions' => $activity->questions->map(fn (LessonQuestion $q) => [
                'id' => $q->id,
                'question_type' => $q->question_type->value,
                'question_text' => $q->question_text,
                'question_data' => $q->question_data,
                'answer_key' => $q->answerKey?->answer_key ?? [],
                'explanation' => $q->explanation,
                'points' => $q->points,
                'order_number' => $q->order_number,
            ])->values(),
        ])->values();

        return Inertia::render('Admin/LessonBuilder', [
            'lesson' => [
                'id' => $lesson->id,
                'unit_id' => $lesson->unit_id,
                'unit_title' => $lesson->unit?->title,
                'unit_order' => $lesson->unit?->order_number,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'objective' => $lesson->objective,
                'order_number' => $lesson->order_number,
                'content_version' => $lesson->content_version,
                'status' => $lesson->status->value,
            ],
            'activities' => $activities,
            'is_locked' => $lesson->status === ContentStatus::PendingReview,
            'reviews' => $lesson->contentReviews->map(fn ($r) => [
                'id' => $r->id,
                'status' => $r->status->value,
                'review_note' => $r->review_note,
                'reviewer_name' => $r->reviewer?->full_name,
                'submitted_at' => $r->submitted_at?->toDateTimeString(),
                'reviewed_at' => $r->reviewed_at?->toDateTimeString(),
            ])->values(),
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->validationService->prepareForEdit($lesson);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
        ]);

        $lesson->update($validated);

        return back()->with('success', 'Identitas lesson berhasil diperbarui.');
    }

    public function storeActivity(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->validationService->prepareForEdit($lesson);

        $validated = $request->validate([
            'activity_type' => ['required', Rule::enum(ActivityType::class)],
            'title' => ['required', 'string', 'max:200'],
            'instruction' => ['nullable', 'string'],
            'is_required' => ['boolean'],
        ]);

        DB::transaction(function () use ($lesson, $validated) {
            $nextOrder = (int) $lesson->activities()->max('order_number') + 1;
            $activity = $lesson->activities()->create([
                'activity_type' => $validated['activity_type'],
                'title' => $validated['title'],
                'instruction' => $validated['instruction'] ?? null,
                'order_number' => $nextOrder,
                'is_required' => $validated['is_required'] ?? true,
            ]);

            if ($activity->activity_type === ActivityType::Material) {
                $activity->material()->create([
                    'content' => '',
                    'explanation' => null,
                    'estimated_duration' => 60,
                ]);
            }
        });

        return back()->with('success', 'Aktivitas baru berhasil ditambahkan.');
    }

    public function destroyActivity(LessonActivity $activity): RedirectResponse
    {
        $lesson = $activity->lesson;
        $this->validationService->prepareForEdit($lesson);

        DB::transaction(function () use ($activity, $lesson) {
            $activity->delete();
            $remaining = $lesson->activities()->orderBy('order_number')->get();
            foreach ($remaining as $index => $item) {
                $item->update(['order_number' => $index + 1]);
            }
        });

        return back()->with('success', 'Aktivitas berhasil dihapus.');
    }

    public function reorderActivities(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->validationService->prepareForEdit($lesson);

        $validated = $request->validate([
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['required', 'uuid'],
        ]);

        DB::transaction(function () use ($lesson, $validated) {
            foreach ($validated['ordered_ids'] as $index => $activityId) {
                $lesson->activities()
                    ->where('id', $activityId)
                    ->update(['order_number' => $index + 1]);
            }
        });

        return back()->with('success', 'Urutan aktivitas berhasil disimpan.');
    }

    public function updateMaterial(Request $request, LessonActivity $activity): RedirectResponse
    {
        $lesson = $activity->lesson;
        $this->validationService->prepareForEdit($lesson);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'instruction' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'estimated_duration' => ['nullable', 'integer', 'min:10'],
            'vocabularies' => ['array'],
            'vocabularies.*.pasan_word' => ['required', 'string', 'max:200'],
            'vocabularies.*.indonesian_meaning' => ['required', 'string', 'max:255'],
            'vocabularies.*.category' => ['nullable', 'string', 'max:100'],
            'vocabularies.*.source_note' => ['nullable', 'string'],
            'examples' => ['array'],
            'examples.*.pasan_text' => ['required', 'string'],
            'examples.*.indonesian_translation' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($activity, $lesson, $validated) {
            if (! empty($validated['title'])) {
                $activity->update([
                    'title' => $validated['title'],
                    'instruction' => $validated['instruction'] ?? $activity->instruction,
                ]);
            }

            $material = $activity->material()->updateOrCreate(
                ['activity_id' => $activity->id],
                [
                    'content' => $validated['content'],
                    'explanation' => $validated['explanation'] ?? null,
                    'estimated_duration' => $validated['estimated_duration'] ?? 60,
                ]
            );

            $syncVocabs = [];
            foreach ($validated['vocabularies'] ?? [] as $index => $vocabData) {
                $vocab = Vocabulary::firstOrCreate(
                    [
                        'pasan_word' => trim($vocabData['pasan_word']),
                        'indonesian_meaning' => trim($vocabData['indonesian_meaning']),
                    ],
                    [
                        'unit_id' => $lesson->unit_id,
                        'first_lesson_id' => $lesson->id,
                        'category' => $vocabData['category'] ?? null,
                        'source_note' => $vocabData['source_note'] ?? null,
                        'validation_status' => ContentStatus::Draft,
                    ]
                );
                $syncVocabs[$vocab->id] = ['order_number' => $index + 1];
            }
            $material->vocabularies()->sync($syncVocabs);

            $material->examples()->delete();
            foreach ($validated['examples'] ?? [] as $index => $exampleData) {
                $material->examples()->create([
                    'pasan_text' => $exampleData['pasan_text'],
                    'indonesian_translation' => $exampleData['indonesian_translation'],
                    'order_number' => $index + 1,
                ]);
            }
        });

        return back()->with('success', 'Materi, kosakata, dan contoh kalimat berhasil disimpan.');
    }

    public function storeQuestion(Request $request, LessonActivity $activity): RedirectResponse
    {
        $lesson = $activity->lesson;
        $this->validationService->prepareForEdit($lesson);

        $validated = $this->validateQuestion($request);

        DB::transaction(function () use ($activity, $validated) {
            $nextOrder = (int) $activity->questions()->max('order_number') + 1;
            $question = $activity->questions()->create([
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

        return back()->with('success', 'Soal latihan berhasil ditambahkan.');
    }

    public function updateQuestion(Request $request, LessonQuestion $question): RedirectResponse
    {
        $lesson = $question->activity->lesson;
        $this->validationService->prepareForEdit($lesson);

        $validated = $this->validateQuestion($request);

        DB::transaction(function () use ($question, $validated) {
            $question->update([
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

        return back()->with('success', 'Soal latihan berhasil diperbarui.');
    }

    public function destroyQuestion(LessonQuestion $question): RedirectResponse
    {
        $lesson = $question->activity->lesson;
        $this->validationService->prepareForEdit($lesson);

        $question->delete();

        return back()->with('success', 'Soal latihan berhasil dihapus.');
    }

    public function submitReview(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->validationService->submitForReview($lesson, $request->user()->profile);

        return back()->with('success', 'Lesson berhasil diajukan ke antrean review Validator.');
    }

    public function cancelReview(Lesson $lesson): RedirectResponse
    {
        $this->validationService->cancelReview($lesson);

        return back()->with('success', 'Pengajuan review dibatalkan. Lesson kembali ke status Draf.');
    }

    public function publish(Lesson $lesson): RedirectResponse
    {
        $this->validationService->publish($lesson);

        return back()->with('success', 'Lesson berhasil diterbitkan ke Learner.');
    }

    private function validateQuestion(Request $request): array
    {
        return $request->validate([
            'question_type' => ['required', Rule::enum(QuestionType::class)],
            'question_text' => ['required', 'string'],
            'question_data' => ['required', 'array'],
            'answer_key' => ['required', 'array'],
            'explanation' => ['nullable', 'string'],
            'points' => ['required', 'numeric', 'min:1', 'max:100'],
        ]);
    }
}

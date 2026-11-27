<?php

namespace App\Services;

use App\Enums\ContentStatus;
use App\Enums\ReviewStatus;
use App\Models\ContentReview;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\UnitQuiz;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContentValidationService
{
    public function ensureEditable(Lesson|UnitQuiz $model): void
    {
        if ($model->status === ContentStatus::PendingReview) {
            throw ValidationException::withMessages([
                'status' => 'Konten sedang dalam antrean review Validator dan terkunci dari perubahan.',
            ]);
        }
    }

    public function bumpVersionIfPublished(Lesson|UnitQuiz $model): void
    {
        if ($model->status !== ContentStatus::Published) {
            return;
        }

        DB::transaction(function () use ($model) {
            $model->update([
                'content_version' => $model->content_version + 1,
                'status' => ContentStatus::Draft,
            ]);
        });
    }

    public function prepareForEdit(Lesson|UnitQuiz $model): void
    {
        $this->ensureEditable($model);
        $this->bumpVersionIfPublished($model);
    }

    public function submitForReview(Lesson|UnitQuiz $model, Profile $admin): ContentReview
    {
        if ($model->status === ContentStatus::PendingReview) {
            throw ValidationException::withMessages([
                'status' => 'Konten sudah berada di antrean review.',
            ]);
        }

        if ($model instanceof UnitQuiz) {
            $questions = $model->questions()->with('primaryLesson:id,unit_id')->get();
            $count = $questions->count();
            if ($count < 15 || $count > 20) {
                throw ValidationException::withMessages([
                    'questions' => "Quiz Unit wajib memiliki 15 sampai 20 soal sebelum diajukan (saat ini: {$count} soal).",
                ]);
            }

            $invalidLesson = $questions->first(fn ($q) => ! $q->primaryLesson || $q->primaryLesson->unit_id !== $model->unit_id);
            if ($invalidLesson) {
                throw ValidationException::withMessages([
                    'primary_lesson_id' => 'Setiap soal quiz wajib dipetakan ke satu lesson di unit yang sama.',
                ]);
            }
        }

        return DB::transaction(function () use ($model, $admin) {
            $model->update(['status' => ContentStatus::PendingReview]);

            if ($model instanceof Lesson) {
                $this->syncLessonVocabulariesStatus($model, ContentStatus::PendingReview);
            }

            return ContentReview::create([
                'lesson_id' => $model instanceof Lesson ? $model->id : null,
                'quiz_id' => $model instanceof UnitQuiz ? $model->id : null,
                'content_version' => $model->content_version,
                'status' => ReviewStatus::Pending,
                'submitted_by' => $admin->id,
                'submitted_at' => now(),
            ]);
        });
    }

    public function cancelReview(Lesson|UnitQuiz $model): void
    {
        if ($model->status !== ContentStatus::PendingReview) {
            throw ValidationException::withMessages([
                'status' => 'Hanya konten berstatus Menunggu Review yang pengajuannya dapat dibatalkan.',
            ]);
        }

        DB::transaction(function () use ($model) {
            $model->update(['status' => ContentStatus::Draft]);

            $column = $model instanceof Lesson ? 'lesson_id' : 'quiz_id';
            ContentReview::where($column, $model->id)
                ->where('status', ReviewStatus::Pending)
                ->update([
                    'status' => ReviewStatus::ChangesRequested,
                    'review_note' => 'Pengajuan review dibatalkan oleh Admin.',
                    'reviewed_at' => now(),
                ]);

            if ($model instanceof Lesson) {
                $this->syncLessonVocabulariesStatus($model, ContentStatus::Draft, ContentStatus::PendingReview);
            }
        });
    }

    public function approve(ContentReview $review, Profile $validator, ?string $note = null): void
    {
        if ($review->status !== ReviewStatus::Pending) {
            throw ValidationException::withMessages([
                'review' => 'Pengajuan review ini sudah diproses sebelumnya.',
            ]);
        }

        DB::transaction(function () use ($review, $validator, $note) {
            $review->update([
                'status' => ReviewStatus::Approved,
                'reviewed_by' => $validator->id,
                'review_note' => $note ?: null,
                'reviewed_at' => now(),
            ]);

            $target = $review->lesson ?? $review->quiz;
            $target?->update(['status' => ContentStatus::Approved]);

            if ($review->lesson) {
                $this->syncLessonVocabulariesStatus($review->lesson, ContentStatus::Approved);
            }
        });
    }

    public function requestChanges(ContentReview $review, Profile $validator, string $note): void
    {
        if ($review->status !== ReviewStatus::Pending) {
            throw ValidationException::withMessages([
                'review' => 'Pengajuan review ini sudah diproses sebelumnya.',
            ]);
        }

        if (trim($note) === '') {
            throw ValidationException::withMessages([
                'review_note' => 'Catatan revisi wajib diisi saat meminta perbaikan.',
            ]);
        }

        DB::transaction(function () use ($review, $validator, $note) {
            $review->update([
                'status' => ReviewStatus::ChangesRequested,
                'reviewed_by' => $validator->id,
                'review_note' => trim($note),
                'reviewed_at' => now(),
            ]);

            $target = $review->lesson ?? $review->quiz;
            $target?->update(['status' => ContentStatus::ChangesRequested]);

            if ($review->lesson) {
                $this->syncLessonVocabulariesStatus($review->lesson, ContentStatus::ChangesRequested, ContentStatus::PendingReview);
            }
        });
    }

    public function publish(Lesson|UnitQuiz $model): void
    {
        if ($model->status !== ContentStatus::Approved) {
            throw ValidationException::withMessages([
                'status' => 'Hanya konten yang sudah Disetujui Validator yang boleh diterbitkan.',
            ]);
        }

        DB::transaction(function () use ($model) {
            $model->update(['status' => ContentStatus::Published]);

            if ($model instanceof Lesson) {
                $this->syncLessonVocabulariesStatus($model, ContentStatus::Approved);
            }
        });
    }

    private function syncLessonVocabulariesStatus(
        Lesson $lesson,
        ContentStatus $targetStatus,
        ?ContentStatus $onlyFrom = null
    ): void {
        $lesson->loadMissing('activities.material.vocabularies');

        foreach ($lesson->activities as $activity) {
            if (! $activity->material) {
                continue;
            }
            foreach ($activity->material->vocabularies as $vocab) {
                if ($onlyFrom !== null && $vocab->validation_status !== $onlyFrom) {
                    continue;
                }
                if ($vocab->validation_status === ContentStatus::Approved && $targetStatus !== ContentStatus::Approved) {
                    continue;
                }
                $vocab->update(['validation_status' => $targetStatus]);
            }
        }
    }
}

<?php

namespace App\Services;

use App\Enums\RemedialStatus;
use App\Models\QuizAttempt;
use App\Models\RemedialAssignment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    public function generateFromFailedQuiz(QuizAttempt $quizAttempt): Collection
    {
        $wrongResponses = $quizAttempt->responses()
            ->with('question.primaryLesson:id,order_number,content_version,title')
            ->where('is_correct', false)
            ->get();

        if ($wrongResponses->isEmpty()) {
            return collect();
        }

        $grouped = $wrongResponses
            ->groupBy(fn ($response) => $response->question->primary_lesson_id)
            ->map(function (Collection $items, string $lessonId) {
                $lesson = $items->first()->question->primaryLesson;

                return [
                    'lesson_id' => $lessonId,
                    'lesson_order' => $lesson?->order_number ?? 999,
                    'content_version' => $lesson?->content_version ?? 1,
                    'error_count' => $items->count(),
                ];
            })
            ->sort(function (array $a, array $b) {
                if ($a['error_count'] !== $b['error_count']) {
                    return $b['error_count'] <=> $a['error_count'];
                }

                return $a['lesson_order'] <=> $b['lesson_order'];
            })
            ->take(3)
            ->values();

        return DB::transaction(function () use ($quizAttempt, $grouped) {
            $assignments = collect();

            foreach ($grouped as $index => $item) {
                $assignment = RemedialAssignment::create([
                    'user_id' => $quizAttempt->user_id,
                    'quiz_attempt_id' => $quizAttempt->id,
                    'lesson_id' => $item['lesson_id'],
                    'error_count' => $item['error_count'],
                    'priority_order' => $index + 1,
                    'content_version' => $item['content_version'],
                    'status' => RemedialStatus::Pending,
                    'created_at' => now(),
                ]);

                $assignments->push($assignment);
            }

            return $assignments;
        });
    }
}

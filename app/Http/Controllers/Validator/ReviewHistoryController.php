<?php

namespace App\Http\Controllers\Validator;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use Inertia\Inertia;
use Inertia\Response;

class ReviewHistoryController extends Controller
{
    public function index(): Response
    {
        $history = ContentReview::with([
            'lesson.unit:id,title',
            'quiz.unit:id,title',
            'reviewer:id,full_name',
        ])
            ->where('status', '!=', ReviewStatus::Pending)
            ->orderByDesc('reviewed_at')
            ->get()
            ->map(function (ContentReview $review) {
                $isLesson = $review->lesson_id !== null;
                $target = $isLesson ? $review->lesson : $review->quiz;

                return [
                    'id' => $review->id,
                    'type' => $isLesson ? 'lesson' : 'quiz',
                    'target_id' => $target?->id,
                    'title' => $target?->title ?? '-',
                    'unit_title' => $target?->unit?->title ?? '-',
                    'content_version' => $review->content_version,
                    'status' => $review->status->value,
                    'review_note' => $review->review_note,
                    'reviewer_name' => $review->reviewer?->full_name,
                    'reviewed_at' => $review->reviewed_at?->toDateTimeString(),
                ];
            })->values();

        return Inertia::render('Validator/ReviewHistory', [
            'history' => $history,
        ]);
    }
}

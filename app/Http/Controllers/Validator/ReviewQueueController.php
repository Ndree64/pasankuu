<?php

namespace App\Http\Controllers\Validator;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\ContentReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewQueueController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'pending');

        $counts = [
            'pending' => ContentReview::where('status', ReviewStatus::Pending)->count(),
            'approved' => ContentReview::where('status', ReviewStatus::Approved)->count(),
            'changes_requested' => ContentReview::where('status', ReviewStatus::ChangesRequested)->count(),
            'total' => ContentReview::count(),
        ];

        $query = ContentReview::with([
            'lesson.unit:id,title,order_number',
            'quiz.unit:id,title,order_number',
            'submitter:id,full_name',
        ])->orderByDesc('submitted_at');

        if (in_array($statusFilter, ['pending', 'approved', 'changes_requested'], true)) {
            $query->where('status', $statusFilter);
        }

        $reviews = $query->get()->map(function (ContentReview $review) {
            $isLesson = $review->lesson_id !== null;
            $target = $isLesson ? $review->lesson : $review->quiz;

            return [
                'id' => $review->id,
                'type' => $isLesson ? 'lesson' : 'quiz',
                'target_id' => $target?->id,
                'title' => $target?->title ?? '-',
                'unit_title' => $target?->unit?->title ?? '-',
                'unit_order' => $target?->unit?->order_number,
                'content_version' => $review->content_version,
                'status' => $review->status->value,
                'submitted_by' => $review->submitter?->full_name,
                'submitted_at' => $review->submitted_at?->toDateTimeString(),
                'review_note' => $review->review_note,
            ];
        })->values();

        return Inertia::render('Validator/ReviewQueue', [
            'counts' => $counts,
            'reviews' => $reviews,
            'active_filter' => $statusFilter,
        ]);
    }
}

<?php

namespace App\Services;

use App\Enums\AttemptStatus;
use App\Enums\ContentStatus;
use App\Enums\RemedialStatus;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\QuizAttempt;
use App\Models\RemedialAssignment;
use App\Models\Unit;
use App\Models\UnitUnlock;

class AccessControlService
{
    public function isUnitUnlocked(Profile $profile, Unit $unit): bool
    {
        return UnitUnlock::where('user_id', $profile->id)
            ->where('unit_id', $unit->id)
            ->exists();
    }

    public function isLessonCompleted(Profile $profile, Lesson $lesson): bool
    {
        return LearnerLessonProgress::where('user_id', $profile->id)
            ->where('lesson_id', $lesson->id)
            ->where('status', 'completed')
            ->where('completed_content_version', $lesson->content_version)
            ->exists();
    }

    public function isLessonUnlocked(Profile $profile, Lesson $lesson): bool
    {
        if ($lesson->status !== ContentStatus::Published) {
            return false;
        }

        $unit = $lesson->unit;
        if (! $unit || ! $this->isUnitUnlocked($profile, $unit)) {
            return false;
        }

        if ($lesson->order_number <= 1) {
            return true;
        }

        $previousLesson = Lesson::where('unit_id', $unit->id)
            ->where('order_number', '<', $lesson->order_number)
            ->orderByDesc('order_number')
            ->first();

        if (! $previousLesson) {
            return true;
        }

        return $this->isLessonCompleted($profile, $previousLesson);
    }

    public function activeRemedialsForUnit(Profile $profile, Unit $unit)
    {
        $quiz = $unit->quiz;
        if (! $quiz) {
            return collect();
        }

        $latestAttempt = QuizAttempt::where('user_id', $profile->id)
            ->where('quiz_id', $quiz->id)
            ->whereIn('status', [AttemptStatus::Passed, AttemptStatus::Failed])
            ->orderByDesc('attempt_number')
            ->first();

        if (! $latestAttempt || $latestAttempt->status === AttemptStatus::Passed) {
            return collect();
        }

        return RemedialAssignment::with('lesson:id,title,order_number,unit_id')
            ->where('user_id', $profile->id)
            ->where('quiz_attempt_id', $latestAttempt->id)
            ->orderBy('priority_order')
            ->get();
    }

    public function canStartUnitQuiz(Profile $profile, Unit $unit): array
    {
        $quiz = $unit->quiz;
        if (! $quiz || $quiz->status !== ContentStatus::Published) {
            return ['allowed' => false, 'reason' => 'Quiz Unit belum diterbitkan.'];
        }

        if (! $this->isUnitUnlocked($profile, $unit)) {
            return ['allowed' => false, 'reason' => 'Unit ini masih terkunci.'];
        }

        $lessons = $unit->lessons()->orderBy('order_number')->get();
        if ($lessons->count() < 5) {
            return ['allowed' => false, 'reason' => 'Seluruh 5 lesson dalam unit harus tersedia.'];
        }

        foreach ($lessons as $lesson) {
            if ($lesson->status !== ContentStatus::Published || ! $this->isLessonCompleted($profile, $lesson)) {
                return ['allowed' => false, 'reason' => 'Selesaikan seluruh 5 lesson pada unit ini terlebih dahulu.'];
            }
        }

        $activeRemedials = $this->activeRemedialsForUnit($profile, $unit);
        $hasPendingRemedial = $activeRemedials->contains(fn (RemedialAssignment $r) => $r->status !== RemedialStatus::Completed);

        if ($hasPendingRemedial) {
            return ['allowed' => false, 'reason' => 'Selesaikan seluruh lesson remedial yang direkomendasikan sebelum mengulang Quiz Unit.'];
        }

        return ['allowed' => true, 'reason' => null];
    }
}

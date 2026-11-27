<?php

namespace App\Services;

use App\Enums\AttemptStatus;
use App\Enums\RemedialStatus;
use App\Enums\XpActivityType;
use App\Models\Badge;
use App\Models\LearnerLessonProgress;
use App\Models\Profile;
use App\Models\QuizAttempt;
use App\Models\RemedialAssignment;
use App\Models\Unit;
use App\Models\UserBadge;
use App\Models\XpTransaction;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    public const XP_LESSON = 10;
    public const XP_REMEDIAL = 5;
    public const XP_QUIZ = 25;

    private const LEVEL_TIERS = [
        ['level' => 1, 'title' => 'Pemula Pasan', 'min_xp' => 0, 'next_xp' => 50],
        ['level' => 2, 'title' => 'Penjelajah Kata', 'min_xp' => 50, 'next_xp' => 125],
        ['level' => 3, 'title' => 'Perangkai Kalimat', 'min_xp' => 125, 'next_xp' => 225],
        ['level' => 4, 'title' => 'Penutur Muda', 'min_xp' => 225, 'next_xp' => 350],
        ['level' => 5, 'title' => 'Penjaga Warisan', 'min_xp' => 350, 'next_xp' => null],
    ];

    public function awardXpOnce(Profile $profile, XpActivityType $activityType, string $referenceId, int $xpAmount): int
    {
        return DB::transaction(function () use ($profile, $activityType, $referenceId, $xpAmount) {
            $existing = XpTransaction::where('user_id', $profile->id)
                ->where('activity_type', $activityType)
                ->where('reference_id', $referenceId)
                ->first();

            if ($existing) {
                return 0;
            }

            XpTransaction::create([
                'user_id' => $profile->id,
                'activity_type' => $activityType,
                'reference_id' => $referenceId,
                'xp_amount' => $xpAmount,
                'created_at' => now(),
            ]);

            return $xpAmount;
        });
    }

    public function totalXp(Profile $profile): int
    {
        return (int) XpTransaction::where('user_id', $profile->id)->sum('xp_amount');
    }

    public function calculateLevelInfo(int $totalXp): array
    {
        $activeTier = self::LEVEL_TIERS[0];

        foreach (self::LEVEL_TIERS as $tier) {
            if ($totalXp >= $tier['min_xp']) {
                $activeTier = $tier;
            }
        }

        $nextXp = $activeTier['next_xp'];
        $progressPercent = 100;

        if ($nextXp !== null && $nextXp > $activeTier['min_xp']) {
            $span = $nextXp - $activeTier['min_xp'];
            $gained = $totalXp - $activeTier['min_xp'];
            $progressPercent = min(100, max(0, (int) round(($gained / $span) * 100)));
        }

        return [
            'level' => $activeTier['level'],
            'title' => $activeTier['title'],
            'total_xp' => $totalXp,
            'current_min_xp' => $activeTier['min_xp'],
            'next_level_xp' => $nextXp,
            'progress_percent' => $progressPercent,
        ];
    }

    public function checkAndAwardBadges(Profile $profile): array
    {
        $completedLessonsCount = LearnerLessonProgress::where('user_id', $profile->id)
            ->where('status', 'completed')
            ->count();

        $passedQuizIds = QuizAttempt::where('user_id', $profile->id)
            ->where('status', AttemptStatus::Passed)
            ->pluck('quiz_id')
            ->unique();

        $unit1QuizId = Unit::where('order_number', 1)->first()?->quiz?->id;
        $totalUnits = Unit::count();
        $completedRemedialsCount = RemedialAssignment::where('user_id', $profile->id)
            ->where('status', RemedialStatus::Completed)
            ->count();
        $totalXp = $this->totalXp($profile);

        $eligibleCodes = [];
        if ($completedLessonsCount >= 1) {
            $eligibleCodes[] = 'first_lesson';
        }
        if ($unit1QuizId && $passedQuizIds->contains($unit1QuizId)) {
            $eligibleCodes[] = 'first_unit';
        }
        if ($completedRemedialsCount >= 1) {
            $eligibleCodes[] = 'comeback_learner';
        }
        if ($totalXp >= 100) {
            $eligibleCodes[] = 'xp_collector_100';
        }
        if ($totalUnits > 0 && $passedQuizIds->count() >= $totalUnits) {
            $eligibleCodes[] = 'curriculum_master';
        }

        if (empty($eligibleCodes)) {
            return [];
        }

        $awarded = [];
        $badges = Badge::whereIn('code', $eligibleCodes)->get();

        foreach ($badges as $badge) {
            $exists = UserBadge::where('user_id', $profile->id)
                ->where('badge_id', $badge->id)
                ->exists();

            if (! $exists) {
                UserBadge::create([
                    'user_id' => $profile->id,
                    'badge_id' => $badge->id,
                    'awarded_at' => now(),
                ]);

                $awarded[] = [
                    'code' => $badge->code,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                ];
            }
        }

        return $awarded;
    }
}

<?php

namespace App\Http\Controllers\Learner;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(private GamificationService $gamificationService)
    {
    }

    public function index(Request $request): Response
    {
        $currentProfile = $request->user()->profile;

        $learners = Profile::withSum('xpTransactions as total_xp', 'xp_amount')
            ->where('role', UserRole::Learner)
            ->where('is_active', true)
            ->get()
            ->sort(function (Profile $a, Profile $b) {
                $xpA = (int) ($a->total_xp ?? 0);
                $xpB = (int) ($b->total_xp ?? 0);
                if ($xpA !== $xpB) {
                    return $xpB <=> $xpA;
                }

                return strcmp($a->full_name, $b->full_name);
            })
            ->values();

        $rankings = $learners->map(function (Profile $profile, int $index) use ($currentProfile) {
            $totalXp = (int) ($profile->total_xp ?? 0);
            $levelInfo = $this->gamificationService->calculateLevelInfo($totalXp);

            return [
                'rank' => $index + 1,
                'user_id' => $profile->id,
                'full_name' => $profile->full_name,
                'total_xp' => $totalXp,
                'level' => $levelInfo['level'],
                'level_title' => $levelInfo['title'],
                'is_current_user' => $profile->id === $currentProfile->id,
            ];
        })->values();

        return Inertia::render('Learner/Leaderboard', [
            'podium' => $rankings->take(3)->values(),
            'rankings' => $rankings,
        ]);
    }
}
